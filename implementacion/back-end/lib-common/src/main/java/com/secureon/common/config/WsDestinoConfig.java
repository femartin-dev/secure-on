package com.secureon.common.config;


import org.springframework.context.annotation.Configuration;

import com.secureon.common.property.WsDestinoEnum;
import com.secureon.common.property.WsDestinoProperty;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class WsDestinoConfig {
    
    private final WsDestinoProperty destinosWSProperty;
    
    @PostConstruct
    public void initDestinosEnum() {
        log.info("Inicializando WsDestinoEnum...");
        WsDestinoEnum.init(destinosWSProperty);
        for (WsDestinoEnum destino : WsDestinoEnum.values()) {
            if (destino.getPath() == null) {
                log.warn("Destino sin path: {}", destino.getFullPropertyKey());
            } else {
                log.info("{} -> {}", destino.name(), destino.getPath());
            }
        }
    }
}