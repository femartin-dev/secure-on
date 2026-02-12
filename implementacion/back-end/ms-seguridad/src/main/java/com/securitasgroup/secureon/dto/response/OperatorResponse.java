package com.securitasgroup.secureon.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.securitasgroup.secureon.model.entity.OperadorCdm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatorResponse {
    private String nombre;
    private String apellido;
    private Integer legajo;
    private String email;
    private String usuario;
    private Boolean esAdministrador;
    private UUID supervisorId;
    private OffsetDateTime fechaRegistro;

    public static OperatorResponse fromEntity(OperadorCdm operador) {
        return OperatorResponse.builder()
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
