package com.securitasgroup.secureon.dto.request;

import java.util.UUID;

import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    private String email;
    private String telefono;
    private UUID dispositivoAppId;
    
    @NotBlank
    private String password;
    
    @AssertTrue(message = "Debe informar email o teléfono")
    public boolean isAnyIdentifierPresent() {
        return StringUtils.isNotBlank(email) 
            || StringUtils.isNotBlank(telefono)
            || dispositivoAppId != null;
    }
}
