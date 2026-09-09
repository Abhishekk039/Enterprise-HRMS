CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    pay_period_month INT NOT NULL,
    pay_period_year INT NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_date DATE NULL,
    payment_method VARCHAR(50) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_employee_pay_period
        UNIQUE (employee_id, pay_period_year, pay_period_month)
);

CREATE TABLE performance_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    feedback TEXT NOT NULL,
    goals TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);
