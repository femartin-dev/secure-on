package com.securitasgroup.secureon.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.securitasgroup.secureon.dto.request.LoginRequest;
import com.securitasgroup.secureon.dto.request.RegisterRequest;
import com.securitasgroup.secureon.dto.response.LoginResponse;
import com.securitasgroup.secureon.dto.response.UserResponse;
import com.securitasgroup.secureon.service.AuthService;


import jakarta.validation.Valid;


@RestController
@RequestMapping("seguridad/api/v1/app")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("usuario/registrar")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader,
                                    @RequestParam UUID dispositivoAppId) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok().body("Sesión cerrada correctamente");
    }

    @GetMapping("usuario/mis-datos")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserResponse response = authService.currentUser(auth.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("dispositivo/registrar")
    public String postMethodName(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
}
