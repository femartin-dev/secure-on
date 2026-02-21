package com.secureon.appmovil.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.request.ConfiguracionRequest;
import com.secureon.appmovil.dto.response.ConfiguracionResponse;
import com.secureon.appmovil.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.service.ConfiguracionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/app-movil/v1/config")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @PostMapping("/nuevo")
    public ResponseEntity<ConfiguracionResponse> crearContacto(@RequestBody ConfiguracionRequest request) {
        ConfiguracionUsuario config = configuracionService.guardarConfiguracion(null, request);
        ConfiguracionResponse response = ConfiguracionResponse.fromEntity(config);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{configId}/editar")
    public ResponseEntity<Void> actualizarContacto(@PathVariable UUID configId,
                                                    @RequestBody ConfiguracionRequest request) {
        configuracionService.guardarConfiguracion(configId, request);
        return ResponseEntity.ok().build();
    }

}
