package com.secureon.appmovil.service;


import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.secureon.common.dto.AlarmaDTO;
import com.secureon.common.dto.EventoDTO;
import com.secureon.common.dto.EvidenciaDTO;
import com.secureon.common.dto.UbicacionDTO;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Evidencia;
import com.secureon.common.model.entity.Ubicacion;
import com.secureon.common.property.WsDestinoEnum;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WsMensajeriaService {

    private final String url;
    private final RestTemplate restTemplate;
    
    public WsMensajeriaService(RestTemplate restTemplate, 
                                @Value("${api-gateway.server_url}") String url,
                                @Value("${api-gateway.endpoints.ws-internal}") String path) {
        this.restTemplate = restTemplate;
        this.url = url + path;
    }
    
    private void enviarMensajeHttp(UUID to, EventoDTO mensaje) {
        
        try {
            String newurl = url + (to == null ? "" : "/" + to.toString());
            ResponseEntity<Void> response = 
                    restTemplate.postForEntity(newurl, mensaje, Void.class );

            if (response.getStatusCode() == HttpStatus.ACCEPTED) {
                log.info("Mensaje encolado correctamente");
            }
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Error HTTP al enviar mensaje: {} - {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error al enviar mensaje: {}", e.getMessage());
        }
    }

    private void enviarMensajeHttp(EventoDTO mensaje) {
        this.enviarMensajeHttp(null, mensaje);
    }

    public void publicarNuevaAlarma(Alarma alarma) {
        this.enviarMensajeHttp(EventoDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            WsDestinoEnum.TOPIC_ALARMA_NUEVA));
    }

    public void publicarUbicacion(Ubicacion ubicacion) {
        this.enviarMensajeHttp(EventoDTO.fromObject(UbicacionDTO.fromEntity(ubicacion), 
                                            WsDestinoEnum.TOPIC_UBICACION_REALTIME));
    }

    public void publicarEvidencia(Evidencia evidencia) {
        this.enviarMensajeHttp(EventoDTO.fromObject(EvidenciaDTO.fromEntity(evidencia), 
                                            WsDestinoEnum.TOPIC_EVIDENCIA_REALTIME));
    }

    public void publicarFinalizacion(Alarma alarma) {
        this.enviarMensajeHttp(EventoDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            WsDestinoEnum.TOPIC_ALARMA_FINALIZACION));
    }

    public void publicarReactivacion(Alarma alarma) {
        this.enviarMensajeHttp(EventoDTO.fromObject(AlarmaDTO.fromEntity(alarma), 
                                            WsDestinoEnum.TOPIC_ALARMA_REACTIVACION));
    }
}