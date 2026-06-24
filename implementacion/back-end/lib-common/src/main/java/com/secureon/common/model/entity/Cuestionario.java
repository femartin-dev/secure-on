package com.secureon.common.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

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
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "secure_on_movil", name = "cuestionarios")
@Data
@Getter
@Setter
public class Cuestionario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cuestionario_id")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alarma_id", nullable = false)
    private Alarma alarma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motivo_act_id", nullable = false)
    private MotivoActivacion motivoActivacion;

    @Column(name = "descripcion_incidente")
    private String descripcionIncidente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_usuario", nullable = false)
    private EstadoSalud estadoSaludUsuario;

    @Column(name = "requiere_asistencia")
    private Boolean requiereAsistencia;
    // Sección: Respuesta de Autoridades
    @Column(name = "autoridades_contactadas")
    private String autoridadesContactadas;
    @Column(name = "evaluacion_autoridades")
    private Integer evaluacionAutoridades;
    @Column(name = "danios_materiales")
    private String daniosMateriales;
    @Column(name = "evaluacion_sistema")
	private Integer evaluacionSistema;

	@Column(name = "observaciones")
	private String observaciones;
    // Sección: Metadatos
    @Column(name = "fecha_inicio")
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime fechaInicio;
    @Column(name = "fecha_fin")
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime fechaFin;
}
