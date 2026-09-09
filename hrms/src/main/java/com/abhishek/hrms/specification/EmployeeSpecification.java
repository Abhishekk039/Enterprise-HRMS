package com.abhishek.hrms.specification;

import com.abhishek.hrms.entity.Employee;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EmployeeSpecification {

    public static Specification<Employee> filter(
            String search,
            Long departmentId,
            String status,
            LocalDate joiningDateFrom,
            LocalDate joiningDateTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search query across firstName, lastName, email, employeeCode
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchPattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate codeMatch = cb.like(cb.lower(root.get("employeeCode")), searchPattern);
                predicates.add(cb.or(firstNameMatch, lastNameMatch, emailMatch, codeMatch));
            }

            // Department filter
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }

            // Status filter (e.g. ACTIVE, INACTIVE)
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            // Date of joining range
            if (joiningDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dateOfJoining"), joiningDateFrom));
            }
            if (joiningDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dateOfJoining"), joiningDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
