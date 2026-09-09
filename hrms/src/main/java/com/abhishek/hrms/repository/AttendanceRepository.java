package com.abhishek.hrms.repository;

import com.abhishek.hrms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetweenOrderByDateDesc(
            Long employeeId, LocalDate startDate, LocalDate endDate);

    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);
}
