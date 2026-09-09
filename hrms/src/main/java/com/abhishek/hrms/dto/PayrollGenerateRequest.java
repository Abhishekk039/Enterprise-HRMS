package com.abhishek.hrms.dto;

import com.abhishek.hrms.entity.PaymentMethod;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollGenerateRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Pay period month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer payPeriodMonth;

    @NotNull(message = "Pay period year is required")
    private Integer payPeriodYear;

    private BigDecimal allowances;

    private BigDecimal deductions;

    private PaymentMethod paymentMethod;

    private String notes;
}
