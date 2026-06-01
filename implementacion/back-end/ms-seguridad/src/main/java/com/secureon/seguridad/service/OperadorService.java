package com.secureon.seguridad.service;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.BadRequestException;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Operador;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.model.entity.SesionCdm;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.dto.request.LoginCdmRequest;
import com.secureon.seguridad.dto.request.RegistrarOperadorRequest;
import com.secureon.seguridad.dto.response.LoginResponse;
import com.secureon.seguridad.repository.OperadorRepository;


import jakarta.transaction.Transactional;

@Service
public class OperadorService {

    @Autowired
    private OperadorRepository operadorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SesionCdmService sessionService;

    @Autowired
    private MessagesService messageService;

    @Transactional
    public Operador registrar(RegistrarOperadorRequest request, boolean esAdministrador) {
        if (operadorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(messageService.getMessage("err.email.not-available"));
        }
        if (operadorRepository.existsByTelefono(request.getTelefono())) {
            throw new BadRequestException(messageService.getMessage("err.phone.not-available"));
        }
        if (operadorRepository.existsByLegajo(request.getLegajo())) {
            throw new BadRequestException(messageService.getMessage("err.dossier.not-available", request.getLegajo()));
        }

        Operador operador = new Operador();
        operador.setNombre(request.getNombre());
        operador.setApellido(request.getApellido());
        operador.setLegajo(request.getLegajo());
        operador.setEmail(request.getEmail());
        operador.setTelefono(request.getTelefono());
        operador.setHashContrasena(passwordEncoder.encode(request.getPassword()));
        //operador.setEsAdministrador(request.getEsAdministrador() != null ? request.getEsAdministrador() : false);
        operador.setEsAdministrador(esAdministrador);
        if (!esAdministrador && request.getSupervisorId() != null) {
            Operador supervisor = operadorRepository.findById(request.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.super.not-found")));
            operador.setSupervisor(supervisor);
        }

        operador.setFechaRegistro(OffsetDateTime.now());
        operador.setEstaActivo(true);

        return operadorRepository.save(operador);
    }

    @Transactional
    public LoginResponse login(LoginCdmRequest request) {
        String username = request.getEmail() != null ? request.getEmail() : request.getLegajo().toString();
        String token = sessionService.autenticar(username, request.getPassword());
        Operador operador = null;
        if (request.getEmail() != null) {
            operador = operadorRepository.findByEmail(username)
                .orElseThrow(() -> new BadRequestException(messageService.getMessage("err.auth.operator.login.email")));

        } else if (request.getLegajo() != null) {
            operador = operadorRepository.findByLegajo(request.getLegajo())
                .orElseThrow(() -> new BadRequestException(messageService.getMessage("err.auth.operator.login.legajo")));
        } else {
            throw new BadRequestException(messageService.getMessage("cdm.login.err.any-value"));
        }

        Sesion sesion = sessionService.crearSesionOperador(operador, token);

        return LoginResponse.builder()
                .token(sesion.getTokenRestablecimiento())
                .id(operador.getId()) // No aplica para operadores
                .email(operador.getEmail())
                .nombre(operador.getNombre())
                .apellido(operador.getApellido())
                .expiracion(sesion.getExpiracionToken())
                .build();
    }

    @Transactional
    public void logout(String token) {
        sessionService.cerrarSesionCdm(token);
        SecurityContextHolder.clearContext();
    }

    public Operador obtenerOperadorPorToken(String token) {
        SesionCdm sesionCdm = sessionService.obtenerSesionCdmPorToken(token);
        return sesionCdm.getOperador();
    }

}
