package com.secureon.seguridad.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.seguridad.dto.request.RegistrarDispositivoRequest;
import com.secureon.seguridad.dto.request.LoginAppRequest;
import com.secureon.seguridad.dto.request.RegistrarUsuarioRequest;
import com.secureon.seguridad.dto.response.DispositivoResponse;
import com.secureon.seguridad.dto.response.LoginResponse;
import com.secureon.seguridad.dto.response.UsuarioResponse;
import com.secureon.seguridad.service.UsuarioService;
import com.secureon.seguridad.service.DispositivoService;
import com.secureon.seguridad.util.MessagesService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/seguridad/v1/app")
public class AppController {

    @Autowired
    private UsuarioService authService;

    @Autowired
    private DispositivoService dispositivoService;

    @Autowired
    private MessagesService messageService;

    @PostMapping("/usuario/registrar")
    public ResponseEntity<UsuarioResponse> registrarUsuario(@Valid @RequestBody RegistrarUsuarioRequest request) {
        UsuarioResponse response = UsuarioResponse.fromEntity(
            authService.registrar(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginAppRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader,
                                    @RequestParam UUID dispositivoAppId) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok().body(messageService.getMessage("ok.logout"));
    }

    @GetMapping("/usuario/mis-datos")
    public ResponseEntity<UsuarioResponse> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UsuarioResponse response = UsuarioResponse.fromEntity(
            authService.obtenerUsuarioPorToken(token));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dispositivo/registrar")
    public ResponseEntity<DispositivoResponse> registrarDispositivo(@Valid @RequestBody RegistrarDispositivoRequest request) {

        DispositivoResponse response = DispositivoResponse.fromEntity(
            dispositivoService.registrar(request));
        return ResponseEntity.ok(response);
    }
    
}
