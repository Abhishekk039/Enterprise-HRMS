package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.DepartmentRequest;
import com.abhishek.hrms.dto.DepartmentResponse;
import com.abhishek.hrms.entity.Department;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.DepartmentRepository;
import com.abhishek.hrms.service.impl.DepartmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    private Department department;
    private DepartmentRequest request;

    @BeforeEach
    void setUp() {
        department = new Department();
        department.setId(1L);
        department.setName("Finance");
        department.setDescription("Finance and Accounts");
        department.setEmployees(new ArrayList<>());

        request = new DepartmentRequest();
        request.setName("Finance");
        request.setDescription("Finance and Accounts");
    }

    @Test
    void createDepartment_Success() {
        when(departmentRepository.existsByName("Finance")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentResponse response = departmentService.createDepartment(request);

        assertNotNull(response);
        assertEquals("Finance", response.getName());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void createDepartment_DuplicateName() {
        when(departmentRepository.existsByName("Finance")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> departmentService.createDepartment(request));
        verify(departmentRepository, never()).save(any(Department.class));
    }

    @Test
    void getDepartmentById_Success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        DepartmentResponse response = departmentService.getDepartmentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void deleteDepartment_WithAssignedEmployees_ThrowsException() {
        Employee emp = new Employee();
        emp.setId(5L);
        department.setEmployees(Collections.singletonList(emp));

        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        assertThrows(DuplicateResourceException.class, () -> departmentService.deleteDepartment(1L));
        verify(departmentRepository, never()).delete(any(Department.class));
    }
}
