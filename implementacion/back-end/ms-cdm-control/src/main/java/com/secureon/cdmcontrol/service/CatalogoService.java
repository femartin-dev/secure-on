package com.secureon.cdmcontrol.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.EstadoAsignacion;
import com.secureon.common.model.entity.TipoAutoridad;
import com.secureon.cdmcontrol.repository.EstadoAlarmaRepository;
import com.secureon.cdmcontrol.repository.EstadoAsignacionRepository;
import com.secureon.cdmcontrol.repository.TipoAutoridadRepository;
import com.secureon.common.util.MessagesService;

@Service
public class CatalogoService {

    @Autowired
    private MessagesService messagesService;

    @Autowired
    private EstadoAsignacionRepository estadoAsignacionRepository;

    @Autowired
    private EstadoAlarmaRepository estadoAlarmaRepository;

    @Autowired
    private TipoAutoridadRepository tipoAutoridadRepository;

    public EstadoAsignacion getEstadoAsignacion(Integer id) {
        return estadoAsignacionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.estado-asignacion.not-found", id)));
    }

    public List<EstadoAsignacion> getEstadosAsignacion() {
        return estadoAsignacionRepository.findByHabilitadaTrue();
    }


    public EstadoAlarma getEstadoAlarma(Integer id) {
        return estadoAlarmaRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.estado-alarma.not-found", id)));
    }

    public List<EstadoAlarma> getEstadosAlarma() {
        return estadoAlarmaRepository.findByHabilitadaTrue();
    }

    public TipoAutoridad getTipoAutoridad(Integer id) {
        return tipoAutoridadRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.tipo-autoridad.not-found", id)));
    }

    public List<TipoAutoridad> getTiposAutoridad() {
        return tipoAutoridadRepository.findByHabilitadaTrue();
    }

}