package com.abhishek.hrms.controller;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PerformanceReviewCreateRequest;
import com.abhishek.hrms.dto.PerformanceReviewResponse;
import com.abhishek.hrms.entity.ReviewStatus;
import com.abhishek.hrms.service.PerformanceReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance-reviews")
public class PerformanceReviewController {

    private final PerformanceReviewService reviewService;

    public PerformanceReviewController(PerformanceReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<PerformanceReviewResponse>> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long reviewerId,
            @RequestParam(required = false) String reviewPeriod,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) ReviewStatus status
    ) {
        PagedResponse<PerformanceReviewResponse> response = reviewService.getReviews(
                page, size, sortBy, sortDir, employeeId, reviewerId, reviewPeriod, rating, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReviewResponse> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReviewResponse>> getEmployeeReviews(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reviewService.getEmployeeReviews(employeeId));
    }

    @PostMapping
    public ResponseEntity<PerformanceReviewResponse> createReview(
            @Valid @RequestBody PerformanceReviewCreateRequest request,
            Authentication authentication
    ) {
        String reviewerUsername = authentication.getName();
        PerformanceReviewResponse response = reviewService.createReview(request, reviewerUsername);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<PerformanceReviewResponse> acknowledgeReview(@PathVariable Long id) {
        PerformanceReviewResponse response = reviewService.acknowledgeReview(id);
        return ResponseEntity.ok(response);
    }
}
