package com.secureon.cdmcontrol.dto.response;

import java.util.UUID;

import com.secureon.cdmcontrol.model.entity.Operador;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupervisorResponse {
    private UUID id;
    private String nombre;
    private String apellido;
    private Integer legajo;

    public static SupervisorResponse fromEntity(Operador operador) {
        return SupervisorResponse.builder()
                .id(operador.getId())
                .nombre(operador.getNombre())
                .apellido(operador.getApellido())
                .legajo(operador.getLegajo())
                .build();
    }
}
