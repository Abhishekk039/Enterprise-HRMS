package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PerformanceReviewCreateRequest;
import com.abhishek.hrms.dto.PerformanceReviewResponse;
import com.abhishek.hrms.entity.ReviewStatus;

import java.util.List;

public interface PerformanceReviewService {

    PagedResponse<PerformanceReviewResponse> getReviews(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            Long reviewerId,
            String reviewPeriod,
            Integer rating,
            ReviewStatus status
    );

    PerformanceReviewResponse createReview(PerformanceReviewCreateRequest request, String reviewerUsername);

    PerformanceReviewResponse getReviewById(Long id);

    List<PerformanceReviewResponse> getEmployeeReviews(Long employeeId);

    PerformanceReviewResponse acknowledgeReview(Long id);
}
