package com.securitasgroup.secureon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securitasgroup.secureon.dto.request.OperatorLoginRequest;
import com.securitasgroup.secureon.dto.request.RegisterOperatorRequest;
import com.securitasgroup.secureon.dto.response.LoginResponse;
import com.securitasgroup.secureon.dto.response.OperatorResponse;
import com.securitasgroup.secureon.service.OperadorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("seguridad/api/v1/cdm")
public class OperatorController {

    @Autowired
    private OperadorService operadorService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN_CDM')")
    public ResponseEntity<OperatorResponse> registerOperator(@Valid @RequestBody RegisterOperatorRequest request) {
        OperatorResponse response = operadorService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginOperator(@Valid @RequestBody OperatorLoginRequest request) {
        LoginResponse response = operadorService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutOperator(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        operadorService.logout(token);
        return ResponseEntity.ok().body("Sesión de operador cerrada");
    }
}
