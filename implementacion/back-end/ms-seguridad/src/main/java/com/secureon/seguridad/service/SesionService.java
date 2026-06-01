package com.secureon.seguridad.service;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.exception.UnauthorizedException;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.repository.SesionRepository;
import com.secureon.seguridad.security.CustomUserDetailsService;
import com.secureon.seguridad.security.JwtTokenProvider;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SesionService {
    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private MessagesService messageService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Transactional
    public String autenticar(String username, String password) {

        log.info("Intentando autenticar usuario '{}'", username);
        Authentication authentication;
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDetails.getUsername(), password)
            );
        } catch (BadCredentialsException ex) {
            log.info("Fallo autenticacion para usuario '{}': {}", username, ex.getClass().getSimpleName());
            throw new UnauthorizedException(messageService.getMessage("error.bad-credentials"));
        } catch (AuthenticationException ex) {
            log.info("Fallo autenticacion para usuario '{}': {}", username, ex.getClass().getSimpleName());
            throw new UnauthorizedException(messageService.getMessage("error.unauthorized"));
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);

    }


    @Transactional
    public Sesion crearSesion(String token) {
        OffsetDateTime expiracion = tokenProvider.getExpiration(token)
                                                .toInstant()
                                                .atZone(ZoneId.systemDefault())
                                                .toOffsetDateTime();
        Sesion sesion = new Sesion();
        sesion.setFechaLogin(OffsetDateTime.now());
        sesion.setTokenRestablecimiento(token); 
        sesion.setExpiracionToken(expiracion); 
        sesion.setMfaHabilitado(false);
        return sesionRepository.save(sesion);
    }

    @Transactional
    public void cerrarSesion(String token, SesionInterface callback) {
        sesionRepository.findByTokenRestablecimiento(token)
                        .ifPresentOrElse(sesion ->  {
                                callback.cerrarSesion(sesion);
                                sesionRepository.delete(sesion); 
                                }, () -> {
                                    throw new ResourceNotFoundException(messageService.getMessage("err.session.not-found.token"));
                                });

    }

    public Sesion obtenerSesion(String token) {
        return sesionRepository.findByTokenRestablecimiento(token)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.session.not-found.token")));
    }

}
