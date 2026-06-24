package com.secureon.appmovil.dto.request;

import java.time.OffsetDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FinalizarRequest {
    private OffsetDateTime fechaFinalizacion = OffsetDateTime.now();
}
