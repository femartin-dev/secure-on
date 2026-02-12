package com.securitasgroup.secureon.dto.response;

import java.time.OffsetDateTime;


import com.securitasgroup.secureon.model.entity.Usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String email;
    private String telefono;
    private String nombre;
    private String apellido;
    private String direccion;
    private OffsetDateTime fechaRegistro;

    public static UserResponse fromEntity(Usuario usuario) {
        return UserResponse.builder()
                            .apellido(usuario.getApellido())
                            .nombre(usuario.getNombre())
                            .telefono(usuario.getTelefono())
                            .direccion(usuario.getDireccion())
                            .email(usuario.getEmail())
                            .fechaRegistro(usuario.getFechaRegistro())
                            .build();
                    
    }

}
