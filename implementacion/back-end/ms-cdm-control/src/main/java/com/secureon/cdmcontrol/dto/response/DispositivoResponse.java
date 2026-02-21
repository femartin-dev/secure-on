package com.secureon.cdmcontrol.dto.response;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.cdmcontrol.model.entity.Dispositivo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DispositivoResponse {
    private UUID id;
    private UUID dispositivoAppId;
    private String numero;
    private String so;

    public static DispositivoResponse fromEntity(Dispositivo dispositivo) {
        return DispositivoResponse.builder()
                                    .id(dispositivo.getId())
                                    .dispositivoAppId(dispositivo.getDispositivoAppId())
                                    .numero(dispositivo.getNumero())
                                    .so(dispositivo.getSistemaOperativo())
                                    .build();
    }


}
