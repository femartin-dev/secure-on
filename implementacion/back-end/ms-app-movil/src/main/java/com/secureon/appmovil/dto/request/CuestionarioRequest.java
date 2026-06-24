package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.util.StringUtils;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CuestionarioRequest {
    @NotNull
    private UUID alarmaId;
    
    private Integer motivoActivacionId;

    private String descripcionIncidente;

    private Integer estadoSaludId;

    private Boolean requiereAsistencia;
    
    private String autoridadesContactadas;

    @Min(value = 0, message = "${err.msg.eval-aut.min}")
    @Max(value = 10, message = "${err.msg.eval-aut.max}")
    private Integer evaluacionAutoridades;

    private String daniosMateriales;

    @Min(value = 0, message = "${err.msg.eval-sis.min}")
    @Max(value = 10, message = "${err.msg.eval-sis.max}")
	private Integer evaluacionSistema;
	private String observaciones;
    private OffsetDateTime fechaInicio;
    private Boolean esBorrador = true;

    @AssertTrue(message = "{error.validation.questionnaire-end}")
    public boolean validacionFinalizacion() {
        return esBorrador || (
            motivoActivacionId != null &&
            estadoSaludId != null && 
            evaluacionAutoridades != null &&
            evaluacionSistema != null && 
            fechaInicio != null &&
            StringUtils.hasText(descripcionIncidente) &&
            StringUtils.hasText(daniosMateriales) &&
            StringUtils.hasText(autoridadesContactadas) &&
            StringUtils.hasText(observaciones));
    }
    
}
