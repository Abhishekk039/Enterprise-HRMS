package com.abhishek.hrms.controller;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PayrollGenerateRequest;
import com.abhishek.hrms.dto.PayrollResponse;
import com.abhishek.hrms.dto.PayrollStatusUpdateRequest;
import com.abhishek.hrms.entity.PaymentStatus;
import com.abhishek.hrms.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<PayrollResponse>> getPayrolls(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "payPeriodYear") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) PaymentStatus status
    ) {
        PagedResponse<PayrollResponse> response = payrollService.getPayrolls(
                page, size, sortBy, sortDir, employeeId, year, month, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollResponse> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollResponse>> getEmployeePayrolls(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeePayrolls(employeeId));
    }

    @PostMapping("/generate")
    public ResponseEntity<PayrollResponse> generatePayroll(
            @Valid @RequestBody PayrollGenerateRequest request) {
        PayrollResponse response = payrollService.generatePayroll(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PayrollResponse> updatePayrollStatus(
            @PathVariable Long id,
            @Valid @RequestBody PayrollStatusUpdateRequest request) {
        PayrollResponse response = payrollService.updatePayrollStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
