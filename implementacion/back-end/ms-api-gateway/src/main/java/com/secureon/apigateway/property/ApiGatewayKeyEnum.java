package com.secureon.apigateway.property;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum ApiGatewayKeyEnum {
    APP_MOVIL, CMD_CONTROL, SEGURIDAD;

    public String getKey() {
        /* 
        String camel = Arrays.stream(this.toString().split("_"))
                            .map(String::toLowerCase)
                            .map(this::capitalizar)
                            .collect(Collectors.joining()); 
        return decapitalizar(camel);*/
        return this.toString().toLowerCase().replace("_", "-");
    }


    private String capitalizar(String s) {
        return s.substring(0,1).toUpperCase() + s.substring(1);
    }

    private String decapitalizar(String s) {
        return s.substring(0,1).toLowerCase() + s.substring(1);
    }

    public static ApiGatewayKeyEnum getApiKey(String key) {
        return Arrays.asList(values()).stream()
                .filter(ak -> key.equals(ak.toString()) || key.equals(ak.getKey()))
                .findFirst().orElse(null);
    }
}
