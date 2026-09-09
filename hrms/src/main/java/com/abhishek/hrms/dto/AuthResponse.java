package com.abhishek.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long employeeId;

    public AuthResponse(String token, Long id, String username, String email, String role, Long employeeId) {
        this.token = token;
        this.tokenType = "Bearer";
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
    }
}
