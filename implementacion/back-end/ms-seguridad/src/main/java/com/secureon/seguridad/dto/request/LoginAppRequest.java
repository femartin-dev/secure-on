package com.secureon.seguridad.dto.request;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginAppRequest {
    @NotEmpty
    @Email
    private String email;

    @JsonIgnore
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    private String telefono;
    @JsonIgnore
    private UUID dispositivoAppId;
    
    @NotBlank
    private String password;
    
    //@AssertTrue(message = "{usr.login.err.any-value}")
    public boolean isAnyIdentifierPresent() {
        return StringUtils.isNotBlank(email) 
            || StringUtils.isNotBlank(telefono)
            || dispositivoAppId != null;
    }
}
