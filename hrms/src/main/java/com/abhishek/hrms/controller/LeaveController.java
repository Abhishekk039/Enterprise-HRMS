package com.abhishek.hrms.controller;

import com.abhishek.hrms.dto.LeaveCreateRequest;
import com.abhishek.hrms.dto.LeaveResponse;
import com.abhishek.hrms.dto.LeaveStatusUpdateRequest;
import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.entity.LeaveStatus;
import com.abhishek.hrms.entity.LeaveType;
import com.abhishek.hrms.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<LeaveResponse>> getLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String leaveType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        LeaveStatus parsedStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                parsedStatus = LeaveStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        LeaveType parsedLeaveType = null;
        if (leaveType != null && !leaveType.isBlank() && !leaveType.equalsIgnoreCase("ALL")) {
            try {
                parsedLeaveType = LeaveType.valueOf(leaveType.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        PagedResponse<LeaveResponse> response = leaveService.getLeaves(
                page, size, sortBy, sortDir, employeeId, parsedStatus, parsedLeaveType, fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> getLeaveById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getLeaveById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @PostMapping
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveCreateRequest request) {
        LeaveResponse response = leaveService.applyLeave(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LeaveResponse> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateRequest request,
            Authentication authentication
    ) {
        String reviewerUsername = authentication != null ? authentication.getName() : null;
        LeaveResponse response = leaveService.updateLeaveStatus(id, request, reviewerUsername);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelLeave(@PathVariable Long id) {
        leaveService.cancelLeave(id);
        return ResponseEntity.noContent().build();
    }
}
