package com.abhishek.hrms.service;

import com.abhishek.hrms.dto.AuthResponse;
import com.abhishek.hrms.dto.LoginRequest;
import com.abhishek.hrms.dto.RegisterRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse getCurrentUser(String username);
}
