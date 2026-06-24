package com.secureon.seguridad.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.BadRequestException;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.model.entity.SesionApp;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.dto.request.LoginAppRequest;
import com.secureon.seguridad.dto.request.RegistrarUsuarioRequest;
import com.secureon.seguridad.dto.response.LoginResponse;
import com.secureon.seguridad.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DispositivoService dispositivoService;

    @Autowired
    private SesionAppService sessionService;

    @Autowired
    private MessagesService messageService;

    @Transactional
    public Usuario registrar(RegistrarUsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(messageService.getMessage("err.email.not-available"));
        }
        if (usuarioRepository.existsByTelefono(request.getTelefono())) {
            throw new BadRequestException(messageService.getMessage("err.phone.not-available"));
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setDireccion(request.getDireccion());
        usuario.setHashContrasena(passwordEncoder.encode(request.getPassword()));
        usuario.setFechaRegistro(OffsetDateTime.now());
        usuario.setEstaActivo(false);

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return savedUsuario;
    }

    @Transactional
    public LoginResponse login(LoginAppRequest request) {
        String username = request.getEmail() != null ? request.getEmail() : request.getTelefono();
        String token = sessionService.autenticar(username, request.getPassword());
        Usuario usuario = null;
        if (request.getEmail() != null) {
            usuario = usuarioRepository.findByEmail(username)
                    .orElseThrow(() -> new BadRequestException(messageService.getMessage("err.auth.user.login.email")));

        } else if (request.getTelefono() != null) {
            usuario = usuarioRepository.findByTelefono(username)
                .orElseThrow(() -> new BadRequestException(messageService.getMessage("err.auth.user.login.phone")));
        } else {
            throw new BadRequestException(messageService.getMessage("usr.login.err.any-value"));
        }

        Dispositivo dispositivo = dispositivoService.obtenerPorAppId(usuario, request.getDispositivoAppId());

        Sesion sesion = sessionService.crearSesionUsuario(usuario, dispositivo, token);

        return LoginResponse.builder()
                            .token(sesion.getTokenRestablecimiento())
                            .id(usuario.getId())
                            .email(usuario.getEmail())
                            .nombre(usuario.getNombre())
                            .apellido(usuario.getApellido())
                            .dispositivoId(dispositivo.getId())
                            .expiracion(sesion.getExpiracionToken())
                            .build();
    }

    @Transactional
    public void logout(String token) {
        sessionService.cerrarSesionUsuario(token);
        SecurityContextHolder.clearContext();
    }

    public Usuario obtenerUsuarioPorToken(String token) {
        SesionApp sesionUsuario = sessionService.obtenerSesionUsuarioPorToken(token);
        return sesionUsuario.getUsuario();
    }

    protected Usuario getUsuarioPorId(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.user.not-found.id")));
    }

    public void activarUsuario(UUID usuarioId) {
        Usuario usuario = getUsuarioPorId(usuarioId);
        if (usuario.getEstaActivo()) {
            throw new BadRequestException(messageService.getMessage("err.user.already-active"));
        }
        usuario.setEstaActivo(true);
        usuarioRepository.save(usuario);
    }
}