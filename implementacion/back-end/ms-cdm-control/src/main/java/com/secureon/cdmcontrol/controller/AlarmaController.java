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
import com.secureon.cdmcontrol.dto.response.EvidenciaResponse;
import com.secureon.cdmcontrol.dto.response.UbicacionResponse;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.AlarmaOperador;
import com.secureon.common.model.entity.Evidencia;
import com.secureon.common.model.entity.Ubicacion;
import com.secureon.cdmcontrol.service.AlarmaService;
import com.secureon.cdmcontrol.service.AsignacionService;
import com.secureon.cdmcontrol.service.EvidenciaService;

@RestController
@RequestMapping("/api/cdm-control/v1/dashboard/alarma")
@CrossOrigin(origins = "*")
public class AlarmaController {

    @Autowired
    private AlarmaService alarmaService;

    @Autowired
    private AsignacionService asignacionService;

    @Autowired
    private EvidenciaService evidenciaService;

    @GetMapping("/filtrar")
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

    @GetMapping("/{id}/obtener")
    public ResponseEntity<AlarmaResponse> obtenerAlarma(@PathVariable UUID id) {
        return ResponseEntity.ok(AlarmaResponse.fromEntity(alarmaService.obtenerAlarma(id)));
    }

    @GetMapping("/{id}/ubicaciones")
    public ResponseEntity<List<UbicacionResponse>> obtenerUbicaciones(@PathVariable UUID id) {
        List<Ubicacion> ubicaciones = alarmaService.obtenerUbicaciones(id);
        List<UbicacionResponse> dtoList = ubicaciones.stream().map(UbicacionResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PutMapping("/{id}/cambiar-prioridad")
    public ResponseEntity<AlarmaResponse> actualizarPrioridad(@PathVariable UUID id, @RequestBody AlarmaRequest dto) {
        Alarma alarma = alarmaService.actualizarPrioridad(id, dto.getPrioridadId());
        return ResponseEntity.ok(AlarmaResponse.fromEntity(alarma));
    }

    @PutMapping("/{id}/cambiar-estado")
    public ResponseEntity<AlarmaResponse> actualizarEstadoAlarma(@PathVariable UUID id, @RequestBody AlarmaRequest dto) {

        Alarma alarma = alarmaService.actualizarEstado(id, dto.getEstadoId());
        return ResponseEntity.ok(AlarmaResponse.fromEntity(alarma));
    }

    @PostMapping("/{id}/asignar/{operadorId}")
    public ResponseEntity<AlarmaResponse> asignarOperador(@PathVariable UUID id, @PathVariable UUID operadorId) {
        AlarmaOperador asignacion = asignacionService.reasignarAlarma(id, operadorId);
        return ResponseEntity.ok(AlarmaResponse.fromEntity(asignacion));
    }

    @GetMapping("/{id}/evidencias")
    public ResponseEntity<List<EvidenciaResponse>> obtenerEvidencias(@PathVariable UUID id, 
                                                                    @RequestParam(required = false, defaultValue = "false") boolean cargarArchivo) {
        Alarma alarma = alarmaService.obtenerAlarma(id);
        List<Evidencia> evidencias = evidenciaService.obtenerEvidenciasPorAlarma(alarma, cargarArchivo);
        List<EvidenciaResponse> dtoList = evidencias.stream().map(EvidenciaResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }



}