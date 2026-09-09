package com.abhishek.hrms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Employee code is required")
    @Size(max = 50, message = "Employee code must not exceed 50 characters")
    private String employeeCode;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @NotNull(message = "Date of joining is required")
    private LocalDate dateOfJoining;

    @Size(max = 100, message = "Job title must not exceed 100 characters")
    private String jobTitle;

    @DecimalMin(value = "0.0", inclusive = false, message = "Salary must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Salary format is invalid")
    private BigDecimal salary;

    @Size(max = 30, message = "Status must not exceed 30 characters")
    private String status;
}
