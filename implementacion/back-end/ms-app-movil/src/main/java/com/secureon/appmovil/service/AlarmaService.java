package com.secureon.appmovil.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.AlarmaRequest;
import com.secureon.appmovil.dto.request.FinalizarRequest;
import com.secureon.appmovil.dto.request.UbicacionRequest;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.EstadoAlarma;
import com.secureon.appmovil.model.entity.Ubicacion;
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

    @Transactional
    public Alarma crearAlarma(AlarmaRequest request) {
        // Crear entidad Alerta
        Alarma alarma = new Alarma();
        alarma.setDispositivo(dispositivoService.getDispositivo(request.getDispositivoId()) );
        alarma.setMetodoActivacion(catalogoService.getMetodoActivacion(request.getMetodoActivacion()));
        alarma.setEstadoAlarma(estadoAlarmaService.getEstadoActiva());
        alarma.setUsuario(usuarioService.getUsuario(request.getUserId()));
        alarma.setFueReactivada(false);
        alarma.setCanceladaPorCdm(false);

        Alarma saved = alarmaRepository.save(alarma);

        if (request.getUbicacionInicial() != null) {
            ubicacionService.actualizarUbicacion(alarma, null);
        }

        webSocketPublisher.publicarNuevaAlarma(saved);

        notificacionService.enviarAlertaContactos(saved);

        return saved;
    }

    @Transactional
    public void actualizarUbicacion(UUID alarmaId, UbicacionRequest request) {
        Alarma alarma = alarmaRepository.findById(alarmaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));

        if (!alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoActiva())) {
            throw new RuntimeException("La alerta no está activa");
        }

        Ubicacion ubicacion = ubicacionService.actualizarUbicacion(alarma, request);

        // Publicar ubicación en tiempo real
        webSocketPublisher.publicarUbicacion(alarmaId, ubicacion);
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
        Alarma alarma = alarmaRepository.findById(alarmaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));

        alarma.setFechaFinalizacion(fechaFin != null ? fechaFin : OffsetDateTime.now());
        alarma.setEstadoAlarma(estadoAlarma); 
        alarmaRepository.save(alarma);

        webSocketPublisher.publicarFinalizacion(alarma);
    }

    @Transactional
    public void reactivarAlarma(UUID alarmaId, UUID dispositivoId) {
        Alarma alarma = alarmaRepository.findById(alarmaId)
                .orElseThrow(() -> new RuntimeException("Alarma no encontrada"));

        if (!alarma.getEstadoAlarma().equals(estadoAlarmaService.getEstadoActiva())) {
            throw new RuntimeException("No se puede reactivar una alerta no activa");
        }

        alarma.setFueReactivada(true);
        alarma.setDispositivo(dispositivoService.getDispositivo(dispositivoId));
        alarmaRepository.save(alarma);

        webSocketPublisher.publicarReactivacion(alarma);
    }

    public Alarma obtenerAlarma(UUID alarmaId) {
        return alarmaRepository.findById(alarmaId)
            .orElseThrow(() -> new RuntimeException("Alarma no encontrada"));
    }

}