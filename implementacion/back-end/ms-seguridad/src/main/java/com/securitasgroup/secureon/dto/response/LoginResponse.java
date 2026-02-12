package com.securitasgroup.secureon.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private UUID userId;
    private String email;
    private String nombre;
    private String apellido;
    private UUID dispositivoId;
    private OffsetDateTime expiracion;
}
