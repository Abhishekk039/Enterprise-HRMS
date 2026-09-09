package com.abhishek.hrms.service.impl;

import com.abhishek.hrms.dto.AuthResponse;
import com.abhishek.hrms.dto.LoginRequest;
import com.abhishek.hrms.dto.RegisterRequest;
import com.abhishek.hrms.entity.Employee;
import com.abhishek.hrms.entity.Role;
import com.abhishek.hrms.entity.User;
import com.abhishek.hrms.exception.DuplicateResourceException;
import com.abhishek.hrms.exception.ResourceNotFoundException;
import com.abhishek.hrms.repository.EmployeeRepository;
import com.abhishek.hrms.repository.UserRepository;
import com.abhishek.hrms.security.JwtUtils;
import com.abhishek.hrms.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username/email", request.getUsernameOrEmail()));

        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                employeeId
        );
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.ROLE_EMPLOYEE);

        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
            user.setEmployee(employee);
        }

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateTokenFromUsername(savedUser.getUsername(), savedUser.getRole().name());
        Long employeeId = savedUser.getEmployee() != null ? savedUser.getEmployee().getId() : null;

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                employeeId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return new AuthResponse(
                null,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                employeeId
        );
    }
}
