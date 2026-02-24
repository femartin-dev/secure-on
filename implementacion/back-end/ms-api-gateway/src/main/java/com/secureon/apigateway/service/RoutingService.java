package com.secureon.apigateway.service;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.secureon.apigateway.exception.DownstreamHttpException;
import com.secureon.apigateway.property.ApiGatewayConfigProperty;
import com.secureon.apigateway.property.ApiGatewayKeyEnum;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RoutingService {

    private final RestTemplate restTemplate = new RestTemplate();
    @Autowired
    private ApiGatewayConfigProperty apiProperties;

    private String getTargetUrl(String path) {
        Optional<ApiGatewayKeyEnum> apiKey = Arrays.asList(ApiGatewayKeyEnum.values()).stream()
                                        .filter(key -> {
                                            String gatewayPath = apiProperties.getGatewayPathsKeyValue(key);
                                            return gatewayPath != null && path.startsWith(gatewayPath);
                                        })
                                        .findFirst();
        if (apiKey.isPresent()) {
            String gatewayPath = apiProperties.getGatewayPathsKeyValue(apiKey.get());
            return apiProperties.getServicesUrlsKeyValue(apiKey.get()) + 
                    apiProperties.getServicesPathsKeyValue(apiKey.get()) + 
                    path.replaceFirst(gatewayPath, "");
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ruta no encontrada");
    }

    public ResponseEntity<String> forward(String path, String method, String body, HttpServletRequest request) {
        String url = getTargetUrl(path);
        log.info("URL forwarder " + url);
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String header = headerNames.nextElement();
            if (header.equalsIgnoreCase("host") || header.equalsIgnoreCase("content-length")) {
                continue;
            }
            headers.set(header, request.getHeader(header));
        }
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.valueOf(method), entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).headers(response.getHeaders()).body(response.getBody());
        } catch (HttpStatusCodeException e) {
            throw new DownstreamHttpException(HttpStatus.valueOf(e.getStatusCode().value()), e.getResponseBodyAsString());
        }
    }
}
