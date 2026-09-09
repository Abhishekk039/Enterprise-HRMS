package com.abhishek.hrms.config;

import com.abhishek.hrms.entity.Role;
import com.abhishek.hrms.entity.User;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@hrms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEnabled(true);

            userRepository.save(admin);
            logger.info("Default admin user created: admin / admin123 (ROLE_ADMIN)");
        }

        // Auto-link default admin to first employee if not already linked
        userRepository.findByUsername("admin").ifPresent(admin -> {
            if (admin.getEmployee() == null) {
                employeeRepository.findAll().stream().findFirst().ifPresent(emp -> {
                    admin.setEmployee(emp);
                    userRepository.save(admin);
                    logger.info("Linked default admin user to employee: {} {} (ID {})",
                            emp.getFirstName(), emp.getLastName(), emp.getId());
                });
            }
        });
    }
}
