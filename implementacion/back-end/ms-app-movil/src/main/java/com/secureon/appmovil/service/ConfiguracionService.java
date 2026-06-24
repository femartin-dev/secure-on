package com.secureon.appmovil.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureon.appmovil.dto.request.ConfiguracionRequest;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.ConfiguracionUsuario;
import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;
import com.secureon.appmovil.repository.ConfiguracionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;
    private final UsuarioService usuarioService;
    private final DispositivoService dispositivoService;
    private final MessagesService messagesService;  
    private final CatalogoService catalogoService;

    public ConfiguracionUsuario getConfiguracionUsuario(UUID usuarioId, UUID dispositivoId) {
        Usuario usuario = usuarioService.getUsuario(usuarioId);
        Dispositivo dispositivo = dispositivoService.getDispositivo(dispositivoId);
        return getConfiguracionUsuario(usuario, dispositivo);
    }

    public ConfiguracionUsuario getConfiguracionUsuario(Usuario usuario, Dispositivo dispositivo) {
        return configuracionRepository.findByUsuarioAndDispositivo(usuario, dispositivo)
                        .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.configuracion.not-found")));
    }

    @Transactional
    public ConfiguracionUsuario guardarConfiguracion(UUID configuracionId, ConfiguracionRequest request) {
        ConfiguracionUsuario configuracion;
        if (configuracionId == null) {
            configuracionRepository.findByUsuarioIdAndDispositivoId(request.getUsuarioId(), request.getDispositivoId())
                .ifPresent(config -> { throw new ResourceNotFoundException(messagesService.getMessage("error.configuracion.already-exists")); });
            configuracion = new ConfiguracionUsuario();
            configuracion.setUsuario(usuarioService.getUsuario(request.getUsuarioId()));
            configuracion.setDispositivo(dispositivoService.getDispositivo(request.getDispositivoId()));
        } else {
            configuracion = configuracionRepository.findById(configuracionId)
                .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.configuracion.not-found")));
        }
        setConfiguracion(configuracion, request);
        configuracionRepository.save(configuracion);
        return configuracion;
    }


    private void setConfiguracion(ConfiguracionUsuario config, ConfiguracionRequest request) {
        config.setBorrarAntiguas(request.getBorrarAntiguas());
        config.setBorrarEnviadas(request.getBorrarEnviadas());
        config.setCompresionAudio(request.getCompresionAudio());
        config.setConservarEvidencias(request.getConservarEvidencias());
        config.setConservarHistorialLocal(request.getConservarHistorialLocal());
        config.setEnvioSoloWifi(request.getEnvioSoloWifi());
        config.setEspacioCriticoPct(request.getEspacioCriticoPct());
        config.setFraseActivacionVoz(request.getFraseActivacionVoz());
        config.setFrecuenciaCapturaFotos(request.getFrecuenciaCapturaFotos());
        config.setFrecuenciaGrabaAudio(request.getFrecuenciaGrabaAudio());
        config.setFrecuenciaUbicacion(request.getFrecuenciaUbicacion());
        config.setIdioma(request.getIdiomaId() == null ? null : catalogoService.getIdioma(request.getIdiomaId()));
        config.setLimiteDatos(request.getLimiteDatos());
        config.setLimiteEspacioEvidencias(request.getLimiteEspacioEvidencias());
        config.setModoDark(request.getModoDark());
        config.setModoSigilosoActivo(request.getModoSigilosoActivo());
        config.setNotificarSiempreSms(request.getNotificarSiempreSms());
        config.setNroIntentosFallidos(request.getNroIntentosFallidos());
        config.setPassDesbloqueo(request.getPassDesbloqueo());
        config.setPatronActivacion(request.getPatronActivacion());
        config.setPatronDesbloqueo(request.getPatronDesbloqueo());
        config.setPinDesbloqueo(request.getPinDesbloqueo());  
        config.setPrecisionRed(request.getPrecisionRed());
        config.setResolucionFotosDpi(request.getResolucionFotosDpi());
        config.setRetencionEvidenciasDias(request.getRetencionEvidenciasDias());
        config.setSensibilidadMovimiento(request.getSensibilidadMovimiento());
        config.setTiempoActivacionSeg(request.getTiempoActivacionSeg());
        config.setTiempoCancelacionSeg(request.getTiempoCancelacionSeg());
        config.setUbicacionWifi(request.getUbicacionWifi());
        config.setUmbralBateriaBaja(request.getUmbralBateriaBaja());
        config.setUmbralBateriaMedia(request.getUmbralBateriaMedia());
        config.setUmbralBateriaCritica(request.getUmbralBateriaCritica());
        config.setUmbralMinimoLux(request.getUmbralMinimoLux());
        config.setUsarDatosMoviles(request.getUsarDatosMoviles());
        config.setUsarFiltrosRuido(request.getUsarFiltrosRuido());
    }

    @Transactional
    public void eliminarConfiguracion(UUID configuracionId) {
        ConfiguracionUsuario configuracion = configuracionRepository.findById(configuracionId)
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.configuracion.not-found")));
        configuracionRepository.delete(configuracion);
    }

    @Transactional
    public ConfiguracionUsuario resetearConfiguracion(UUID configuracionId) {
        ConfiguracionUsuario configuracion = configuracionRepository.findById(configuracionId)
            .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.configuracion.not-found")));
        ConfiguracionRequest defaultConfig = new ConfiguracionRequest();
        setConfiguracion(configuracion, defaultConfig);
        configuracionRepository.save(configuracion);
        return configuracion;
    }
}

