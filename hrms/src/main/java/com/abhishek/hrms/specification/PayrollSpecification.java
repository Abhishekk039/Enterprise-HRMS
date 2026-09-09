package com.abhishek.hrms.specification;

import com.abhishek.hrms.entity.PaymentStatus;
import com.abhishek.hrms.entity.Payroll;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PayrollSpecification {

    public static Specification<Payroll> filter(
            Long employeeId,
            Integer year,
            Integer month,
            PaymentStatus paymentStatus
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (employeeId != null) {
                predicates.add(cb.equal(root.get("employee").get("id"), employeeId));
            }

            if (year != null) {
                predicates.add(cb.equal(root.get("payPeriodYear"), year));
            }

            if (month != null) {
                predicates.add(cb.equal(root.get("payPeriodMonth"), month));
            }

            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
