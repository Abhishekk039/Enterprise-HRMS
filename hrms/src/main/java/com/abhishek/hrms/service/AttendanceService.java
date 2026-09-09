package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.*;
import com.abhishek.hrms.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    PagedResponse<AttendanceResponse> getAttendances(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            AttendanceStatus status
    );

    AttendanceResponse checkIn(AttendanceCheckInRequest request);

    AttendanceResponse checkOut(AttendanceCheckOutRequest request);

    AttendanceResponse recordAttendance(AttendanceRecordRequest request);

    AttendanceResponse getTodayAttendance(Long employeeId);

    List<AttendanceResponse> getEmployeeAttendanceHistory(Long employeeId, LocalDate startDate, LocalDate endDate);
}
