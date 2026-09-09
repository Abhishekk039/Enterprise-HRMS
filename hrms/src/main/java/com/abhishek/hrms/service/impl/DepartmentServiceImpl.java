package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.DepartmentRequest;
import com.abhishek.hrms.dto.DepartmentResponse;
import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.entity.Department;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.DepartmentRepository;
import com.abhishek.hrms.service.DepartmentService;
import com.abhishek.hrms.specification.DepartmentSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DepartmentResponse> getDepartments(
            int pageNumber,
            int pageSize,
            String sortBy,
            String sortDir,
            String search
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Specification<Department> spec = DepartmentSpecification.filter(search);

        Page<Department> departments = departmentRepository.findAll(spec, pageable);

        List<DepartmentResponse> content = departments.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                departments.getNumber(),
                departments.getSize(),
                departments.getTotalElements(),
                departments.getTotalPages(),
                departments.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToResponse(department);
    }

    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: " + request.getName());
        }

        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department saved = departmentRepository.save(department);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        // Check for duplicate name only if the name is changing
        if (!department.getName().equals(request.getName())
                && departmentRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException(
                    "Department already exists with name: " + request.getName());
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department updated = departmentRepository.save(department);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getEmployees().isEmpty()) {
            throw new DuplicateResourceException(
                    "Cannot delete department with " + department.getEmployees().size()
                    + " assigned employees. Reassign employees first.");
        }

        departmentRepository.delete(department);
    }

    // --- Mapping helpers ---

    private DepartmentResponse mapToResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getUpdatedAt());
        return response;
    }
}
