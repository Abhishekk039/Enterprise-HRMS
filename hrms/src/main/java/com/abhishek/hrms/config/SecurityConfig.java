package com.abhishek.hrms.config;

import com.abhishek.hrms.security.JwtAuthenticationEntryPoint;
import com.abhishek.hrms.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationEntryPoint unauthorizedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        // Role-based restrictions
                        .requestMatchers(HttpMethod.POST, "/api/payrolls/generate")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR")
                        .requestMatchers(HttpMethod.PATCH, "/api/payrolls/*/status")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR")
                        .requestMatchers(HttpMethod.POST, "/api/performance-reviews")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/leaves/*/status")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/attendances/record")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**", "/api/employees/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR")
                        .requestMatchers(HttpMethod.POST, "/api/departments/**", "/api/employees/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**", "/api/employees/**")
                            .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}