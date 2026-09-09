package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.PagedResponse;
import com.abhishek.hrms.dto.PerformanceReviewCreateRequest;
import com.abhishek.hrms.dto.PerformanceReviewResponse;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.entity.PerformanceReview;
import com.abhishek.hrms.entity.ReviewStatus;
import com.abhishek.hrms.entity.User;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.PerformanceReviewRepository;
import com.abhishek.hrms.repository.UserRepository;
import com.abhishek.hrms.service.PerformanceReviewService;
import com.abhishek.hrms.specification.PerformanceReviewSpecification;
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
public class PerformanceReviewServiceImpl implements PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public PerformanceReviewServiceImpl(PerformanceReviewRepository reviewRepository,
                                        EmployeeRepository employeeRepository,
                                        UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PerformanceReviewResponse> getReviews(
            int page,
            int size,
            String sortBy,
            String sortDir,
            Long employeeId,
            Long reviewerId,
            String reviewPeriod,
            Integer rating,
            ReviewStatus status
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<PerformanceReview> spec = PerformanceReviewSpecification.filter(
                employeeId, reviewerId, reviewPeriod, rating, status);

        Page<PerformanceReview> reviewPage = reviewRepository.findAll(spec, pageable);

        List<PerformanceReviewResponse> content = reviewPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Override
    @Transactional
    public PerformanceReviewResponse createReview(PerformanceReviewCreateRequest request, String reviewerUsername) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", reviewerUsername));

        PerformanceReview review = new PerformanceReview();
        review.setEmployee(employee);
        review.setReviewer(reviewer);
        review.setReviewPeriod(request.getReviewPeriod());
        review.setRating(request.getRating());
        review.setFeedback(request.getFeedback());
        review.setGoals(request.getGoals());
        review.setStatus(request.getStatus() != null ? request.getStatus() : ReviewStatus.SUBMITTED);

        PerformanceReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceReviewResponse getReviewById(Long id) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceReviewResponse> getEmployeeReviews(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }

        return reviewRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PerformanceReviewResponse acknowledgeReview(Long id) {
        PerformanceReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PerformanceReview", "id", id));

        review.setStatus(ReviewStatus.ACKNOWLEDGED);
        PerformanceReview updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    private PerformanceReviewResponse mapToResponse(PerformanceReview review) {
        PerformanceReviewResponse response = new PerformanceReviewResponse();
        response.setId(review.getId());
        response.setEmployeeId(review.getEmployee().getId());
        response.setEmployeeCode(review.getEmployee().getEmployeeCode());
        response.setEmployeeName(review.getEmployee().getFirstName() + " " +
                (review.getEmployee().getLastName() != null ? review.getEmployee().getLastName() : ""));
        response.setDepartmentName(review.getEmployee().getDepartment() != null
                ? review.getEmployee().getDepartment().getName() : null);
        response.setReviewerId(review.getReviewer().getId());
        response.setReviewerUsername(review.getReviewer().getUsername());
        response.setReviewPeriod(review.getReviewPeriod());
        response.setRating(review.getRating());
        response.setFeedback(review.getFeedback());
        response.setGoals(review.getGoals());
        response.setStatus(review.getStatus());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
