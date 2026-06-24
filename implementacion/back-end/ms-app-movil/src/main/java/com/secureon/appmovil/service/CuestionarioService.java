package com.secureon.appmovil.service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.CuestionarioRequest;
import com.secureon.appmovil.repository.CuestionarioRepository;
import com.secureon.common.model.entity.Cuestionario;
import com.secureon.common.util.MessagesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CuestionarioService {
    
    private final CuestionarioRepository cuestionarioRepository;

    private final AlarmaService alarmaService;

    private final MessagesService messagesService;

    private final CatalogoService catalogoService;

    public Cuestionario guardarCuestionario(CuestionarioRequest request) {
        Optional<Cuestionario> oc = cuestionarioRepository.findByAlarmaId(request.getAlarmaId());
        Cuestionario cuestionario; //= oc.isPresent() ? oc.get() : new Cuestionario();
        if (oc.isPresent()) {
            cuestionario = oc.get();
            if (cuestionario.getFechaFin() != null) {
                throw new IllegalStateException(messagesService.getMessage("error.cuestionario.ilegal.state"));
            }
        } else {
            cuestionario = new Cuestionario();
            cuestionario.setAlarma(alarmaService.obtenerAlarma(request.getAlarmaId()));
        }
        cuestionario.setMotivoActivacion(request.getMotivoActivacionId() == null ? null : catalogoService.getMotivoActivacion(request.getMotivoActivacionId()));
        cuestionario.setEstadoSaludUsuario(request.getEstadoSaludId() == null ? null : catalogoService.getEstadoSalud(request.getEstadoSaludId()));
        cuestionario.setAutoridadesContactadas(request.getAutoridadesContactadas());
        cuestionario.setDaniosMateriales(request.getDaniosMateriales());
        cuestionario.setDescripcionIncidente(request.getDescripcionIncidente());
        cuestionario.setEvaluacionAutoridades(request.getEvaluacionAutoridades());
        cuestionario.setEvaluacionSistema(request.getEvaluacionSistema());
        cuestionario.setObservaciones(request.getObservaciones());
        cuestionario.setRequiereAsistencia(request.getRequiereAsistencia());
        cuestionario.setFechaInicio(request.getFechaInicio());
        if (!request.getEsBorrador()) {
            cuestionario.setFechaFin(OffsetDateTime.now());
        }
        Cuestionario guardado = cuestionarioRepository.save(cuestionario);
        return guardado;
    }

    public Cuestionario obtenerCuestionarioPorAlarmaId(UUID alarmaId) {
        return cuestionarioRepository.findByAlarmaId(alarmaId)
            .orElseThrow(() -> new RuntimeException(messagesService.getMessage("error.cuestionario.not-found")));
    }
}
