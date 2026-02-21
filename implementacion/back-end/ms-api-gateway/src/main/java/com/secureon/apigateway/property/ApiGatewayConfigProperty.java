package com.secureon.apigateway.property;

import java.util.Arrays;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "api-gateway.config")
@Getter
@Setter
public class ApiGatewayConfigProperty {

    private Map<String, String> gatewayPaths;
    private Map<String, String> servicesPaths;
    private Map<String, String> servicesUrls;
    private String prefixApi;
    private String prefixWs;

    public String getGatewayPathsKeyValue(ApiGatewayKeyEnum key) {
        return gatewayPaths.get(key.getKey());
    }

    public String getServicesPathsKeyValue(ApiGatewayKeyEnum key) {
        return servicesPaths.get(key.getKey());
    }

    public String getServicesUrlsKeyValue(ApiGatewayKeyEnum key) {
        return servicesUrls.get(key.getKey());
    }

    public ApiGatewayKeyEnum getApiKeyOfValue(String value) {
        return Arrays.stream(ApiGatewayKeyEnum.values())
                .filter(k -> value.equals(gatewayPaths.get(k.getKey()))
                          || value.equals(servicesPaths.get(k.getKey()))
                          || value.equals(servicesUrls.get(k.getKey())))
                .findFirst()
                .orElse(null);
    }
}