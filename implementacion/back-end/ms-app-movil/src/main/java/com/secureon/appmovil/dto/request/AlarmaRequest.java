package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlarmaRequest {
    @NotNull
    private UUID usuarioId;

    @NotNull
    private UUID dispositivoId;
    
    @NotNull
    private Integer metodoActivacion; 
    private UbicacionRequest ubicacion;
    private OffsetDateTime fechaActivacion = OffsetDateTime.now();
}
