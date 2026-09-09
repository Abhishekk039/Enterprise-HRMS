package com.abhishek.hrms.repository;

import com.abhishek.hrms.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long>, JpaSpecificationExecutor<PerformanceReview> {

    List<PerformanceReview> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<PerformanceReview> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);
}
