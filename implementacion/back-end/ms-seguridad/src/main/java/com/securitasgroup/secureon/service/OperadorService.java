package com.securitasgroup.secureon.service;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.securitasgroup.secureon.config.JwtConfig;
import com.securitasgroup.secureon.dto.request.OperatorLoginRequest;
import com.securitasgroup.secureon.dto.request.RegisterOperatorRequest;
import com.securitasgroup.secureon.dto.response.LoginResponse;
import com.securitasgroup.secureon.dto.response.OperatorResponse;
import com.securitasgroup.secureon.exeptions.BadRequestException;
import com.securitasgroup.secureon.exeptions.ResourceNotFoundException;
import com.securitasgroup.secureon.model.entity.OperadorCdm;
import com.securitasgroup.secureon.model.entity.Sesion;
import com.securitasgroup.secureon.repository.OperadorCdmRepository;
import com.securitasgroup.secureon.security.JwtTokenProvider;

import jakarta.transaction.Transactional;

@Service
public class OperadorService {

    @Autowired
    private OperadorCdmRepository operadorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private SessionService sessionService;

    @Transactional
    public OperatorResponse register(RegisterOperatorRequest request) {
        if (operadorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }
        if (operadorRepository.existsByUsuario(request.getUsuario())) {
            throw new BadRequestException("El nombre de usuario ya está registrado");
        }
        if (operadorRepository.existsByLegajo(request.getLegajo())) {
            throw new BadRequestException("El Legajo ya está registrado");
        }

        OperadorCdm operador = new OperadorCdm();
        operador.setNombre(request.getNombre());
        operador.setApellido(request.getApellido());
        operador.setLegajo(request.getLegajo());
        operador.setEmail(request.getEmail());
        operador.setUsuario(request.getUsuario());
        operador.setHashContrasena(passwordEncoder.encode(request.getPassword()));
        operador.setEsAdministrador(request.getEsAdministrador() != null ? request.getEsAdministrador() : false);

        if (request.getSupervisorId() != null) {
            OperadorCdm supervisor = operadorRepository.findById(request.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supervisor no encontrado"));
            operador.setSupervisor(supervisor);
        }

        operador.setFechaRegistro(OffsetDateTime.now());
        operador.setEstaActivo(true);

        OperadorCdm saved = operadorRepository.save(operador);
        return OperatorResponse.fromEntity(saved);
    }

    @Transactional
    public LoginResponse login(OperatorLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        OperadorCdm operador = operadorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Operador no encontrado"));

        String token = tokenProvider.generateToken(authentication);
        Long expiracion = jwtConfig.getExpirationMs();

        Sesion sesion = sessionService.crearSesionOperador(operador, token, expiracion);

        return LoginResponse.builder()
                .token(sesion.getTokenRestablecimiento())
                .userId(null) // No aplica para operadores
                .email(operador.getEmail())
                .nombre(operador.getNombre())
                .apellido(operador.getApellido())
                .expiracion(sesion.getExpiracionToken())
                .build();
    }

    @Transactional
    public void logout(String token) {
        sessionService.cerrarSesionOperador(token);
        SecurityContextHolder.clearContext();
    }

}
