package com.secureon.common.property;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

import com.secureon.common.config.YamlPropertySourceFactory;

import lombok.Data;

@Data
@Component
@PropertySource(value = "classpath:global-props.yml", factory = YamlPropertySourceFactory.class)
@ConfigurationProperties(prefix = "ws-gateway.routes")
public class WsDestinoProperty {

    private Map<String, Map<String, String>> topics = new HashMap<>();
    private Map<String, Map<String, String>> queues = new HashMap<>();

}
