package com.secureon.cdmcontrol.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;
import com.secureon.cdmcontrol.repository.EstadoAlarmaRepository;
import com.secureon.cdmcontrol.repository.EstadoAsignacionRepository;
import com.secureon.cdmcontrol.util.MessageService;

@Service
public class CatalogoService {

    @Autowired
    private MessageService messageService;

    @Autowired
    private EstadoAsignacionRepository estadoAsignacionRepository;

    @Autowired
    private EstadoAlarmaRepository estadoAlarmaRepository;

    public EstadoAsignacion getEstadoAsignacion(Integer id) {
        return estadoAsignacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Estado de asignacion no encontrado"));
    }

    public List<EstadoAsignacion> getEstadosAsignacion() {
        return estadoAsignacionRepository.findByHabilitadaTrue();
    }


    public EstadoAlarma getEstadoAlarma(Integer id) {
        return estadoAlarmaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Estado de asignacion no encontrado"));
    }

    public List<EstadoAlarma> getEstadosAlarma() {
        return estadoAlarmaRepository.findByHabilitadaTrue();
    }

}
