package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.EmployeeRequest;
import com.abhishek.hrms.dto.EmployeeResponse;
import com.abhishek.hrms.entity.Department;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.DepartmentRepository;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department department;
    private Employee employee;
    private EmployeeRequest request;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Engineering");

        employee = new Employee();
        employee.setId(10L);
        employee.setEmployeeCode("EMP-001");
        employee.setFirstName("Alice");
        employee.setLastName("Smith");
        employee.setEmail("alice@company.com");
        employee.setDepartment(department);
        employee.setSalary(BigDecimal.valueOf(6000));
        employee.setDateOfJoining(LocalDate.of(2025, 1, 15));
        employee.setStatus("ACTIVE");

        request = new EmployeeRequest();
        request.setDepartmentId(1L);
        request.setEmployeeCode("EMP-001");
        request.setFirstName("Alice");
        request.setLastName("Smith");
        request.setEmail("alice@company.com");
        request.setDateOfJoining(LocalDate.of(2025, 1, 15));
        request.setSalary(BigDecimal.valueOf(6000));
        request.setStatus("ACTIVE");
    }

    @Test
    void createEmployee_Success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.existsByEmail("alice@company.com")).thenReturn(false);
        when(employeeRepository.existsByEmployeeCode("EMP-001")).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertEquals("EMP-001", response.getEmployeeCode());
        assertEquals("Alice", response.getFirstName());
        assertEquals("Engineering", response.getDepartmentName());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void createEmployee_DepartmentNotFound() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.createEmployee(request));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.existsByEmail("alice@company.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(request));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Alice", response.getFirstName());
    }

    @Test
    void getEmployeeById_NotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(99L));
    }

    @Test
    void deleteEmployee_Success() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));

        employeeService.deleteEmployee(10L);

        verify(employeeRepository, times(1)).delete(employee);
    }
}
