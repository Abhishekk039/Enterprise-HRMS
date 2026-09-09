package com.abhishek.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfJoining;
    private String jobTitle;
    private BigDecimal salary;
    private String status;

    // Flattened department info instead of nested entity
    private Long departmentId;
    private String departmentName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
