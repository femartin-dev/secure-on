package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UbicacionRequest {
    @NotNull
    @DecimalMin(value = "-90.0", message = "{err.msg.lat.range}")
    @DecimalMax(value = "90.0", message = "{err.msg.lat.range}")
    private Double lat;
    @NotNull
    @DecimalMin(value = "-180.0", message = "${err.msg.lng.range}")
    @DecimalMax(value = "180.0", message = "${err.msg.lng.range}")
    private Double lng;
    private Integer precision;
    private Integer metodo; 
    private Integer bateria;
    @Builder.Default
    private OffsetDateTime fecha = OffsetDateTime.now(); 
}
