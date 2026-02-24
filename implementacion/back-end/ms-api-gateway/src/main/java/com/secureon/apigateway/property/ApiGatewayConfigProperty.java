package com.secureon.apigateway.property;

import java.util.Arrays;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
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
        log.debug("Getting gateway path for key: {}", key.getKey());
        return gatewayPaths.get(key.getKey());
    }

    public String getServicesPathsKeyValue(ApiGatewayKeyEnum key) {
        log.debug("Getting services path for key: {}", key.getKey());
        return servicesPaths.get(key.getKey());
    }

    public String getServicesUrlsKeyValue(ApiGatewayKeyEnum key) {
        log.debug("Getting services URL for key: {}", key.getKey());
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