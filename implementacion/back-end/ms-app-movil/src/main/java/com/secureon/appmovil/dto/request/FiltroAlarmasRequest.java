package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;


@Data
public class FiltroAlarmasRequest {
    private UUID usuarioId;
    private Integer estadoId;
    private OffsetDateTime fechaDesde;
    private OffsetDateTime fechaHasta;
}
