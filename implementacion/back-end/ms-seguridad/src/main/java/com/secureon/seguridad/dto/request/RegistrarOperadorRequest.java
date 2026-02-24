package com.secureon.seguridad.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarOperadorRequest {
    @NotBlank
    private String nombre;
    
    @NotBlank
    private String apellido;
    
    @NotNull
    private Integer legajo;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(max = 20)
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    private String telefono;
    
    @NotBlank
    @Size(min = 8, max = 20)
    private String password;
    
    @Builder.Default
    private Boolean esAdministrador = false;
    private UUID supervisorId;
}
