package com.secureon.seguridad.service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.secureon.seguridad.exeptions.ResourceNotFoundException;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.repository.SesionRepository;
import com.secureon.seguridad.security.JwtTokenProvider;
import com.secureon.seguridad.util.MessagesService;

import jakarta.transaction.Transactional;

@Service
public class SesionService {
    @Autowired
    private SesionRepository sesionRepository;

    @Autowired
    private MessagesService messageService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public String autenticar(String username, String password) {
        // sanitize username: trim and normalize to NFC (UTF-8 compatible)
        if (username != null) {
            username = username.trim();
            // normalize any composed characters so database lookup is consistent
            username = java.text.Normalizer.normalize(username, java.text.Normalizer.Form.NFC);
        }

        // log for debugging (remove/adjust level in production)
        // log.debug("auth request username='{}' (len={})", username, username != null ? username.length() : 0);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
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
        Optional<Sesion> sesionOpt = sesionRepository.findByTokenRestablecimiento(token);
        sesionOpt.ifPresent(sesion ->  {
                callback.cerrarSesion(sesion);
                sesionRepository.delete(sesion); });
    }

    public Sesion obtenerSesion(String token) {
        return sesionRepository.findByTokenRestablecimiento(token)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.session.not-found.token")));
    }

}
