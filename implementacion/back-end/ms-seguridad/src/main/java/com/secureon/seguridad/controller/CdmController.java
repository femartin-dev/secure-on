package com.secureon.seguridad.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.seguridad.dto.request.LoginCdmRequest;
import com.secureon.seguridad.dto.request.RegistrarOperadorRequest;
import com.secureon.seguridad.dto.response.LoginResponse;
import com.secureon.seguridad.dto.response.OperadorResponse;
import com.secureon.seguridad.service.OperadorService;
import com.secureon.seguridad.util.MessagesService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/seguridad/v1/cdm")
public class CdmController {

    @Autowired
    private OperadorService operadorService;

    @Autowired
    private MessagesService messageService;

    @PostMapping("/operador/registrar")
    //@PreAuthorize("hasRole('ADMIN_CDM')")
    public ResponseEntity<OperadorResponse> registerOperator(@Valid @RequestBody RegistrarOperadorRequest request) {
        OperadorResponse response = OperadorResponse.fromEntity(operadorService.registrar(request, false));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/administrador/registrar")
    //@PreAuthorize("hasRole('ADMIN_CDM')")
    public ResponseEntity<OperadorResponse> registerAdmin(@Valid @RequestBody RegistrarOperadorRequest request) {
        OperadorResponse response = OperadorResponse.fromEntity(operadorService.registrar(request, true));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> loginOperator(@Valid @RequestBody LoginCdmRequest request) {
        LoginResponse response = operadorService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logoutOperator(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        operadorService.logout(token);
        return ResponseEntity.ok().body(messageService.getMessage("ok.logout"));
    }

    @GetMapping("/operador/mis-datos")
    public ResponseEntity<OperadorResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        OperadorResponse response = OperadorResponse.fromEntity(operadorService.obtenerOperadorPorToken(token));
        return ResponseEntity.ok(response);
    }
}
