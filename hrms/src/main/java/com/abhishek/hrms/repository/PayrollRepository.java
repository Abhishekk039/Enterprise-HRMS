package com.abhishek.hrms.repository;

import com.abhishek.hrms.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long>, JpaSpecificationExecutor<Payroll> {

    Optional<Payroll> findByEmployeeIdAndPayPeriodYearAndPayPeriodMonth(
            Long employeeId, Integer payPeriodYear, Integer payPeriodMonth);

    List<Payroll> findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(Long employeeId);

    boolean existsByEmployeeIdAndPayPeriodYearAndPayPeriodMonth(
            Long employeeId, Integer payPeriodYear, Integer payPeriodMonth);
}
