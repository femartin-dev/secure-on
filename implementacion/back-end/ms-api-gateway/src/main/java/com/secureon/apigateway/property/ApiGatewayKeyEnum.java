package com.secureon.apigateway.property;

import java.util.Arrays;

public enum ApiGatewayKeyEnum {
    APP_MOVIL, CMD_CONTROL, SEGURIDAD;

    public String getKey() {
        return this.toString().toLowerCase().replace("_", "-");
    }

    public static ApiGatewayKeyEnum getApiKey(String key) {
        return Arrays.asList(values()).stream()
                .filter(ak -> key.equals(ak.toString()) || key.equals(ak.getKey()))
                .findFirst().orElse(null);
    }
}
