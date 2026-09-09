package com.abhishek.hrms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckInRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String notes;
}
