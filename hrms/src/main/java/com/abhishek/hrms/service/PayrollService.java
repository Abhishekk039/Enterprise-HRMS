package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PayrollGenerateRequest;
import com.abhishek.hrms.dto.PayrollResponse;
import com.abhishek.hrms.dto.PayrollStatusUpdateRequest;
import com.abhishek.hrms.entity.PaymentStatus;

import java.util.List;

public interface PayrollService {

    PagedResponse<PayrollResponse> getPayrolls(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            Integer year,
            Integer month,
            PaymentStatus status
    );

    PayrollResponse generatePayroll(PayrollGenerateRequest request);

    PayrollResponse updatePayrollStatus(Long id, PayrollStatusUpdateRequest request);

    PayrollResponse getPayrollById(Long id);

    List<PayrollResponse> getEmployeePayrolls(Long employeeId);
}
