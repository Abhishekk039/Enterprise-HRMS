package com.abhishek.hrms.dto;

import com.abhishek.hrms.entity.PaymentMethod;
import com.abhishek.hrms.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollStatusUpdateRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private LocalDate paymentDate;

    private PaymentMethod paymentMethod;
}
