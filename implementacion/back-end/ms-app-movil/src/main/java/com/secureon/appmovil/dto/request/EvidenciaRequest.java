package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvidenciaRequest {
    @NotNull
    private Integer tipoEvidencia;
    @NotNull
    private byte[] data;
    @NotNull
    private String mimeType;
    @NotNull
    private OffsetDateTime fechaCaptura;
    private Integer nivelBateria;
    private UbicacionRequest ubicacion;

}
