package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.DepartmentRequest;
import com.abhishek.hrms.dto.DepartmentResponse;
import com.abhishek.hrms.dto.PagedResponse;

import java.util.List;

public interface DepartmentService {

    PagedResponse<DepartmentResponse> getDepartments(
            int pageNumber,
            int pageSize,
            String sortBy,
            String sortDir,
            String search
    );

    List<DepartmentResponse> getAllDepartments();

    DepartmentResponse getDepartmentById(Long id);

    DepartmentResponse createDepartment(DepartmentRequest request);

    DepartmentResponse updateDepartment(Long id, DepartmentRequest request);

    void deleteDepartment(Long id);
}