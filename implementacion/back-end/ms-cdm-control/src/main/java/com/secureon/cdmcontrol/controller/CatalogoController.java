package com.secureon.cdmcontrol.controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.cdmcontrol.dto.response.CatalogoResponse;
import com.secureon.cdmcontrol.dto.response.SupervisorResponse;
import com.secureon.cdmcontrol.service.CatalogoService;
import com.secureon.cdmcontrol.service.OperadorService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/cdm-control/v1/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;
    private final OperadorService operadorService;

    @GetMapping("/estados-asignacion")
    public ResponseEntity<CatalogoResponse> getEstadosAsignacion() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .estadosAsignacion(catalogoService.getEstadosAsignacion())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/tipos-autoridad")
    public ResponseEntity<CatalogoResponse> getTiposAutoridad() {
        CatalogoResponse response = CatalogoResponse.builder()
                                                    .tiposAutoridad(catalogoService.getTiposAutoridad())
                                                    .build();
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/supervisores")
    public ResponseEntity<List<SupervisorResponse>> getSupervisoresActivos() {
        List<SupervisorResponse> supervisores = operadorService.listarSupervisoresActivos()
                .stream()
                .map(SupervisorResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(supervisores);
    }

}