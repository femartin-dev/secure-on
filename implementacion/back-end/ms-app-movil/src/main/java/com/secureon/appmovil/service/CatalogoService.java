package com.secureon.appmovil.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.CanalNotificacion;
import com.secureon.common.model.entity.EstadoEnvio;
import com.secureon.common.model.entity.Idioma;
import com.secureon.common.model.entity.MetodoActivacion;
import com.secureon.common.model.entity.MetodoUbicacion;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.CanalNotificacionRepository;
import com.secureon.appmovil.repository.EstadoEnvioRepository;
import com.secureon.appmovil.repository.IdiomaRepository;
import com.secureon.appmovil.repository.MetodoActivacionRepository;
import com.secureon.appmovil.repository.MetodoUbicacionRepository;
import com.secureon.appmovil.repository.PrioridadRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final MetodoActivacionRepository metodoActivacionRepository;
    private final MetodoUbicacionRepository metodoUbicacionRepository;
    private final IdiomaRepository idiomaRepository;
    private final PrioridadRepository prioridadRepository;
    private final CanalNotificacionRepository canalRepository;
    private final EstadoEnvioRepository envioRepository;
    @Value("${app.static-values.prioridad.normal}")
    private Integer prioridadNueva;
    private final MessagesService messagesService;

    public MetodoUbicacion getMetodoUbicacion(Integer id) {
        return metodoUbicacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.metodo-ubicacion.not-found")));
    }

    public MetodoActivacion getMetodoActivacion(Integer id) {
        return metodoActivacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.metodo-activacion.not-found")));
    }

    public Idioma getIdioma(String idioma) {
        return idiomaRepository.findById(idioma)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.idioma.not-found")));
    }

    public PrioridadAlarma getPrioridad(Integer id) {
        return prioridadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.prioridad.not-found")));
    }

    public PrioridadAlarma getPrioridadNueva() {
        return getPrioridad(prioridadNueva);
    }

    public CanalNotificacion getCanalNotificacion(Integer id) {
        return canalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.canal-notificacion.not-found")));
    }

    public EstadoEnvio getEstadoEnvio(Integer id) {
        return envioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.estado-envio.not-found")));
    }

    @Cacheable(value = "catalogos", key = "'metodosUbicacion'")
    public List<MetodoUbicacion> getMetodosUbicacion() {
        return metodoUbicacionRepository.findByHabilitadaTrue();
    }

    @Cacheable(value = "catalogos", key = "'metodosActivacion'")
    public List<MetodoActivacion> getMetodosActivacion() {
        return metodoActivacionRepository.findByHabilitadaTrue();
    }

    @Cacheable(value = "catalogos", key = "'idiomas'")
    public List<Idioma> getIdiomas() {
        return idiomaRepository.findByHabilitadaTrue();
    }

    @Cacheable(value = "catalogos", key = "'prioridades'")
    public List<PrioridadAlarma> getPrioridades() {
        return prioridadRepository.findByHabilitadaTrue();
    }

    @Cacheable(value = "catalogos", key = "'canales'")
    public List<CanalNotificacion> getCanalesNotificacion() {
        return canalRepository.findByHabilitadaTrue();
    }

    @Cacheable(value = "catalogos", key = "'estadosEnvio'")
    public List<EstadoEnvio> getEstadosEnvio() {
        return envioRepository.findByHabilitadaTrue();
    }
}
