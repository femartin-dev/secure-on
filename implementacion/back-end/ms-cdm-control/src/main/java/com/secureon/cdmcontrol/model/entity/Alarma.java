package com.secureon.cdmcontrol.model.entity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "secure_on_movil", name = "alarmas")
@Data
@Setter
@Getter
public class Alarma {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "alarma_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispositivo_id", nullable = false)
    private Dispositivo dispositivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_act_id", nullable = false)
    private MetodoActivacion metodoActivacion;

    @Column(name = "fecha_activacion", nullable = false, updatable = false)
    private OffsetDateTime fechaActivacion;

    @Column(name = "fecha_finalizacion")
    private OffsetDateTime fechaFinalizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoAlarma estadoAlarma; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prioridad_id", nullable = false)
    private PrioridadAlarma prioridad;

    @Column(name = "fue_reactivada")
    private Boolean fueReactivada = false;

    @Column(name = "cancelada_por_cdm")
    private Boolean canceladaPorCdm = false;

    @OneToMany(mappedBy = "alarma", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ubicacion> ubicaciones;

    @OneToMany(mappedBy = "alarma", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AlarmaOperador> alarmaOperador;
}
