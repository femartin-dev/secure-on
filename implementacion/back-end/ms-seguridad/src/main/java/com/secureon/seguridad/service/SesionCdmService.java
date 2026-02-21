package com.secureon.seguridad.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.seguridad.exeptions.ResourceNotFoundException;
import com.secureon.seguridad.model.entity.Operador;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.model.entity.SesionCdm;
import com.secureon.seguridad.repository.SesionCdmRepository;
import com.secureon.seguridad.util.MessagesService;

import jakarta.transaction.Transactional;

@Service
public class SesionCdmService extends SesionService {
    
    @Autowired
    private SesionCdmRepository sesionCdmRepository;

    @Autowired
    private MessagesService messageService;

    @Transactional
    public Sesion crearSesionOperador(Operador operador, String token) {
        sesionCdmRepository.deleteByOperador(operador);
        Sesion sesion = super.crearSesion(token);
        SesionCdm sesionCdm = new SesionCdm();
        sesionCdm.setSesion(sesion);
        sesionCdm.setOperador(operador);
        sesionCdmRepository.save(sesionCdm);
        return sesion;
    }

    @Transactional
    public void cerrarSesionCdm(String token) {
        super.cerrarSesion(token, this::cerrarSesionCdm);
    }

    @Transactional
    public void cerrarSesionCdm(Sesion sesion) {
        sesionCdmRepository.deleteBySesion(sesion);
    }

    public SesionCdm obtenerSesionCdmPorToken(String token) {
        return sesionCdmRepository.findBySesionTokenRestablecimiento(token)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.cdm.session.inactive")));
    }

}