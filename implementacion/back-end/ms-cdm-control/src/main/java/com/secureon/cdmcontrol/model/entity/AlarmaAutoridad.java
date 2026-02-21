package com.secureon.cdmcontrol.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "alarmas_autoridades", schema = "secure_on_cdmso")
@Data
public class AlarmaAutoridad {

    @Id
    @GeneratedValue
    @Column(name = "notificacion_id", nullable = false, updatable = false)
    private UUID notificacionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignacion_id", nullable = false)
    private AlarmaOperador asignacionOperador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarma_id", nullable = false)
    private Alarma alarma;

    @Column(name = "fecha_notificacion", nullable = false)
    private OffsetDateTime fechaNotificacion;

    @Column(name = "observaciones_notificacion")
    private String observacionesNotificacion;

    @Column(name = "tiempo_respuesta_seg")
    private Integer tiempoRespuestaSeg;
}