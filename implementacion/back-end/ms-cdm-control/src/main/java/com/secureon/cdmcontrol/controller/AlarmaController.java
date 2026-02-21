package com.secureon.cdmcontrol.controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.secureon.cdmcontrol.dto.request.AlarmaRequest;
import com.secureon.cdmcontrol.dto.response.AlarmaResponse;
import com.secureon.cdmcontrol.dto.response.UbicacionResponse;
import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.AlarmaOperador;
import com.secureon.cdmcontrol.model.entity.Ubicacion;
import com.secureon.cdmcontrol.service.AlarmaService;
import com.secureon.cdmcontrol.service.AsignacionService;

@RestController
@RequestMapping("/api/cdm-control/v1/dashboard")
@CrossOrigin(origins = "*")
public class AlarmaController {

    @Autowired
    private AlarmaService alarmaService;

    @Autowired
    private AsignacionService asignacionService;

    @GetMapping("/filtrar-alarmas")
    public ResponseEntity<Page<AlarmaResponse>> listarAlarmas (
            @RequestParam(required = false) Integer estadoId,
            @RequestParam(required = false) Integer prioridad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fechaHasta,
            @RequestParam(required = false) UUID operadorId,
            @RequestParam(required = false) Integer asignacionId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AlarmaOperador> alarmas = asignacionService.listarAlarmas(estadoId, prioridad, fechaDesde, fechaHasta, operadorId, asignacionId, pageable);
        Page<AlarmaResponse> dtoPage = alarmas.map(AlarmaResponse::fromEntity);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/alerta/{id}")
    public ResponseEntity<AlarmaResponse> obtenerAlarma(@PathVariable UUID id) {
        return alarmaService.obtenerAlarma(id)
                .map(alarma -> ResponseEntity.ok(AlarmaResponse.fromEntity(alarma)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alerta/{id}/ubicaciones")
    public ResponseEntity<List<UbicacionResponse>> obtenerUbicaciones(@PathVariable UUID id) {
        List<Ubicacion> ubicaciones = alarmaService.obtenerUbicaciones(id);
        List<UbicacionResponse> dtoList = ubicaciones.stream().map(UbicacionResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PutMapping("/alerta/{id}/prioridad")
    public ResponseEntity<AlarmaResponse> actualizarPrioridad(@PathVariable UUID id, @RequestBody AlarmaRequest dto) {
        Alarma alarma = alarmaService.actualizarPrioridad(id, dto.getPrioridadId());
        return ResponseEntity.ok(AlarmaResponse.fromEntity(alarma));
    }

    @PutMapping("/alarma/{id}/estado-alarma")
    public ResponseEntity<AlarmaResponse> actualizarEstadoAlarma(@PathVariable UUID id, @RequestBody AlarmaRequest dto) {

        Alarma alarma = alarmaService.actualizarEstado(id, dto.getEstadoId());
        return ResponseEntity.ok(AlarmaResponse.fromEntity(alarma));
    }

    @PostMapping("/alarmas/{id}/asignar/{operadorId}")
    public ResponseEntity<AlarmaResponse> asignarOperador(@PathVariable UUID id, @PathVariable UUID operadorId) {
        AlarmaOperador asignacion = asignacionService.reasignarAlarma(id, operadorId);
        return ResponseEntity.ok(AlarmaResponse.fromEntity(asignacion));
    }

}