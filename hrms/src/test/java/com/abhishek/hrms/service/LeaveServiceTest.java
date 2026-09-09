package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.LeaveCreateRequest;
import com.abhishek.hrms.dto.LeaveResponse;
import com.abhishek.hrms.dto.LeaveStatusUpdateRequest;
import com.abhishek.hrms.entity.*;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.LeaveRequestRepository;
import com.abhishek.hrms.repository.UserRepository;
import com.abhishek.hrms.service.impl.LeaveServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LeaveServiceImpl leaveService;

    private Employee employee;
    private LeaveRequest leaveRequest;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setEmployeeCode("EMP-100");
        employee.setFirstName("Bob");

        leaveRequest = new LeaveRequest();
        leaveRequest.setId(10L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(LeaveType.CASUAL_LEAVE);
        leaveRequest.setStartDate(LocalDate.of(2026, 4, 1));
        leaveRequest.setEndDate(LocalDate.of(2026, 4, 3));
        leaveRequest.setTotalDays(3);
        leaveRequest.setStatus(LeaveStatus.PENDING);
    }

    @Test
    void applyLeave_Success() {
        LeaveCreateRequest request = new LeaveCreateRequest();
        request.setEmployeeId(1L);
        request.setLeaveType(LeaveType.CASUAL_LEAVE);
        request.setStartDate(LocalDate.of(2026, 4, 1));
        request.setEndDate(LocalDate.of(2026, 4, 3));

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRepository.hasOverlappingLeave(any(), any(), any(), any())).thenReturn(false);
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveResponse response = leaveService.applyLeave(request);

        assertNotNull(response);
        assertEquals(3, response.getTotalDays());
        assertEquals(LeaveStatus.PENDING, response.getStatus());
        verify(leaveRepository, times(1)).save(any(LeaveRequest.class));
    }

    @Test
    void applyLeave_OverlappingDates_ThrowsException() {
        LeaveCreateRequest request = new LeaveCreateRequest();
        request.setEmployeeId(1L);
        request.setLeaveType(LeaveType.CASUAL_LEAVE);
        request.setStartDate(LocalDate.of(2026, 4, 1));
        request.setEndDate(LocalDate.of(2026, 4, 3));

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(leaveRepository.hasOverlappingLeave(any(), any(), any(), any())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> leaveService.applyLeave(request));
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void updateLeaveStatus_Approve_Success() {
        User reviewer = new User();
        reviewer.setId(2L);
        reviewer.setUsername("admin");

        LeaveStatusUpdateRequest updateRequest = new LeaveStatusUpdateRequest();
        updateRequest.setStatus(LeaveStatus.APPROVED);

        when(leaveRepository.findById(10L)).thenReturn(Optional.of(leaveRequest));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(reviewer));
        when(leaveRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveResponse response = leaveService.updateLeaveStatus(10L, updateRequest, "admin");

        assertNotNull(response);
        assertEquals(LeaveStatus.APPROVED, leaveRequest.getStatus());
    }
}
