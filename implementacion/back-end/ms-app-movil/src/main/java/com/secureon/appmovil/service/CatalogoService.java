package com.secureon.appmovil.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.model.entity.CanalNotificacion;
import com.secureon.appmovil.model.entity.EstadoEnvio;
import com.secureon.appmovil.model.entity.Idioma;
import com.secureon.appmovil.model.entity.MetodoActivacion;
import com.secureon.appmovil.model.entity.MetodoUbicacion;
import com.secureon.appmovil.model.entity.PrioridadAlarma;
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

    public MetodoUbicacion getMetodoUbicacion(Integer id) {
        return metodoUbicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Metodo de ubicacion no encontrado"));
    }

    public MetodoActivacion getMetodoActivacion(Integer id) {
        return metodoActivacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Metodo de activacion no encontrado"));
    }

    public Idioma getIdioma(String idioma) {
        return idiomaRepository.findById(idioma)
                .orElseThrow(() -> new RuntimeException("Idioma no encontrado"));
    }

    public PrioridadAlarma getPrioridad(Integer id) {
        return prioridadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prioridad de alarma no encontrada"));
    }

    public CanalNotificacion getCanalNotificacion(Integer id) {
        return canalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Canal de Notificacion a contacto no encontrado"));
    }

    public EstadoEnvio getEstadoEnvio(Integer id) {
        return envioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado de envio a contacto no encontrado"));
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
