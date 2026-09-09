package com.abhishek.hrms.specification;

import com.abhishek.hrms.entity.Attendance;
import com.abhishek.hrms.entity.AttendanceStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AttendanceSpecification {

    public static Specification<Attendance> filter(
            Long employeeId,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            AttendanceStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }

            if (date != null) {
                predicates.add(cb.equal(root.get("date"), date));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), toDate));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
