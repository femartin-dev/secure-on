package com.secureon.cdmcontrol.service;

import com.secureon.cdmcontrol.dto.messages.AlarmaDTO;
import com.secureon.common.model.entity.Alarma;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlarmaWsProcessor {

    private final AlarmaService alarmaService;
    private final AsignacionService asignacionService;

    public void procesarNueva(AlarmaDTO alarmaDTO, String origenUsuario) {
        log.info("Alarma nueva recibida: alarmaId={}, de usuario: {}",
                alarmaDTO.getAlarmaId(),
                origenUsuario != null ? origenUsuario : "anonimo");

        Alarma alarma = alarmaService.obtenerAlarma(alarmaDTO.getAlarmaId())
                .orElseThrow(() -> new RuntimeException(
                        "Alarma no encontrada: " + alarmaDTO.getAlarmaId()));

        asignacionService.asignarAlarma(alarma);
        log.info("Alarma {} asignada correctamente", alarmaDTO.getAlarmaId());
    }
}
