package com.securitasgroup.secureon.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceRegistrationRequest {
    @NotNull
    private UUID usuarioId;

    @NotNull
    private UUID dispositivoAppId; 

    @NotBlank
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    private String numero; 

    private String fabricante;

    private String modelo;

    private String plataforma;

    private String sistemaOperativo;

    private String versionDelSO;

    private String zonaHoraria;

    private String idiomaId;

    @Builder.Default
    private Boolean esPrincipal = false;

}
