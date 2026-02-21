package com.secureon.apigateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.secureon.apigateway.property.ApiGatewayConfigProperty;
import com.secureon.apigateway.service.RoutingService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class ProxyController {

    @Autowired
    private RoutingService routingService;

    @Autowired
    private ApiGatewayConfigProperty apiProperties;

    @RequestMapping("/api/secure-on/**")
    public ResponseEntity<?> proxy(HttpServletRequest request, 
                                @RequestBody(required = false) String body) {
        try {
            String path = request.getRequestURI().replaceFirst(apiProperties.getPrefixApi(), "");
            String method = request.getMethod();
            return routingService.forward(path, method, body, request);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }
}