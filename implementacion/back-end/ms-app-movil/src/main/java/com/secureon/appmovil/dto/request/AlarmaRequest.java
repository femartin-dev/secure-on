package com.secureon.appmovil.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class AlarmaRequest {
    @NotNull
    private UUID userId;

    @NotNull
    private UUID dispositivoId;

    private Integer metodoActivacion; 
    private UbicacionRequest ubicacionInicial;
}
