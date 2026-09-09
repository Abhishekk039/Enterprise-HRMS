package com.abhishek.hrms.controller;

import com.abhishek.hrms.dto.*;
import com.abhishek.hrms.entity.AttendanceStatus;
import com.abhishek.hrms.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<AttendanceResponse>> getAttendances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String status
    ) {
        AttendanceStatus parsedStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                parsedStatus = AttendanceStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        PagedResponse<AttendanceResponse> response = attendanceService.getAttendances(
                page, size, sortBy, sortDir, employeeId, date, fromDate, toDate, parsedStatus);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponse> checkIn(@Valid @RequestBody AttendanceCheckInRequest request) {
        AttendanceResponse response = attendanceService.checkIn(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-out")
    public ResponseEntity<AttendanceResponse> checkOut(@Valid @RequestBody AttendanceCheckOutRequest request) {
        AttendanceResponse response = attendanceService.checkOut(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/record")
    public ResponseEntity<AttendanceResponse> recordAttendance(@Valid @RequestBody AttendanceRecordRequest request) {
        AttendanceResponse response = attendanceService.recordAttendance(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<AttendanceResponse> getTodayAttendance(@PathVariable Long employeeId) {
        AttendanceResponse response = attendanceService.getTodayAttendance(employeeId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendanceHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        List<AttendanceResponse> response = attendanceService.getEmployeeAttendanceHistory(employeeId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
