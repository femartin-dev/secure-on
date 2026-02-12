package com.securitasgroup.secureon.dto.request;

import io.micrometer.common.util.StringUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperatorLoginRequest {

    private String email;
    private Integer legajo;
    private String usuario;

    @NotBlank
    private String password;

    @AssertTrue(message = "Debe informar email, legajo o usuario")
    public boolean isAnyIdentifierPresent() {
        return StringUtils.isNotBlank(email) 
            || legajo != null 
            || StringUtils.isNotBlank(usuario);
    }
}
