package com.secureon.cdmcontrol.dto.response;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.AlarmaOperador;
import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;
import com.secureon.cdmcontrol.model.entity.PrioridadAlarma;
import com.secureon.cdmcontrol.model.entity.Ubicacion;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AlarmaResponse {
    private UUID asignacionId;
    private UUID alarmaId;
    private AlarmaResponse alarma;
    private PersonaResponse operador;
    private PersonaResponse usuario;
    private DispositivoResponse dispositivo;
    private OffsetDateTime fechaActivacion;
    private OffsetDateTime fechaFinalizacion;
    private OffsetDateTime fechaAsignacion;
    private OffsetDateTime fechaVerificacion;
    private Boolean esAsignacionAuto;
    private EstadoAlarma estadoAlarma;
    private EstadoAsignacion estadoAsignacion;
    private PrioridadAlarma prioridad;
    private UbicacionResponse ultimaUbicacion;
    private List<UbicacionResponse> ubicacionesAnteriores;
    private Boolean falsaAlarma;

    public static AlarmaResponse fromEntity(AlarmaOperador ao) {
        return AlarmaResponse.builder()
                            .asignacionId(ao.getId())
                            .alarmaId(ao.getAlarma().getId())
                            .operador(getOperador(ao))
                            .usuario(getUsuario(ao))
                            .dispositivo(getDispositivo(ao))
                            .fechaActivacion(ao.getAlarma().getFechaActivacion())
                            .fechaFinalizacion(ao.getAlarma().getFechaFinalizacion())
                            .fechaAsignacion(ao.getFechaAsignacion())
                            .esAsignacionAuto(ao.getEsAsignacionAuto())
                            .estadoAlarma(ao.getAlarma().getEstadoAlarma())
                            .estadoAsignacion(ao.getEstadoAsignacion())
                            .prioridad(ao.getAlarma().getPrioridad())
                            .ultimaUbicacion(getUltimaUbicacion(ao))
                            .falsaAlarma(ao.getFalsaAlarma())
                            .build();
    }

    public static AlarmaResponse fromEntity(Alarma a) {
        return AlarmaResponse.builder()
                            .alarmaId(a.getId())
                            .usuario(getUsuario(a))
                            .dispositivo(getDispositivo(a))
                            .fechaActivacion(a.getFechaActivacion())
                            .fechaFinalizacion(a.getFechaFinalizacion())
                            .estadoAlarma(a.getEstadoAlarma())
                            .prioridad(a.getPrioridad())
                            .ultimaUbicacion(getUltimaUbicacion(a))
                            .ubicacionesAnteriores(getUbicacionesAnteriores(a))
                            .build();
    }


    private static UbicacionResponse getUltimaUbicacion(AlarmaOperador ao) {
        return getUltimaUbicacion(ao.getAlarma());
    }

    private static UbicacionResponse getUltimaUbicacion(Alarma a) {
        return a.getUbicaciones().stream()
                .max(Comparator.comparing(Ubicacion::getFechaToma))
                .map(UbicacionResponse::fromEntity)
                .orElse(null);
    }

    private static List<UbicacionResponse> getUbicacionesAnteriores(Alarma a) {
        return a.getUbicaciones().stream()
                .sorted(Comparator.comparing(Ubicacion::getFechaToma).reversed())
                .skip(1)
                .map(UbicacionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private static DispositivoResponse getDispositivo(AlarmaOperador ao) {
        return getDispositivo(ao.getAlarma());
    }

    private static DispositivoResponse getDispositivo(Alarma a) {
        return DispositivoResponse.fromEntity(a.getDispositivo());
    }

    private static PersonaResponse getUsuario(AlarmaOperador ao) {
        return getUsuario(ao.getAlarma());
    }

    private static PersonaResponse getUsuario(Alarma a) {
        return PersonaResponse.fromEntity(a.getUsuario());
    }

    private static PersonaResponse getOperador(AlarmaOperador ao) {
        if (ao.getOperador() == null) return null;
        return PersonaResponse.fromEntity(ao.getOperador());
    }
}
