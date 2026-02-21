package com.secureon.appmovil.controller;


import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.request.AlarmaRequest;
import com.secureon.appmovil.dto.request.FinalizarRequest;
import com.secureon.appmovil.dto.request.UbicacionRequest;
import com.secureon.appmovil.dto.response.AlarmaResponse;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.service.AlarmaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/app-movil/v1/alarma")
@RequiredArgsConstructor
public class AlarmaController {

    private final AlarmaService alarmaService;

    @PostMapping("/nueva")
    public ResponseEntity<AlarmaResponse> crearAalarma(@RequestBody AlarmaRequest request) {
        Alarma alarma = alarmaService.crearAlarma(request);
        AlarmaResponse response = AlarmaResponse.fromEntity(alarma);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{alertaId}/ubicacion")
    public ResponseEntity<Void> actualizarUbicacion(@PathVariable UUID alarmaId,
                                                    @RequestBody UbicacionRequest request) {
        alarmaService.actualizarUbicacion(alarmaId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{alertaId}/finalizar")
    public ResponseEntity<Void> finalizarAlarma(@PathVariable UUID alarmaId,
                                                @RequestBody(required = false) FinalizarRequest request) {
        alarmaService.finalizarAlarma(alarmaId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{alertaId}/reactivar")
    public ResponseEntity<Void> reactivarAlarama(@PathVariable UUID alarmaId,
                                                @RequestParam UUID dispositivoId) {
        alarmaService.reactivarAlarma(alarmaId, dispositivoId);
        return ResponseEntity.ok().build();
    }
}