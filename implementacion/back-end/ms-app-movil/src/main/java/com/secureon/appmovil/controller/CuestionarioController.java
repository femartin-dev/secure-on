package com.secureon.appmovil.controller;

import org.springframework.web.bind.annotation.RestController;

import com.secureon.appmovil.dto.request.AlarmaRequest;
import com.secureon.appmovil.dto.request.CuestionarioRequest;
import com.secureon.appmovil.dto.response.AlarmaResponse;
import com.secureon.appmovil.dto.response.CuestionarioResponse;
import com.secureon.appmovil.service.CuestionarioService;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Cuestionario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.apache.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/app-movil/v1/cuestionario")
@RequiredArgsConstructor
public class CuestionarioController {

    private final CuestionarioService cuestionarioService;

    @PostMapping("/guardar")
    public ResponseEntity<CuestionarioResponse> crearCuestionario(@Valid @RequestBody CuestionarioRequest request) {
        Cuestionario cuestionario = cuestionarioService.guardarCuestionario(request);    
        CuestionarioResponse response = CuestionarioResponse.fromEntity(cuestionario);
        return ResponseEntity.status(HttpStatus.SC_CREATED).body(response);
    }

    @GetMapping("/obtener/{alarmaId}")
    public ResponseEntity<CuestionarioResponse> obtenerCuestionario(@PathVariable UUID alarmaId) {
        Cuestionario cuestionario = cuestionarioService.obtenerCuestionarioPorAlarmaId(alarmaId);
        CuestionarioResponse response = CuestionarioResponse.fromEntity(cuestionario);
        return ResponseEntity.ok().body(response);
    }
}
