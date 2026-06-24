package com.secureon.appmovil.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.EvidenciaRequest;
import com.secureon.appmovil.repository.EvidenciaRepository;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Evidencia;
import com.secureon.common.util.MessagesService;
import com.secureon.common.util.SaveFileUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EvidenciaService {

    private final EvidenciaRepository evidenciaRepository;
    private final MessagesService messagesService;
    private final CatalogoService catalogoService;
    private final UbicacionService ubicacionService;
    private final SaveFileUtils saveFileUtils;


    public Evidencia obtenerEvidencia(UUID evidenciaId) {
        Evidencia evidencia = evidenciaRepository.findById(evidenciaId)
            .map(e -> saveFileUtils.setArchivoEvidencia(e))
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.evidencia.not-found")));
        return evidencia;
    }

    public Evidencia agregarEvidencia(Alarma alarma, EvidenciaRequest request) {
        Evidencia evidencia = new Evidencia();
        evidencia.setAlarma(alarma);
        evidencia.setTipoEvidencia(catalogoService.getTipoEvidencia(request.getTipoEvidencia()));
        evidencia.setRawData(request.getData());
        evidencia.setFechaCaptura(request.getFechaCaptura());
        evidencia.setUbicacionCaptura(ubicacionService.getPuntoCoordenadasFromRequest(request.getUbicacion()));
        evidencia.setBateriaNivel(request.getNivelBateria());
        evidencia.setEnviadoCdm(false);
        Evidencia evidenciaGuardada = evidenciaRepository.save(evidencia);
        saveFileUtils.guardarArchivoEvidencia(evidenciaGuardada);
        evidenciaGuardada.setEnviadoCdm(true);
        evidenciaGuardada.setFechaEnvioCdm(OffsetDateTime.now());
        evidenciaGuardada = evidenciaRepository.save(evidenciaGuardada);
        return evidenciaGuardada;
    }


}
