package com.abhishek.hrms.dto;

import com.abhishek.hrms.entity.LeaveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatusUpdateRequest {

    @NotNull(message = "Status is required (APPROVED or REJECTED)")
    private LeaveStatus status;

    private String rejectionReason;
}
