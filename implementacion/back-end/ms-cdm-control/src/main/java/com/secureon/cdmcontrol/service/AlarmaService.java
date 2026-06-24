package com.secureon.cdmcontrol.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.model.entity.Ubicacion;
import com.secureon.common.util.MessagesService;
import com.secureon.cdmcontrol.repository.AlarmaRepository;
import com.secureon.cdmcontrol.repository.UbicacionRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AlarmaService {

    @Autowired
    private AlarmaRepository alarmaRepository;

    @Autowired
    private UbicacionRepository ubicacionRepository;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private PrioridadService prioridadService;

    @Autowired
    private MessagesService messagesService;



    public Page<Alarma> listarAlarmas(Integer estadoId, Integer prioridadId,
                                    OffsetDateTime fechaDesde, OffsetDateTime fechaHasta,
                                    Pageable pageable) {
        EstadoAlarma estado = catalogoService.getEstadoAlarma(estadoId);
        PrioridadAlarma prioridad = prioridadService.getPrioridadAlarma(prioridadId);
        return alarmaRepository.buscarConFiltros(estado, prioridad, fechaDesde, fechaHasta, pageable);
    }

    public Alarma obtenerAlarma(UUID id) {
        return obtenerAlarma(id, true);
    }
            

    public Alarma obtenerAlarma(UUID id, boolean showId) {
        return alarmaRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(showId ? 
                        messagesService.getMessage("error.alarma.not-found.by-id", id) : 
                        messagesService.getMessage("error.alarma.not-found")));
    }

    public List<Ubicacion> obtenerUbicaciones(Alarma alarma) {
        return ubicacionRepository.findByAlarmaOrderByFechaTomaAsc(alarma);
    }

    public List<Ubicacion> obtenerUbicaciones(UUID alarmaId) {
        return obtenerUbicaciones(obtenerAlarma(alarmaId));
    }

    @Transactional
    public Alarma actualizarAlarma(UUID alarmaId, Integer estadoId, Integer prioridadId) {
        Alarma alarma = obtenerAlarma(alarmaId);
        if (prioridadId != null)
            alarma.setPrioridad(prioridadService.getPrioridadAlarma(prioridadId));
        if (estadoId != null)
            alarma.setEstadoAlarma(catalogoService.getEstadoAlarma(estadoId));
        Alarma saved = alarmaRepository.save(alarma);
        
        //notificationService.notificarCambioAlerta(saved);
        return saved;
    }

    @Transactional
    public Alarma actualizarPrioridad(UUID alarmaId, Integer prioridadId) {
        return actualizarAlarma(alarmaId, null, prioridadId);
    }

    @Transactional
    public Alarma actualizarEstado(UUID alarmaId, Integer estadoId) {
        return actualizarAlarma(alarmaId, estadoId, null);
    }
}