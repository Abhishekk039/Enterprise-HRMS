package com.abhishek.hrms.repository;

import com.abhishek.hrms.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);
}
