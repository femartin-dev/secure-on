package com.secureon.appmovil.service;

import org.springframework.stereotype.Service;

import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.AlarmaContacto;
import com.secureon.appmovil.model.entity.CanalNotificacion;
import com.secureon.appmovil.model.entity.Contacto;
import com.secureon.appmovil.model.entity.EstadoEnvio;
import com.secureon.appmovil.repository.AlarmaContactoRespository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlarmaContactoService {

    private final AlarmaContactoRespository alarmaContactoRespository;

    public AlarmaContacto enviarAlarmaContacto(Alarma alarma, Contacto contacto, 
                                                CanalNotificacion canalNotificacion,
                                                EstadoEnvio estadoEnvio, String mensaje) {
        
        AlarmaContacto oldAlarmaContacto = alarmaContactoRespository
                                .findByAlarmaAndContactoOrderByFechaEnvioDesc(alarma, contacto)
                                .stream().findFirst().orElse(null);
        AlarmaContacto alarmaContacto = new AlarmaContacto();
        if (oldAlarmaContacto != null) {
            alarmaContacto.setIntento(oldAlarmaContacto.getIntento() + 1);
        }
        alarmaContacto.setAlarma(alarma);
        alarmaContacto.setContacto(contacto);
        alarmaContacto.setCanalNotificacion(canalNotificacion);
        alarmaContacto.setEstadoEnvio(estadoEnvio);
        alarmaContacto.setMensaje(mensaje);
        return alarmaContactoRespository.save(alarmaContacto);
    }
}
