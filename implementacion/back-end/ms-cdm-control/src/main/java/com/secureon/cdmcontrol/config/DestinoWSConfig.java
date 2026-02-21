package com.secureon.cdmcontrol.config;


import org.springframework.context.annotation.Configuration;

import com.secureon.cdmcontrol.property.DestinoWSEnum;
import com.secureon.cdmcontrol.property.DestinoWSProperty;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DestinoWSConfig {
    
    private final DestinoWSProperty destinoWSProperty;
    
    @PostConstruct
    public void initDestinosEnum() {
        log.info("Inicializando DestinoWSEnum...");
        DestinoWSEnum.init(destinoWSProperty);
        for (DestinoWSEnum destino : DestinoWSEnum.values()) {
            if (destino.getPath() == null) {
                log.warn("Destino sin path: {}", destino.getFullPropertyKey());
            } else {
                log.info("{} -> {}", destino.name(), destino.getPath());
            }
        }
    }
}
