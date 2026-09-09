package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.EmployeeRequest;
import com.abhishek.hrms.dto.EmployeeResponse;
import com.abhishek.hrms.dto.PagedResponse;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeService {

    PagedResponse<EmployeeResponse> getEmployees(
            int pageNumber,
            int pageSize,
            String sortBy,
            String sortDir,
            String search,
            Long departmentId,
            String status,
            LocalDate joiningDateFrom,
            LocalDate joiningDateTo
    );

    List<EmployeeResponse> getAllEmployees();

    EmployeeResponse getEmployeeById(Long id);

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);
}
