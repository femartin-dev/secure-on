package com.secureon.appmovil.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.CanalNotificacion;
import com.secureon.common.model.entity.EstadoEnvio;
import com.secureon.common.model.entity.EstadoSalud;
import com.secureon.common.model.entity.Idioma;
import com.secureon.common.model.entity.MetodoActivacion;
import com.secureon.common.model.entity.MetodoUbicacion;
import com.secureon.common.model.entity.MotivoActivacion;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.model.entity.TipoEvidencia;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.CanalNotificacionRepository;
import com.secureon.appmovil.repository.EstadoEnvioRepository;
import com.secureon.appmovil.repository.EstadoSaludRepository;
import com.secureon.appmovil.repository.IdiomaRepository;
import com.secureon.appmovil.repository.MetodoActivacionRepository;
import com.secureon.appmovil.repository.MetodoUbicacionRepository;
import com.secureon.appmovil.repository.MotivoActivacionRepository;
import com.secureon.appmovil.repository.PrioridadRepository;
import com.secureon.appmovil.repository.TipoEvidenciaRepository;

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
    private final MotivoActivacionRepository motivoActivacionRepository;
    private final TipoEvidenciaRepository tipoEvidenciaRepository;
    private final EstadoSaludRepository estadoSaludRepository;
    @Value("${app.static-data.prioridad.normal}")
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

    public MotivoActivacion getMotivoActivacion(Integer id) {
        return motivoActivacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.motivo-activacion.not-found")));
    }

    public EstadoSalud getEstadoSalud(Integer id) {
        return estadoSaludRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.estado-salud.not-found")));
    }

    public TipoEvidencia getTipoEvidencia(Integer id) {
        return tipoEvidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.tipo-evidencia.not-found")));
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

    @Cacheable(value = "catalogos", key = "'relaciones'")
    public List<String> getRelaciones() {
        return Arrays.asList(messagesService.getMessage("data.contacto.relaciones").split(","))
                .stream().map(String::trim).collect(Collectors.toList());
    }

    @Cacheable(value = "catalogos", key = "'motivosActivacion'")    
    public List<MotivoActivacion> getMotivosActivacion() {
        return motivoActivacionRepository.findByHabilitadaTrue();   
    }

    @Cacheable(value = "catalogos", key = "'estadosSalud'")    
    public List<EstadoSalud> getEstadosSalud() {
        return estadoSaludRepository.findByHabilitadaTrue();   
    }

    @Cacheable(value = "catalogos", key = "'tiposEvidencia'")    
    public List<TipoEvidencia> getTiposEvidencia() {
        return tipoEvidenciaRepository.findByHabilitadaTrue();   
    }
}
