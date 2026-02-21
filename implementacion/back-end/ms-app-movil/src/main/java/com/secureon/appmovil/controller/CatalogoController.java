package com.secureon.appmovil.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.response.CatalogoResponse;
import com.secureon.appmovil.service.CatalogoService;
import com.secureon.appmovil.service.EstadoAlarmaService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/app-movil/v1/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;
    private final EstadoAlarmaService estadoAlarmaService;

    @GetMapping("/estados-alarma")
    public ResponseEntity<CatalogoResponse> getEstadosAlarma() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .estadosAlarma(estadoAlarmaService.getEstadosAlarma())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/canales-notificacion")
    public ResponseEntity<CatalogoResponse> getCanalesNotificacion() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .canalesNotificacion(catalogoService.getCanalesNotificacion())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/estados-envio")
    public ResponseEntity<CatalogoResponse> getEstadosEnvio() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .estadosEnvio(catalogoService.getEstadosEnvio())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/idiomas")
    public ResponseEntity<CatalogoResponse> getIdiomas() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .idiomas(catalogoService.getIdiomas())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/metodos-activacion")
    public ResponseEntity<CatalogoResponse> getMetodosActivacion() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .metodosActivacion(catalogoService.getMetodosActivacion())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }
    
    @GetMapping("/metodos-ubicacion")
    public ResponseEntity<CatalogoResponse> getMetodosUbicacion() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .metodosUbicacion(catalogoService.getMetodosUbicacion())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/prioridades-alarma")
    public ResponseEntity<CatalogoResponse> getPrioridades() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .prioridades(catalogoService.getPrioridades())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }
}
