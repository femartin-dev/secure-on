package com.secureon.seguridad.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Operador;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.model.entity.SesionCdm;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.repository.SesionCdmRepository;

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
        sesionCdmRepository.findBySesion(sesion)
            .ifPresentOrElse(sesionCdm -> {
                sesionCdmRepository.deleteBySesion(sesionCdm.getSesion());
            }, () -> {
                throw new ResourceNotFoundException(messageService.getMessage("err.user.session.inactive"));
            });
    }

    public SesionCdm obtenerSesionCdmPorToken(String token) {
        return sesionCdmRepository.findBySesionTokenRestablecimiento(token)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.cdm.session.inactive")));
    }

}