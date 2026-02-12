package com.securitasgroup.secureon.service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.securitasgroup.secureon.model.entity.Dispositivo;
import com.securitasgroup.secureon.model.entity.OperadorCdm;
import com.securitasgroup.secureon.model.entity.Sesion;
import com.securitasgroup.secureon.model.entity.SesionCdm;
import com.securitasgroup.secureon.model.entity.SesionUsuario;
import com.securitasgroup.secureon.model.entity.Usuario;
import com.securitasgroup.secureon.repository.SesionCdmRepository;
import com.securitasgroup.secureon.repository.SesionRepository;
import com.securitasgroup.secureon.repository.SesionUsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class SessionService {
    @Autowired
    private SesionRepository sesionRepository;
    
    @Autowired
    private SesionUsuarioRepository sesionUsuarioRepository;
    
    @Autowired
    private SesionCdmRepository sesionCdmRepository;

    @Transactional
    public Sesion crearSesionUsuario(Usuario usuario, Dispositivo dispositivo, String token, Long expiracion) {
        // Invalidar sesiones anteriores del mismo usuario/dispositivo (logout implícito)
        sesionUsuarioRepository.deleteByUsuarioAndDispositivo(usuario, dispositivo);
        OffsetDateTime expiracionToken = OffsetDateTime.now().plusSeconds(expiracion / 1000);
        Sesion sesion = new Sesion();
        sesion.setFechaLogin(OffsetDateTime.now());
        sesion.setTokenRestablecimiento(token); // Guardamos el JWT aquí
        sesion.setExpiracionToken(expiracionToken); // Ajustar según expiración del token
        sesion.setMfaHabilitado(false);
        sesion = sesionRepository.save(sesion);
        
        SesionUsuario sesionUsuario = new SesionUsuario();
        sesionUsuario.setSesion(sesion);
        sesionUsuario.setUsuario(usuario);
        sesionUsuario.setDispositivo(dispositivo);
        sesionUsuarioRepository.save(sesionUsuario);
        
        return sesion;
    }

    @Transactional
    public void cerrarSesionUsuario(String token) {
        // Buscar sesión por token y eliminarla
        Optional<Sesion> sesionOpt = sesionRepository.findByTokenRestablecimiento(token);
        sesionOpt.ifPresent(sesion -> cerrarSesion(sesion, true));
    }

    @Transactional
    public Sesion crearSesionOperador(OperadorCdm operador, String token, Long expiracion) {
        // Invalidar sesiones anteriores del mismo usuario/dispositivo (logout implícito)
        sesionCdmRepository.deleteByOperadorCdm(operador);
        OffsetDateTime expiracionToken = OffsetDateTime.now().plusSeconds(expiracion / 1000);
        Sesion sesion = new Sesion();
        sesion.setFechaLogin(OffsetDateTime.now());
        sesion.setTokenRestablecimiento(token); // Guardamos el JWT aquí
        sesion.setExpiracionToken(expiracionToken); // Ajustar según expiración del token
        sesion.setMfaHabilitado(false);
        sesion = sesionRepository.save(sesion);
        
        SesionCdm sesionCdm = new SesionCdm();
        sesionCdm.setSesion(sesion);
        sesionCdm.setOperador(operador);
        sesionCdmRepository.save(sesionCdm);
        
        return sesion;
    }

    @Transactional
    public void cerrarSesionOperador(String token) {
        // Buscar sesión por token y eliminarla
        Optional<Sesion> sesionOpt = sesionRepository.findByTokenRestablecimiento(token);
        sesionOpt.ifPresent(sesion -> cerrarSesion(sesion, false));
    }

    private void cerrarSesion(Sesion sesion, boolean isUsuario) {
        if (isUsuario) {
            sesionUsuarioRepository.deleteBySesion(sesion);
        } else {
            sesionCdmRepository.deleteBySesion(sesion);
        }
        sesionRepository.delete(sesion);
    } 
}
