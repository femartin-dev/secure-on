package com.secureon.seguridad.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.seguridad.model.entity.Usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private UUID userId;
    private String email;
    private String telefono;
    private String nombre;
    private String apellido;
    private String direccion;
    private OffsetDateTime fechaRegistro;

    public static UsuarioResponse fromEntity(Usuario usuario) {
        return UsuarioResponse.builder()
                            .userId(usuario.getUserId())
                            .apellido(usuario.getApellido())
                            .nombre(usuario.getNombre())
                            .telefono(usuario.getTelefono())
                            .direccion(usuario.getDireccion())
                            .email(usuario.getEmail())
                            .fechaRegistro(usuario.getFechaRegistro())
                            .build();
                    
    }

}
