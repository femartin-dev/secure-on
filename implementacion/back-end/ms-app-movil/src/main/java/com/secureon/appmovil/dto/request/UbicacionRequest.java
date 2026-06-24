package com.secureon.appmovil.dto.request;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class UbicacionRequest {
    @NotNull
    @DecimalMin(value = "-90.0", message = "{err.msg.lat.range}")
    @DecimalMax(value = "90.0", message = "{err.msg.lat.range}")
    private BigDecimal latitud;
    @NotNull
    @DecimalMin(value = "-180.0", message = "{err.msg.lon.range}")
    @DecimalMax(value = "180.0", message = "{err.msg.lon.range}")
    private BigDecimal longitud;
    private BigDecimal altitud;
    private BigDecimal velocidad;
    private BigDecimal rumbo;
    private Integer precision;
    private Integer metodoUbicacionId; 
    private Integer bateria;
    private OffsetDateTime fecha = OffsetDateTime.now(); 
}
