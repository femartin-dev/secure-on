package com.securitasgroup.secureon.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterOperatorRequest {
    @NotBlank
    private String nombre;
    
    @NotBlank
    private String apellido;
    
    @NotBlank
    private Integer legajo;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 4, max = 50)
    private String usuario;
    
    @NotBlank
    @Size(min = 8, max = 20)
    private String password;
    
    @Builder.Default
    private Boolean esAdministrador = false;
    private UUID supervisorId;
}
