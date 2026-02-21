package com.secureon.seguridad.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.seguridad.exeptions.ResourceNotFoundException;
import com.secureon.seguridad.model.entity.Dispositivo;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.model.entity.SesionApp;
import com.secureon.seguridad.model.entity.Usuario;
import com.secureon.seguridad.repository.SesionAppRepository;
import com.secureon.seguridad.util.MessagesService;

import jakarta.transaction.Transactional;

@Service
public class SesionAppService extends SesionService  {
    
    @Autowired
    private SesionAppRepository sesionUsuarioRepository;

    @Autowired
    private MessagesService messageService;
    
    @Transactional
    public Sesion crearSesionUsuario(Usuario usuario, Dispositivo dispositivo, String token) {
        sesionUsuarioRepository.deleteByUsuarioAndDispositivo(usuario, dispositivo);
        Sesion sesion = super.crearSesion(token);
        SesionApp sesionUsuario = new SesionApp();
        sesionUsuario.setSesion(sesion);
        sesionUsuario.setUsuario(usuario);
        sesionUsuario.setDispositivo(dispositivo);
        sesionUsuarioRepository.save(sesionUsuario);
        return sesion;
    }

    @Transactional
    public void cerrarSesionUsuario(String token) {
        super.cerrarSesion(token, this::cerrarSesionApp);
    }

    @Transactional
    public void cerrarSesionApp(Sesion sesion) {
        sesionUsuarioRepository.deleteBySesion(sesion);
    }

    public SesionApp obtenerSesionUsuarioPorToken(String token) {
        return sesionUsuarioRepository.findBySesionTokenRestablecimiento(token)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.user.session.inactive")));
    }

}