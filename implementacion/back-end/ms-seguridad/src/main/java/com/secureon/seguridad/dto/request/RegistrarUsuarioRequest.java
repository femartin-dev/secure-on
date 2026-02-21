package com.secureon.seguridad.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarUsuarioRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 8, max = 20)
    private String password;
    
    @NotBlank
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    private String telefono;
    
    @NotBlank
    @Size(max = 50)
    private String nombre;
    
    @NotBlank
    @Size(max = 50)
    private String apellido;
    
    private String direccion;
}
