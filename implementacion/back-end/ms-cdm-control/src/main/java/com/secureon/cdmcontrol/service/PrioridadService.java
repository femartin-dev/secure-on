package com.secureon.cdmcontrol.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.cdmcontrol.repository.PrioridadRepository;
import com.secureon.common.util.MessagesService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PrioridadService {
    
    @Autowired
    private PrioridadRepository prioridadRepository;

    @Autowired
    private MessagesService messagesService;

    @PostConstruct
    private void init() {
        prioridadRepository.findAll().forEach(this::setValoracionPrioridad);
    }

    private void setValoracionPrioridad(PrioridadAlarma prioridad)  {
        try {
            String tag = String.format("prioridad.valoracion.{0}", prioridad.getDescripcion().toLowerCase());
            Integer valoracion = Integer.valueOf(messagesService.getMessage(tag));
            prioridad.setValoracion(valoracion);
        } catch (Exception e) {
            log.info(String.format("Valoracion de la prioridad {0} no encontrada.", prioridad.getDescripcion()));
            prioridad.setValoracion(0);
        }
    }

    public PrioridadAlarma getPrioridadAlarma(Integer id) {
        Optional<PrioridadAlarma> prioridad = prioridadRepository.findById(id);
        if (prioridad.isEmpty()) {
            throw new ResourceNotFoundException(String.format("Prioridad no encontrada para id {0}", id));
        } else if (!prioridad.get().getHabilitada()) {
            throw new ResourceNotFoundException(String.format("Prioridad {0} no esta habilitada", prioridad.get().getDescripcion()));
        }
        return prioridad.get();
    }

    
}