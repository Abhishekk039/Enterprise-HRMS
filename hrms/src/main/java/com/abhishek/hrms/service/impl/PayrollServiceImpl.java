package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PayrollGenerateRequest;
import com.abhishek.hrms.dto.PayrollResponse;
import com.abhishek.hrms.dto.PayrollStatusUpdateRequest;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.entity.PaymentStatus;
import com.abhishek.hrms.entity.Payroll;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.PayrollRepository;
import com.abhishek.hrms.service.PayrollService;
import com.abhishek.hrms.specification.PayrollSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollServiceImpl(PayrollRepository payrollRepository,
                              EmployeeRepository employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PayrollResponse> getPayrolls(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            Integer year,
            Integer month,
            PaymentStatus status
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Payroll> spec = PayrollSpecification.filter(employeeId, year, month, status);

        Page<Payroll> payrollPage = payrollRepository.findAll(spec, pageable);

        List<PayrollResponse> content = payrollPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                payrollPage.getNumber(),
                payrollPage.getSize(),
                payrollPage.getTotalElements(),
                payrollPage.getTotalPages(),
                payrollPage.isLast()
        );
    }

    @Override
    @Transactional
    public PayrollResponse generatePayroll(PayrollGenerateRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        if (payrollRepository.existsByEmployeeIdAndPayPeriodYearAndPayPeriodMonth(
                employee.getId(), request.getPayPeriodYear(), request.getPayPeriodMonth())) {
            throw new DuplicateResourceException(String.format(
                    "Payroll already exists for employee %s for period %d/%d",
                    employee.getEmployeeCode(), request.getPayPeriodMonth(), request.getPayPeriodYear()));
        }

        BigDecimal basicSalary = employee.getSalary() != null ? employee.getSalary() : BigDecimal.ZERO;
        BigDecimal allowances = request.getAllowances() != null ? request.getAllowances() : BigDecimal.ZERO;
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions() : BigDecimal.ZERO;
        BigDecimal netSalary = basicSalary.add(allowances).subtract(deductions);

        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setPayPeriodMonth(request.getPayPeriodMonth());
        payroll.setPayPeriodYear(request.getPayPeriodYear());
        payroll.setBasicSalary(basicSalary);
        payroll.setAllowances(allowances);
        payroll.setDeductions(deductions);
        payroll.setNetSalary(netSalary);
        payroll.setPaymentStatus(PaymentStatus.PENDING);
        payroll.setPaymentMethod(request.getPaymentMethod());
        payroll.setNotes(request.getNotes());

        Payroll saved = payrollRepository.save(payroll);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PayrollResponse updatePayrollStatus(Long id, PayrollStatusUpdateRequest request) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));

        payroll.setPaymentStatus(request.getPaymentStatus());
        if (request.getPaymentDate() != null) {
            payroll.setPaymentDate(request.getPaymentDate());
        } else if (request.getPaymentStatus() == PaymentStatus.PAID && payroll.getPaymentDate() == null) {
            payroll.setPaymentDate(LocalDate.now());
        }

        if (request.getPaymentMethod() != null) {
            payroll.setPaymentMethod(request.getPaymentMethod());
        }

        Payroll updated = payrollRepository.save(payroll);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollResponse getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));
        return mapToResponse(payroll);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollResponse> getEmployeePayrolls(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }

        return payrollRepository.findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PayrollResponse mapToResponse(Payroll payroll) {
        PayrollResponse response = new PayrollResponse();
        response.setId(payroll.getId());
        response.setEmployeeId(payroll.getEmployee().getId());
        response.setEmployeeCode(payroll.getEmployee().getEmployeeCode());
        response.setEmployeeName(payroll.getEmployee().getFirstName() + " " +
                (payroll.getEmployee().getLastName() != null ? payroll.getEmployee().getLastName() : ""));
        response.setDepartmentName(payroll.getEmployee().getDepartment() != null
                ? payroll.getEmployee().getDepartment().getName() : null);
        response.setPayPeriodMonth(payroll.getPayPeriodMonth());
        response.setPayPeriodYear(payroll.getPayPeriodYear());
        response.setBasicSalary(payroll.getBasicSalary());
        response.setAllowances(payroll.getAllowances());
        response.setDeductions(payroll.getDeductions());
        response.setNetSalary(payroll.getNetSalary());
        response.setPaymentStatus(payroll.getPaymentStatus());
        response.setPaymentDate(payroll.getPaymentDate());
        response.setPaymentMethod(payroll.getPaymentMethod());
        response.setNotes(payroll.getNotes());
        response.setCreatedAt(payroll.getCreatedAt());
        response.setUpdatedAt(payroll.getUpdatedAt());
        return response;
    }
}
