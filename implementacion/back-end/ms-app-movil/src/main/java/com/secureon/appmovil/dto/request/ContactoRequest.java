package com.secureon.appmovil.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Getter
@Setter
public class ContactoRequest {
    @NotNull
    private UUID userId;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotBlank
    @Size(max = 20)
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    private String telefono;
    
    @Size(max = 50)
    private String relacion;

    @NotNull
    private Integer canalId;
    private Boolean esPrincipal = false;

    

}
