package com.abhishek.hrms.repository;

import com.abhishek.hrms.entity.LeaveRequest;
import com.abhishek.hrms.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {

    List<LeaveRequest> findByEmployeeIdOrderByStartDateDesc(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    @Query("SELECT COUNT(l) > 0 FROM LeaveRequest l " +
           "WHERE l.employee.id = :employeeId " +
           "AND l.status IN :activeStatuses " +
           "AND l.startDate <= :endDate " +
           "AND l.endDate >= :startDate")
    boolean hasOverlappingLeave(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("activeStatuses") List<LeaveStatus> activeStatuses
    );
}
