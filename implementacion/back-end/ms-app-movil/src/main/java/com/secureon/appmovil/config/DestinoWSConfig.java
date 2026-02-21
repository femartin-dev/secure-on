package com.secureon.appmovil.config;

import org.springframework.context.annotation.Configuration;

import com.secureon.appmovil.property.DestinoWSEnum;
import com.secureon.appmovil.property.DestinoWSProperty;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DestinoWSConfig {
    
    private final DestinoWSProperty destinosWSProperty;
    
    @PostConstruct
    public void initDestinosEnum() {
        log.info("Inicializando DestinoWSEnum...");
        DestinoWSEnum.init(destinosWSProperty);
        for (DestinoWSEnum destino : DestinoWSEnum.values()) {
            if (destino.getPath() == null) {
                log.warn("Destino sin path: {}", destino.getFullPropertyKey());
            } else {
                log.info("{} -> {}", destino.name(), destino.getPath());
            }
        }
    }
}