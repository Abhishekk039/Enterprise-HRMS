package com.abhishek.hrms.specification;

import com.abhishek.hrms.entity.LeaveRequest;
import com.abhishek.hrms.entity.LeaveStatus;
import com.abhishek.hrms.entity.LeaveType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class LeaveSpecification {

    public static Specification<LeaveRequest> filter(
            Long employeeId,
            LeaveStatus status,
            LeaveType leaveType,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (leaveType != null) {
                predicates.add(cb.equal(root.get("leaveType"), leaveType));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
