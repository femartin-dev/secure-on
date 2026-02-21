package com.secureon.seguridad.util;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;


@Component
@ConfigurationProperties(prefix = "app.role")
@Getter @Setter
public class RolesProperties {

    private String admin;
    private String usuario;
    private String operador;
    private String prefijo;

    public String getRolUsuario() {
        return prefijo + usuario;
    }

    public String getRolOperador() {
        return prefijo + operador;
    }

    public String getRolAdminsitrador() {
        return prefijo + admin;
    }
}
