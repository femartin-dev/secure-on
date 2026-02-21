package com.secureon.cdmcontrol.dto.response;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.cdmcontrol.model.entity.Operador;
import com.secureon.cdmcontrol.model.entity.Usuario;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PersonaResponse {
    private UUID id;
    private String nombre;
    private String apellido;
    private String direccion;
    private Boolean activo;
    private Integer legajo;
    private UUID supervisorId;
    private String tipo;

    public static PersonaResponse fromEntity(Operador operador) {
        return PersonaResponse.builder()
                                .id(operador.getId())
                                .nombre(operador.getNombre())
                                .apellido(operador.getApellido())
                                .activo(operador.getEstaActivo())
                                .legajo(operador.getLegajo())
                                .supervisorId(operador.getSupervisor() == null ? null : operador.getSupervisor().getId())
                                .tipo(operador.getEsAdministrador() ? "ADIM" : "OPER")
                                .build();
    }

    public static PersonaResponse fromEntity(Usuario usuario) {
        return PersonaResponse.builder()
                                .id(usuario.getId())
                                .nombre(usuario.getNombre())
                                .apellido(usuario.getApellido())
                                .activo(usuario.getEstaActivo())
                                .tipo("USER")
                                .build();
    }

}
