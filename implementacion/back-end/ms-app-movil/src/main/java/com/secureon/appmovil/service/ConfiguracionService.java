package com.secureon.appmovil.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.secureon.appmovil.dto.request.ConfiguracionRequest;
import com.secureon.appmovil.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.model.entity.Dispositivo;
import com.secureon.appmovil.model.entity.Usuario;
import com.secureon.appmovil.repository.ConfiguracionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;

    public ConfiguracionUsuario getConfiguracionUsuario(Usuario usuario, Dispositivo dispositivo) {
        return configuracionRepository.findByUsuarioAndDispositivo(usuario, dispositivo)
                        .orElseThrow(() -> new RuntimeException("Configuracion no encontrada"));
    }

    public ConfiguracionUsuario guardarConfiguracion(UUID configuracionId, ConfiguracionRequest request) {
        ConfiguracionUsuario configuracion;
        if (configuracionId == null) {
            configuracion = new ConfiguracionUsuario();
        } else {
            configuracion = configuracionRepository.findById(configuracionId)
                .orElseThrow(() -> new RuntimeException("Configuracion de usuario no encontrada"));
        }
        setConfiguracion(configuracion, request);
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
        configuracionUsuario.setUmbralBateriaCritica(request.getUmbralBateriaMedia());
    }
}

