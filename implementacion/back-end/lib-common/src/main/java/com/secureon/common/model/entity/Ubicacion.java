package com.secureon.common.model.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.secureon.common.model.converter.PointSerializer;

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
@Table(schema = "secure_on_movil", name = "ubicaciones")
@Data
public class Ubicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ubicacion_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarma_id", nullable = false)
    private Alarma alarma;

    @Column(columnDefinition = "geography(Point,4326)")
    @JsonSerialize(using = PointSerializer.class)
    private Point posicion;

    @Column(name = "precision_toma")
    private Integer precision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_ubic_id", nullable = false)
    private MetodoUbicacion metodoUbicacion;

    @Column(name = "bateria_nivel")
    private Integer bateriaNivel;

    @Column(name = "altura")
    private BigDecimal altura;

    @Column(name = "velocidad")
    private BigDecimal velocidad;

    @Column(name = "rumbo")
    private BigDecimal rumbo;

    @Column(name = "fecha_toma")
    private OffsetDateTime fechaToma;
}