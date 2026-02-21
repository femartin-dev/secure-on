package com.secureon.appmovil.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.model.entity.EstadoAlarma;
import com.secureon.appmovil.repository.EstadoAlarmaRepository;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EstadoAlarmaService {

    private final EstadoAlarmaRepository estadoAlarmaRepository;

    @Value("${app.static-values.estado-alarma.activa}")
    private Integer estadoActivaId;

    @Value("${app.static-values.estado-alarma.finalizada}")
    private Integer estadoFinalizadaId;

    @Value("${app.static-values.estado-alarma.cancelada}")
    private Integer estadoCanceladaId;

    @Getter
    private EstadoAlarma estadoActiva;

    @Getter
    private EstadoAlarma estadoFinalizada;

    @Getter
    private EstadoAlarma estadoCancelada;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        this.estadoActiva = getEstadoAlarma(estadoActivaId);
        this.estadoFinalizada = getEstadoAlarma(estadoFinalizadaId);
        this.estadoCancelada = getEstadoAlarma(estadoCanceladaId);
    }

    public EstadoAlarma getEstadoAlarma(Integer id) {
        return estadoAlarmaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado de alarma no encontrado"));
    }
    
    @Cacheable(value = "catalogos", key = "'estadosAlarma'")
    public List<EstadoAlarma> getEstadosAlarma() {
        return estadoAlarmaRepository.findByHabilitadaTrue();
    }
}
