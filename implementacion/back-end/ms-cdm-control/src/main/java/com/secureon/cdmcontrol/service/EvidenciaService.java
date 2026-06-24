package com.secureon.cdmcontrol.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.secureon.cdmcontrol.repository.EvidenciaRepository;
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
    
    private final SaveFileUtils saveFileUtils;


    public Evidencia obtenerEvidencia(UUID evidenciaId, UUID alarmaId) {
        Evidencia evidencia = evidenciaRepository.findById(evidenciaId)
            .map(e -> saveFileUtils.setArchivoEvidencia(e))
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.evidencia.not-found")));
        if (!evidencia.getAlarma().getId().equals(alarmaId)) {
            throw new ResourceNotFoundException(messagesService.getMessage("error.alarma.evidencia"));
        }
        return evidencia;
    }

    public List<Evidencia> obtenerEvidenciasPorAlarma(Alarma alarma, boolean cargarArchivo) {
        List<Evidencia> evidencias = evidenciaRepository.findByAlarma(alarma);
        if (cargarArchivo) {
            evidencias.forEach(e -> saveFileUtils.setArchivoEvidencia(e));
        }
        return evidencias;
    }
}
