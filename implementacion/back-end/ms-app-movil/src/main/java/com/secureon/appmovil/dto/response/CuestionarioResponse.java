package com.secureon.appmovil.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.util.StringUtils;

import com.secureon.common.model.entity.Cuestionario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CuestionarioResponse {
    private UUID id;
    private UUID alarmaId;
    private Integer motivoActivacionId;
    private String descripcionIncidente;
    private Integer estadoSaludId;
    private Boolean requiereAsistencia;
    private String autoridadesContactadas;
    private Integer evaluacionAutoridades;
    private String daniosMateriales;
	private Integer evaluacionSistema;
	private String observaciones;
    private OffsetDateTime fechaInicio;
    private OffsetDateTime fechaFin;
    private Integer porcentajeCompleto;
    private Boolean esBorrador;

    public static CuestionarioResponse fromEntity(Cuestionario cuestionario) {
        return CuestionarioResponse.builder()
                .id(cuestionario.getId())
                .alarmaId(cuestionario.getAlarma().getId())
                .motivoActivacionId(cuestionario.getMotivoActivacion().getId())
                .descripcionIncidente(cuestionario.getDescripcionIncidente())
                .estadoSaludId(cuestionario.getEstadoSaludUsuario().getId())
                .requiereAsistencia(cuestionario.getRequiereAsistencia())
                .autoridadesContactadas(cuestionario.getAutoridadesContactadas())
                .evaluacionAutoridades(cuestionario.getEvaluacionAutoridades())
                .daniosMateriales(cuestionario.getDaniosMateriales())
                .evaluacionSistema(cuestionario.getEvaluacionSistema())
                .observaciones(cuestionario.getObservaciones())
                .fechaInicio(cuestionario.getFechaInicio())
                .fechaFin(cuestionario.getFechaFin())
                // Cálculo de porcentaje completo basado en campos llenados
                .porcentajeCompleto(calcularPorcentajeCompleto(cuestionario))
                .esBorrador(cuestionario.getFechaFin() == null) // Si no tiene fecha de fin, se considera borrador
                .build();
    }

    private static Integer calcularPorcentajeCompleto(Cuestionario cuestionario) {
        int totalCampos = 8; // Total de campos relevantes para completar
        int camposLlenados = 0;
        if (StringUtils.hasText(cuestionario.getDescripcionIncidente())) camposLlenados++;
        if (cuestionario.getEstadoSaludUsuario() != null) camposLlenados++;
        if (cuestionario.getRequiereAsistencia() != null) camposLlenados++;
        if (StringUtils.hasText(cuestionario.getAutoridadesContactadas())) camposLlenados++;
        if (cuestionario.getEvaluacionAutoridades() != null) camposLlenados++;
        if (StringUtils.hasText(cuestionario.getDaniosMateriales())) camposLlenados++;
        if (cuestionario.getEvaluacionSistema() != null) camposLlenados++;
        if (StringUtils.hasText(cuestionario.getObservaciones())) camposLlenados++;
        return (int) ((camposLlenados / (double) totalCampos) * 100);
    }

        
}
