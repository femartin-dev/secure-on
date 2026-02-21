package com.secureon.cdmcontrol.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(schema = "secure_on_cdmso", name = "alarmas_operadores")
@Data
public class AlarmaOperador {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "asignacion_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarma_id", nullable = false)
    private Alarma alarma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id")
    private Operador operador;

    @Column(name = "fecha_asignacion")
    private OffsetDateTime fechaAsignacion = OffsetDateTime.now();

    @Column(name = "es_asignacion_auto")
    private Boolean esAsignacionAuto = false;

    @Column(name = "fecha_verificacion")
    private OffsetDateTime fechaVerificacion;

    @Column(name = "observaciones_verificacion")
    private String observacionesVerificacion;

    @Column(name = "falsa_alarma")
    private Boolean falsaAlarma = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id")
    private EstadoAsignacion estadoAsignacion;
}
