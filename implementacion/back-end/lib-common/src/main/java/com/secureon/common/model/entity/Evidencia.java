package com.secureon.common.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.secureon.common.model.converter.OffsetDateTimeConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(schema = "secure_on_movil", name = "evidencias")
@Data
public class Evidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evidencia_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarma_id", nullable = false)
    private Alarma alarma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidencia_tipo_id", nullable = false)
    private TipoEvidencia tipoEvidencia;

    @Column(name = "fecha_toma", nullable = false)
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime fechaCaptura;

    @Column(name = "ubicacion_toma", columnDefinition = "GEOGRAPHY(POINT, 4326)")
    private Point ubicacionCaptura;

    @Column(name = "bateria_nivel")
    private Integer bateriaNivel;

    @Column(name = "enviado_cdm", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean enviadoCdm;

    @Column(name = "fecha_envio_cdm", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime fechaEnvioCdm;

    @Transient
    private byte[] rawData; // Campo transitorio para contener los datos base64 al recibir la evidencia desde el móvil

    @Transient
    private String mimeType; // Campo transitorio para contener el tipo MIME de la evidencia
}
