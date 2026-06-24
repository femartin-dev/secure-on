package com.secureon.appmovil.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.AlarmaRequest;
import com.secureon.appmovil.dto.request.EvidenciaRequest;
import com.secureon.appmovil.dto.request.FinalizarRequest;
import com.secureon.appmovil.dto.request.UbicacionRequest;
import com.secureon.common.exception.BadRequestException;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.Evidencia;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.model.entity.Ubicacion;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.AlarmaRepository;

import jakarta.transaction.Transactional;

@Service
public class AlarmaService {

    @Autowired
    private AlarmaRepository alarmaRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private WsMensajeriaService webSocketPublisher;

    @Autowired
    private UbicacionService ubicacionService;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private EstadoAlarmaService estadoAlarmaService;

    @Autowired
    private DispositivoService dispositivoService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private MessagesService messagesService;

    @Autowired
    private EvidenciaService evidenciaService;


    @Transactional
    public Alarma crearAlarma(AlarmaRequest request) {
        this.procesarAlarmasActivas(request.getUsuarioId(), request.getDispositivoId(), true);
        Alarma alarma = new Alarma();
        alarma.setDispositivo(dispositivoService.getDispositivo(request.getDispositivoId()) );
        alarma.setMetodoActivacion(catalogoService.getMetodoActivacion(request.getMetodoActivacion()));
        alarma.setEstadoAlarma(estadoAlarmaService.getEstadoActiva());
        alarma.setUsuario(usuarioService.getUsuario(request.getUsuarioId()));
        alarma.setFueReactivada(false);
        alarma.setCanceladaPorCdm(false);
        alarma.setPrioridad(catalogoService.getPrioridadNueva());
        alarma.setFechaActivacion(request.getFechaActivacion());

        Alarma saved = alarmaRepository.save(alarma);

        if (request.getUbicacion() != null) {
            ubicacionService.actualizarUbicacion(alarma, request.getUbicacion());
        }

        webSocketPublisher.publicarNuevaAlarma(saved);

        notificacionService.enviarAlertaContactos(saved);

        return saved;
    }

    @Transactional
    public void actualizarUbicacion(UUID alarmaId, UbicacionRequest request) {
        Alarma alarma = obtenerAlarma(alarmaId);
        if (!alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoActiva()) && 
            !alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoFinalizada())) {

            throw new BadRequestException(messagesService.getMessage("error.alarma.not-active"));
        }

        Ubicacion ubicacion = ubicacionService.actualizarUbicacion(alarma, request);

        // Publicar ubicación en tiempo real
        webSocketPublisher.publicarUbicacion(ubicacion);
    }

    @Transactional
    public void finalizarAlarma(UUID alarmaId, FinalizarRequest request) {
        publicarCambioAlarma(alarmaId, request.getFechaFinalizacion(), estadoAlarmaService.getEstadoFinalizada());
    }

    @Transactional
    public void cancelarAlarma(UUID alarmaId, FinalizarRequest request) {
        publicarCambioAlarma(alarmaId, request.getFechaFinalizacion(), estadoAlarmaService.getEstadoCancelada());
    }

    private void publicarCambioAlarma(UUID alarmaId, OffsetDateTime fechaFin, EstadoAlarma estadoAlarma) {
        Alarma alarma = obtenerAlarma(alarmaId);
        alarma.setFechaFinalizacion(fechaFin != null ? fechaFin : OffsetDateTime.now());
        alarma.setEstadoAlarma(estadoAlarma); 
        alarmaRepository.save(alarma);

        webSocketPublisher.publicarFinalizacion(alarma);
    }

    @Transactional
    public void reactivarAlarma(UUID alarmaId, UUID dispositivoId) {
        Alarma alarma = obtenerAlarma(alarmaId);

        if (!alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoActiva()) && 
        !alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoFinalizada())) {
            throw new BadRequestException(messagesService.getMessage("error.alarma.not-active"));
        }

        alarma.setFueReactivada(true);
        alarma.setDispositivo(dispositivoService.getDispositivo(dispositivoId));
        alarmaRepository.save(alarma);

        webSocketPublisher.publicarReactivacion(alarma);
    }

    public Alarma obtenerAlarma(UUID alarmaId) {
        return alarmaRepository.findById(alarmaId)
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.alarma.not-found")));
    }

    public void agregarEvidencia(UUID alarmaId, EvidenciaRequest request) {
        Alarma alarma = obtenerAlarma(alarmaId);
        Evidencia evidencia = evidenciaService.agregarEvidencia(alarma, request);
        
        webSocketPublisher.publicarEvidencia(evidencia);
    }

    public List<Alarma> listarAlarmas(UUID usuarioId, Integer estadoId, Integer prioridadId, 
                            OffsetDateTime fechaDesde, OffsetDateTime fechaHasta) {
        // Implementar lógica para listar alarmas con filtros y paginación
        Usuario usuario = usuarioService.getUsuario(usuarioId);
        EstadoAlarma estado = estadoAlarmaService.getEstadoAlarma(estadoId);
        PrioridadAlarma prioridad = catalogoService.getPrioridad(prioridadId);
        return alarmaRepository.buscarConFiltros(usuario, estado, prioridad, fechaDesde, fechaHasta);
    }

    public void procesarAlarmasActivas(UUID usuarioId, UUID dispositivoId, boolean finalizar) {
        List<Alarma> alarmasActivas = alarmaRepository.findByUsuarioIdAndDispositivoIdAndEstadoAlarma(usuarioId, dispositivoId, estadoAlarmaService.getEstadoActiva());
        if (!finalizar) 
            throw new BadRequestException(messagesService.getMessage("error.alarma.active-alarm-exists"));
        alarmasActivas.forEach(alarma -> this.finalizarAlarma(alarma.getId(), new FinalizarRequest()));
    }

}