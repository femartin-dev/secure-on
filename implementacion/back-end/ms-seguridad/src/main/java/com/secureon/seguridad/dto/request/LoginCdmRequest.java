package com.secureon.seguridad.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginCdmRequest {

    @NotBlank
    @Email
    private String email;
    @JsonIgnore
    private Integer legajo;
    @JsonIgnore
    private String usuario;

    @NotBlank
    private String password;

    //@AssertTrue(message = "{cdm.login.err.any-value}")
    public boolean isAnyIdentifierPresent() {
        return StringUtils.isNotBlank(email) 
            || legajo != null 
            || StringUtils.isNotBlank(usuario);
    }
}
