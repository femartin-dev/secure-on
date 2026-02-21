package com.secureon.seguridad.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.seguridad.model.entity.Dispositivo;
import com.secureon.seguridad.model.entity.Usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispositivoResponse {

    private Usuario usuario;

    private UUID dispositivoAppId; 

    private String numero; 

    private String fabricante;

    private String modelo;

    private String plataforma;

    private String sistemaOperativo;

    private String versionDelSO;

    private String zonaHoraria;

    private String idiomaId;

    private Boolean esPrincipal;

    private Boolean estaActivo;

    private OffsetDateTime fechaCreacion;

    public static DispositivoResponse fromEntity(Dispositivo dispositivo) {
        return DispositivoResponse.builder()
                            .usuario(dispositivo.getUsuario())
                            .dispositivoAppId(dispositivo.getDispositivoAppId())
                            .numero(dispositivo.getNumero()) 
                            .fabricante(dispositivo.getFabricante())
                            .modelo(dispositivo.getModelo())
                            .plataforma(dispositivo.getPlataforma())
                            .sistemaOperativo(dispositivo.getSistemaOperativo())
                            .versionDelSO(dispositivo.getVersionDelSO())
                            .zonaHoraria(dispositivo.getZonaHoraria())
                            .idiomaId(dispositivo.getIdiomaId())
                            .esPrincipal(dispositivo.getEsPrincipal())
                            .estaActivo(dispositivo.getEstaActivo())
                            .fechaCreacion(dispositivo.getFechaCreacion())
                            .build();
    }
}
