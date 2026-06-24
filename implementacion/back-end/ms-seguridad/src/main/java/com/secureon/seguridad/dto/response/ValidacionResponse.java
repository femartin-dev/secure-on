package com.secureon.seguridad.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidacionResponse {
    private boolean valido;
    private String mensaje;
}
