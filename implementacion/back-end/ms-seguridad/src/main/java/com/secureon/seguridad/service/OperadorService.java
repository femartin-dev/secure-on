package com.secureon.seguridad.service;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.secureon.seguridad.dto.request.LoginCdmRequest;
import com.secureon.seguridad.dto.request.RegistrarOperadorRequest;
import com.secureon.seguridad.dto.response.LoginResponse;
import com.secureon.seguridad.exeptions.BadRequestException;
import com.secureon.seguridad.exeptions.ResourceNotFoundException;
import com.secureon.seguridad.model.entity.Operador;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.model.entity.SesionCdm;
import com.secureon.seguridad.repository.OperadorRepository;
import com.secureon.seguridad.util.MessagesService;

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
            throw new BadRequestException(messageService.getMessage("err.email.invalid"));
        }
        if (operadorRepository.existsByTelefono(request.getTelefono())) {
            throw new BadRequestException(messageService.getMessage("err.uname.invalid"));
        }
        if (operadorRepository.existsByLegajo(request.getLegajo())) {
            throw new BadRequestException(messageService.getMessage("err.nfile.invalid"));
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
        String token = sessionService.autenticar(request.getEmail(), request.getPassword());

        Operador operador = operadorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException(messageService.getMessage("err.operator.not-found")));

        Sesion sesion = sessionService.crearSesionOperador(operador, token);

        return LoginResponse.builder()
                .token(sesion.getTokenRestablecimiento())
                .id(operador.getOperadorId()) // No aplica para operadores
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
