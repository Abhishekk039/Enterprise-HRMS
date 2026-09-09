package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.LeaveCreateRequest;
import com.abhishek.hrms.dto.LeaveResponse;
import com.abhishek.hrms.dto.LeaveStatusUpdateRequest;
import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.entity.*;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.LeaveRequestRepository;
import com.abhishek.hrms.repository.UserRepository;
import com.abhishek.hrms.service.LeaveService;
import com.abhishek.hrms.specification.LeaveSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public LeaveServiceImpl(LeaveRequestRepository leaveRepository,
                            EmployeeRepository employeeRepository,
                            UserRepository userRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaveResponse> getLeaves(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            LeaveStatus status,
            LeaveType leaveType,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<LeaveRequest> spec = LeaveSpecification.filter(employeeId, status, leaveType, fromDate, toDate);

        Page<LeaveRequest> leavePage = leaveRepository.findAll(spec, pageable);

        List<LeaveResponse> content = leavePage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                leavePage.getNumber(),
                leavePage.getSize(),
                leavePage.getTotalElements(),
                leavePage.getTotalPages(),
                leavePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveResponse getLeaveById(Long id) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));
        return mapToResponse(leave);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeavesByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }
        return leaveRepository.findByEmployeeIdOrderByStartDateDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveResponse applyLeave(LeaveCreateRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        boolean overlapping = leaveRepository.hasOverlappingLeave(
                employee.getId(),
                request.getStartDate(),
                request.getEndDate(),
                Arrays.asList(LeaveStatus.PENDING, LeaveStatus.APPROVED)
        );

        if (overlapping) {
            throw new DuplicateResourceException("Employee already has a pending or approved leave in this date range");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setTotalDays(totalDays);
        leave.setReason(request.getReason());
        leave.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRepository.save(leave);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LeaveResponse updateLeaveStatus(Long id, LeaveStatusUpdateRequest request, String reviewerUsername) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only PENDING leave requests can be approved or rejected");
        }

        User reviewer = null;
        if (reviewerUsername != null) {
            reviewer = userRepository.findByUsername(reviewerUsername).orElse(null);
        }

        leave.setStatus(request.getStatus());
        leave.setRejectionReason(request.getRejectionReason());
        leave.setReviewedBy(reviewer);
        leave.setReviewedAt(LocalDateTime.now());

        LeaveRequest updated = leaveRepository.save(leave);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void cancelLeave(Long id) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Only PENDING leave requests can be cancelled");
        }

        leave.setStatus(LeaveStatus.CANCELLED);
        leaveRepository.save(leave);
    }

    private LeaveResponse mapToResponse(LeaveRequest leave) {
        LeaveResponse response = new LeaveResponse();
        response.setId(leave.getId());
        response.setEmployeeId(leave.getEmployee().getId());
        response.setEmployeeCode(leave.getEmployee().getEmployeeCode());
        response.setEmployeeName(leave.getEmployee().getFirstName() + " " +
                (leave.getEmployee().getLastName() != null ? leave.getEmployee().getLastName() : ""));
        response.setDepartmentName(leave.getEmployee().getDepartment() != null
                ? leave.getEmployee().getDepartment().getName() : null);
        response.setLeaveType(leave.getLeaveType());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setTotalDays(leave.getTotalDays());
        response.setReason(leave.getReason());
        response.setStatus(leave.getStatus());
        response.setRejectionReason(leave.getRejectionReason());
        if (leave.getReviewedBy() != null) {
            response.setReviewedByUsername(leave.getReviewedBy().getUsername());
        }
        response.setReviewedAt(leave.getReviewedAt());
        response.setCreatedAt(leave.getCreatedAt());
        response.setUpdatedAt(leave.getUpdatedAt());
        return response;
    }
}
