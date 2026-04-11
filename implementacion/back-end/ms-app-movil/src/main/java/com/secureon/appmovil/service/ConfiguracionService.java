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

    public ConfiguracionUsuario getConfiguracionUsuario(UUID usuarioId, UUID dispositivoId) {
        return configuracionRepository.findByUsuarioIdAndDispositivoId(usuarioId, dispositivoId)
                        .orElseThrow(() -> new ResourceNotFoundException(messagesService.getMessage("error.configuracion.not-found")));
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


    private void setConfiguracion(ConfiguracionUsuario configuracionUsuario, ConfiguracionRequest request) {
        configuracionUsuario.setBorrarAntiguas(request.getBorrarAntiguas());
        configuracionUsuario.setBorrarEnviadas(request.getBorrarEnviadas());
        configuracionUsuario.setCompresionAudio(request.getCompresionAudio());
        configuracionUsuario.setConservarEvidencias(request.getConservarEvidencias());
        configuracionUsuario.setConservarHistorialLocal(request.getConservarHistorialLocal());
        configuracionUsuario.setEnvioSoloWifi(request.getEnvioSoloWifi());
        configuracionUsuario.setEspacioCriticoPct(request.getEspacioCriticoPct());
        configuracionUsuario.setFraseActivacionVoz(request.getFraseActivacionVoz());
        configuracionUsuario.setFrecuenciaCapturaFotos(request.getFrecuenciaCapturaFotos());
        configuracionUsuario.setFrecuenciaGrabaAudio(request.getFrecuenciaGrabaAudio());
        configuracionUsuario.setFrecuenciaUbicacion(request.getFrecuenciaUbicacion());
        configuracionUsuario.setLimiteDatos(request.getLimiteDatos());
        configuracionUsuario.setLimiteEspacioEvidencias(request.getLimiteEspacioEvidencias());
        configuracionUsuario.setModoSigilosoActivo(request.getModoSigilosoActivo());
        configuracionUsuario.setNotificarSiempreSms(request.getNotificarSiempreSms());
        configuracionUsuario.setNroIntentosFallidos(request.getNroIntentosFallidos());
        configuracionUsuario.setPrecisionRed(request.getPrecisionRed());
        configuracionUsuario.setResolucionFotosDpi(request.getResolucionFotosDpi());
        configuracionUsuario.setRetencionEvidenciasDias(request.getRetencionEvidenciasDias());
        configuracionUsuario.setTiempoCancelacionSeg(request.getTiempoCancelacionSeg());
        configuracionUsuario.setUbicacionWifi(request.getUbicacionWifi());
        configuracionUsuario.setUmbralBateriaBaja(request.getUmbralBateriaBaja());
        configuracionUsuario.setUmbralBateriaMedia(request.getUmbralBateriaMedia());
        configuracionUsuario.setUmbralBateriaCritica(request.getUmbralBateriaCritica());
    }
}

