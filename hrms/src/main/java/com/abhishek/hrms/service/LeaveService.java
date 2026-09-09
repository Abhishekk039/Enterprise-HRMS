package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.LeaveCreateRequest;
import com.abhishek.hrms.dto.LeaveResponse;
import com.abhishek.hrms.dto.LeaveStatusUpdateRequest;
import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.entity.LeaveStatus;
import com.abhishek.hrms.entity.LeaveType;

import java.time.LocalDate;
import java.util.List;

public interface LeaveService {

    PagedResponse<LeaveResponse> getLeaves(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            LeaveStatus status,
            LeaveType leaveType,
            LocalDate fromDate,
            LocalDate toDate
    );

    LeaveResponse getLeaveById(Long id);

    List<LeaveResponse> getLeavesByEmployee(Long employeeId);

    LeaveResponse applyLeave(LeaveCreateRequest request);

    LeaveResponse updateLeaveStatus(Long id, LeaveStatusUpdateRequest request, String reviewerUsername);

    void cancelLeave(Long id);
}
