package com.secureon.seguridad.dto.response;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  
@AllArgsConstructor
public class EnvioCodigoResponse {
    private boolean enviado;
    private Integer expiracionSegs;
    private OffsetDateTime fechaExpiracion;
}
