package com.abhishek.hrms.specification;

import com.abhishek.hrms.entity.PerformanceReview;
import com.abhishek.hrms.entity.ReviewStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PerformanceReviewSpecification {

    public static Specification<PerformanceReview> filter(
            Long employeeId,
            Long reviewerId,
            String reviewPeriod,
            Integer rating,
            ReviewStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }

            if (reviewerId != null) {
                predicates.add(cb.equal(root.get("reviewer").get("id"), reviewerId));
            }

            if (reviewPeriod != null && !reviewPeriod.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("reviewPeriod")), "%" + reviewPeriod.trim().toLowerCase() + "%"));
            }

            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
