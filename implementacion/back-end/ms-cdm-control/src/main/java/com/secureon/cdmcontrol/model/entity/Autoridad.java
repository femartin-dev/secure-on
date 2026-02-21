package com.secureon.cdmcontrol.model.entity;

import java.util.UUID;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(schema = "secure_on_cdmso", name = "autoridades")
@Data
public class Autoridad {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "autoridad_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autoridad_tipo_id", nullable = false)
    private TipoAutoridad tipoAutoridad;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point ubicacionAutoridad;

    private String nombre;
    private String telefono;
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "canal_id", nullable = false)
    private CanalNotificacion canalNotificacion;

    private Boolean habilitada = true;
}
