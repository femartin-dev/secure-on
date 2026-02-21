package com.secureon.cdmcontrol.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.PrioridadAlarma;
import com.secureon.cdmcontrol.model.entity.Ubicacion;
import com.secureon.cdmcontrol.repository.AlarmaRepository;
import com.secureon.cdmcontrol.repository.UbicacionRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
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


    //@Autowired
    //private WebSocketNotificationService notificationService;

    public Page<Alarma> listarAlarmas(Integer estadoId, Integer prioridadId,
                                    OffsetDateTime fechaDesde, OffsetDateTime fechaHasta,
                                    Pageable pageable) {
        EstadoAlarma estado = catalogoService.getEstadoAlarma(estadoId);
        PrioridadAlarma prioridad = prioridadService.getPrioridadAlarma(prioridadId);
        return alarmaRepository.buscarConFiltros(estado, prioridad, fechaDesde, fechaHasta, pageable);
    }
            

    public Optional<Alarma> obtenerAlarma(UUID id) {
        return alarmaRepository.findById(id);
    }

    public List<Ubicacion> obtenerUbicaciones(Alarma alarma) {
        return ubicacionRepository.findByAlarmaOrderByFechaTomaAsc(alarma);
    }

    public List<Ubicacion> obtenerUbicaciones(UUID alarmaId) {
        return obtenerUbicaciones(obtenerAlarma(alarmaId)
                    .orElseThrow(() -> new RuntimeException("Alerta no encontrada")));
    }

    @Transactional
    public Alarma actualizarAlarma(UUID alarmaId, Integer estadoId, Integer prioridadId) {
        Alarma alarma = alarmaRepository.findById(alarmaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
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