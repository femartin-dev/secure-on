package com.secureon.seguridad.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.seguridad.model.entity.Operador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperadorResponse {
    private UUID operadorId;
    private String nombre;
    private String apellido;
    private Integer legajo;
    private String email;
    private String usuario;
    private Boolean esAdministrador;
    private UUID supervisorId;
    private OffsetDateTime fechaRegistro;

    public static OperadorResponse fromEntity(Operador operador) {
        return OperadorResponse.builder()
                                .operadorId(operador.getOperadorId())
                                .nombre(operador.getNombre())
                                .apellido(operador.getApellido())
                                .legajo(operador.getLegajo())
                                .email(operador.getEmail())
                                .usuario(operador.getUsuario())
                                .esAdministrador(operador.getEsAdministrador())
                                .supervisorId(operador.getSupervisor() != null ? operador.getSupervisor().getOperadorId() : null)
                                .fechaRegistro(operador.getFechaRegistro())
                                .build();
    }
}
