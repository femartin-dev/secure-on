package com.secureon.appmovil.property;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "ws-gateway.destinations")
public class DestinoWSProperty {

    private Map<String, Map<String, String>> topics = new HashMap<>();
    private Map<String, Map<String, String>> queues = new HashMap<>();

}