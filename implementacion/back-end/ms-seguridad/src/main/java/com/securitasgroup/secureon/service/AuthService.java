package com.securitasgroup.secureon.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.securitasgroup.secureon.config.JwtConfig;
import com.securitasgroup.secureon.dto.request.LoginRequest;
import com.securitasgroup.secureon.dto.request.RegisterRequest;
import com.securitasgroup.secureon.dto.response.LoginResponse;
import com.securitasgroup.secureon.dto.response.UserResponse;
import com.securitasgroup.secureon.exeptions.BadRequestException;
import com.securitasgroup.secureon.model.entity.Dispositivo;
import com.securitasgroup.secureon.model.entity.Sesion;
import com.securitasgroup.secureon.model.entity.Usuario;
import com.securitasgroup.secureon.repository.UsuarioRepository;
import com.securitasgroup.secureon.security.JwtTokenProvider;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private JwtConfig jwtConfig;

    @Autowired
    private DispositivoService dispositivoService;

    @Autowired
    private SessionService sessionService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }
        if (usuarioRepository.existsByTelefono(request.getTelefono())) {
            throw new BadRequestException("El teléfono ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setDireccion(request.getDireccion());
        usuario.setHashContrasena(passwordEncoder.encode(request.getPassword()));
        usuario.setFechaRegistro(OffsetDateTime.now());

        Usuario saved = usuarioRepository.save(usuario);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));

        // Registrar o actualizar dispositivo
        Dispositivo dispositivo = dispositivoService.obtenerDispositivoPorAppId(usuario, request.getDispositivoAppId());

        // Generar token JWT
        String token = tokenProvider.generateToken(authentication);
        Long expiracion = jwtConfig.getExpirationMs();
        // Crear sesión en BD
        Sesion sesion = sessionService.crearSesionUsuario(usuario, dispositivo, token, expiracion);

        return LoginResponse.builder()
                .token(sesion.getTokenRestablecimiento())
                .userId(usuario.getUserId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .dispositivoId(dispositivo.getDispositivoId())
                .expiracion(sesion.getExpiracionToken())
                .build();
    }

    @Transactional
    public void logout(String token) {
        sessionService.cerrarSesionUsuario(token);
        SecurityContextHolder.clearContext();
    }

    public UserResponse currentUser(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));;
        return UserResponse.fromEntity(usuario);
    }
}