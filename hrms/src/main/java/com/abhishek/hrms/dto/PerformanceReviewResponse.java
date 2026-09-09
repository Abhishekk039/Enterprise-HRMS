package com.abhishek.hrms.dto;

import com.abhishek.hrms.entity.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewResponse {

    private Long id;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String departmentName;
    private Long reviewerId;
    private String reviewerUsername;
    private String reviewPeriod;
    private Integer rating;
    private String feedback;
    private String goals;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
