package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.*;
import com.abhishek.hrms.entity.Attendance;
import com.abhishek.hrms.entity.AttendanceStatus;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.AttendanceRepository;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.service.AttendanceService;
import com.abhishek.hrms.specification.AttendanceSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository,
                                 EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getAttendances(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            AttendanceStatus status
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Attendance> spec = AttendanceSpecification.filter(employeeId, date, fromDate, toDate, status);

        Page<Attendance> attendancePage = attendanceRepository.findAll(spec, pageable);

        List<AttendanceResponse> content = attendancePage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                attendancePage.getNumber(),
                attendancePage.getSize(),
                attendancePage.getTotalElements(),
                attendancePage.getTotalPages(),
                attendancePage.isLast()
        );
    }

    @Override
    @Transactional
    public AttendanceResponse checkIn(AttendanceCheckInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today);

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            if (attendance.getCheckInTime() != null) {
                throw new DuplicateResourceException("Employee already checked in today at " + attendance.getCheckInTime());
            }
            attendance.setCheckInTime(LocalTime.now());
            if (request.getNotes() != null) {
                attendance.setNotes(request.getNotes());
            }
        } else {
            attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(today);
            attendance.setCheckInTime(LocalTime.now());
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendance.setNotes(request.getNotes());
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(AttendanceCheckOutRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new ResourceNotFoundException("No check-in found for today. Please check in first."));

        if (attendance.getCheckOutTime() != null) {
            throw new DuplicateResourceException("Employee already checked out today at " + attendance.getCheckOutTime());
        }

        LocalTime checkOutTime = LocalTime.now();
        attendance.setCheckOutTime(checkOutTime);

        if (attendance.getCheckInTime() != null) {
            Duration duration = Duration.between(attendance.getCheckInTime(), checkOutTime);
            double hours = duration.toMinutes() / 60.0;
            attendance.setWorkHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));

            if (hours < 4.0) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            }
        }

        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AttendanceResponse recordAttendance(AttendanceRecordRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), request.getDate())
                .orElse(new Attendance());

        attendance.setEmployee(employee);
        attendance.setDate(request.getDate());
        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        if (request.getStatus() != null) {
            attendance.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }

        if (request.getCheckInTime() != null && request.getCheckOutTime() != null) {
            Duration duration = Duration.between(request.getCheckInTime(), request.getCheckOutTime());
            double hours = duration.toMinutes() / 60.0;
            attendance.setWorkHours(BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP));
        }

        Attendance saved = attendanceRepository.save(attendance);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getTodayAttendance(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }

        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEmployeeAttendanceHistory(Long employeeId, LocalDate startDate, LocalDate endDate) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }

        return attendanceRepository.findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployee().getId());
        response.setEmployeeCode(attendance.getEmployee().getEmployeeCode());
        response.setEmployeeName(attendance.getEmployee().getFirstName() + " " +
                (attendance.getEmployee().getLastName() != null ? attendance.getEmployee().getLastName() : ""));
        response.setDepartmentName(attendance.getEmployee().getDepartment() != null
                ? attendance.getEmployee().getDepartment().getName() : null);
        response.setDate(attendance.getDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setWorkHours(attendance.getWorkHours());
        response.setStatus(attendance.getStatus());
        response.setNotes(attendance.getNotes());
        response.setCreatedAt(attendance.getCreatedAt());
        response.setUpdatedAt(attendance.getUpdatedAt());
        return response;
    }
}
