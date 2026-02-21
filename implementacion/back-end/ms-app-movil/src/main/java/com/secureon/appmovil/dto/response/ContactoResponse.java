package com.secureon.appmovil.dto.response;

import java.util.UUID;

import com.secureon.appmovil.model.entity.CanalNotificacion;
import com.secureon.appmovil.model.entity.Contacto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContactoResponse {
    private UUID id; 
    private UUID userId; 
    private String nombre;
    private String telefono;
    private String relacion;
    private CanalNotificacion canal;
    @Builder.Default
    private Boolean esPrincipal = false;

    public static ContactoResponse fromEntity(Contacto contacto) {
        return ContactoResponse.builder()
                                .id(contacto.getId())
                                .userId(contacto.getUsuario().getId())
                                .nombre(contacto.getNombre())
                                .telefono(contacto.getTelefono())
                                .relacion(contacto.getRelacion())
                                .canal(contacto.getCanalNotificacion())
                                .esPrincipal(contacto.getEsPrincipal())
                                .build();
    }
}
