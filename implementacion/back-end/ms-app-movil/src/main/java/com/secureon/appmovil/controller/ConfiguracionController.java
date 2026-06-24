package com.secureon.appmovil.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.request.ConfiguracionRequest;
import com.secureon.appmovil.dto.response.ConfiguracionResponse;
import com.secureon.common.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.service.ConfiguracionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/app-movil/v1/config")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    @PostMapping("/nueva")
    public ResponseEntity<ConfiguracionResponse> crearConfiguracion(@RequestBody ConfiguracionRequest request) {
        ConfiguracionUsuario config = configuracionService.guardarConfiguracion(null, request);
        ConfiguracionResponse response = ConfiguracionResponse.fromEntity(config);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{configId}/editar")
    public ResponseEntity<ConfiguracionResponse> actualizarConfiguracion(@PathVariable UUID configId,
                                                    @RequestBody ConfiguracionRequest request) {
        ConfiguracionUsuario config = configuracionService.guardarConfiguracion(configId, request);
        ConfiguracionResponse response = ConfiguracionResponse.fromEntity(config);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/obtener")
    public ResponseEntity<ConfiguracionResponse> obtenerConfiguracion(@RequestParam UUID usuarioId,
                                                                      @RequestParam UUID dispositivoId) {
        ConfiguracionUsuario config = configuracionService.getConfiguracionUsuario(usuarioId, dispositivoId);
        ConfiguracionResponse response = ConfiguracionResponse.fromEntity(config);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{configId}/resetear")
    public ResponseEntity<ConfiguracionResponse> resetearConfiguracion(@PathVariable UUID configId) {
        ConfiguracionUsuario config = configuracionService.resetearConfiguracion(configId);
        ConfiguracionResponse response = ConfiguracionResponse.fromEntity(config);
        return ResponseEntity.ok(response);
    }
}
