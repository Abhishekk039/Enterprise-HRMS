package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.EmployeeRequest;
import com.abhishek.hrms.dto.EmployeeResponse;
import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.entity.Department;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.DepartmentRepository;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.service.EmployeeService;
import com.abhishek.hrms.specification.EmployeeSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getEmployees(
            int pageNumber,
            int pageSize,
            String sortBy,
            String sortDir,
            String search,
            Long departmentId,
            String status,
            LocalDate joiningDateFrom,
            LocalDate joiningDateTo
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Specification<Employee> spec = EmployeeSpecification.filter(
                search, departmentId, status, joiningDateFrom, joiningDateTo
        );

        Page<Employee> employees = employeeRepository.findAll(spec, pageable);

        List<EmployeeResponse> content = employees.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                employees.getNumber(),
                employees.getSize(),
                employees.getTotalElements(),
                employees.getTotalPages(),
                employees.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department", "id", request.getDepartmentId()));

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Employee already exists with email: " + request.getEmail());
        }

        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException(
                    "Employee already exists with code: " + request.getEmployeeCode());
        }

        Employee employee = mapToEntity(request, department);
        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department", "id", request.getDepartmentId()));

        if (!employee.getEmail().equals(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Employee already exists with email: " + request.getEmail());
        }

        if (!employee.getEmployeeCode().equals(request.getEmployeeCode())
                && employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException(
                    "Employee already exists with code: " + request.getEmployeeCode());
        }

        employee.setDepartment(department);
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDateOfJoining(request.getDateOfJoining());
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());
        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employeeRepository.delete(employee);
    }

    // --- Mapping helpers ---

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setFirstName(employee.getFirstName());
        response.setLastName(employee.getLastName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setDateOfJoining(employee.getDateOfJoining());
        response.setJobTitle(employee.getJobTitle());
        response.setSalary(employee.getSalary());
        response.setStatus(employee.getStatus());
        response.setDepartmentId(employee.getDepartment().getId());
        response.setDepartmentName(employee.getDepartment().getName());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        return response;
    }

    private Employee mapToEntity(EmployeeRequest request, Department department) {
        Employee employee = new Employee();
        employee.setDepartment(department);
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDateOfJoining(request.getDateOfJoining());
        employee.setJobTitle(request.getJobTitle());
        employee.setSalary(request.getSalary());
        employee.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return employee;
    }
}
