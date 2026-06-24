package com.secureon.appmovil.service;

import java.text.MessageFormat;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.BadRequestException;
import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.ConfiguracionUsuario;
import com.secureon.common.model.entity.Contacto;
import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Ubicacion;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;
import com.secureon.common.util.SmsUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificacionService {

    @Autowired
    private SmsUtils smsUtils;

    @Autowired
    private ContactoService contactoService;

    @Autowired
    private ConfiguracionService configuracionService;

    @Autowired
    private MessagesService messagesService;

    @Autowired
    private AlarmaContactoService alarmaContactoService;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private UbicacionService ubicacionService;


    public void enviarAlertaContactos(Alarma alarma) {
        List<Contacto> contactos = contactoService.getContactosUsuario(alarma.getUsuario().getId());

        if (contactos.isEmpty()) {
            log.info("No hay contactos SMS para la alerta {}", alarma.getId());
            return;
        }

        String mensaje = getMensajeEnvio(alarma);
        
        for (Contacto contacto : contactos) {
            try {
                enviarMensaje(mensaje, contacto, alarma);
            } catch (Exception e) {
                log.error("Error enviando SMS a {}: {}", contacto.getTelefono(), e.getMessage());
            }
        }
    }

    private String getMensajeEnvio(Alarma alarma) {
        Usuario usuario = alarma.getUsuario();
        Dispositivo dispositivo = alarma.getDispositivo();
        ConfiguracionUsuario config = configuracionService.getConfiguracionUsuario(usuario, dispositivo);
        String mensaje = config.getTemplateMensaje() == null || config.getTemplateMensaje().isBlank() 
                        ? messagesService.getMessage("alarma.mensaje.default") 
                        : config.getTemplateMensaje();
        String nombreuser = usuario.getApellido() + ", " + usuario.getNombre();
        return MessageFormat.format(mensaje, nombreuser, getDuracionAlarma(alarma.getFechaActivacion()), 
                            getUltimaUbicacion(alarma));
    }

    private String getDuracionAlarma(OffsetDateTime desde) {
        long segundos = Duration.between(desde, OffsetDateTime.now()).getSeconds();
        long abs = Math.abs(segundos);
        if (abs < 60) {
            return abs + " " + messagesService.getMessage("time.seconds");
        }
        long minutos = abs / 60;
        if (minutos < 60) {
            if (minutos < 10) {
                String secs = (abs % 60 < 10 ? "0" : "") + (abs % 60);
                return minutos + ":" + secs + " " + messagesService.getMessage("time.minutes"); 
            }
            return minutos + " " + messagesService.getMessage("time.minutes");
        }
        long horas = minutos / 60;
        if (horas < 2) {
            String mins = ((minutos % 60) < 10 ? "0" : "") + (minutos % 60);
            return horas + ":" + mins + " " + messagesService.getMessage("time.hours");
        }
        return horas + " " + messagesService.getMessage("time.hours");
    }

    private String getUltimaUbicacion(Alarma alarma) {
        Ubicacion ultimaUbicacion = ubicacionService.getUltimaUbicacion(alarma);
        if (ultimaUbicacion == null) {
            return messagesService.getMessage("error.ubicacion.last-known.not-found");
        }
        double lat = ultimaUbicacion.getPosicion().getY();
        double lng = ultimaUbicacion.getPosicion().getX();
        return messagesService.getMessage("google.maps.place.point", lat, lng, 18);
    }

    public void enviarCodigoActivacionDispositivo() {

    }

    @Async("taskExecutor")
    private void enviarMensaje(String mensaje, Contacto contacto, Alarma alarma) {
        boolean esSMS = false;
        boolean esWhatsapp = false;
        try {
            esSMS = Integer.valueOf(1).equals(contacto.getCanalNotificacion().getId());
            esWhatsapp = Integer.valueOf(2).equals(contacto.getCanalNotificacion().getId());
            if (!esSMS && !esWhatsapp) {
                throw new BadRequestException("Servicio no implementado");
            } 
            this.enviarMensaje(mensaje, contacto.getTelefono(), esSMS);
            alarmaContactoService.enviarAlarmaContacto(alarma, contacto, contacto.getCanalNotificacion(), 
                    catalogoService.getEstadoEnvio(1) , mensaje);
        } catch (Exception e) {
            String canalStr = esSMS ? "SMS" : esWhatsapp ? "whatsapp" : "S/D";
            String msjErr = MessageFormat.format("Error enviando {0} a {1}: {2}", canalStr, 
                            contacto.getTelefono(), e.getMessage());
            log.error(msjErr, e);
            alarmaContactoService.enviarAlarmaContacto(alarma, contacto, contacto.getCanalNotificacion(), 
                    catalogoService.getEstadoEnvio(3) , msjErr);
        }
    }

    private void enviarMensaje(String mensaje, String telefono, boolean esSMS ) throws Exception {
            String sid = esSMS ? smsUtils.sendSms(telefono, mensaje) : smsUtils.sendWhatsapp(telefono, mensaje);
            log.info("Mensaje enviado a {}: SID {}", telefono, sid);
    }
 
}