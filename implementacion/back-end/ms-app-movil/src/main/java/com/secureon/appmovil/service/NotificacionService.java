package com.secureon.appmovil.service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.secureon.appmovil.config.TwilioConfig;
import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.ConfiguracionUsuario;
import com.secureon.appmovil.model.entity.Contacto;
import com.secureon.appmovil.model.entity.Dispositivo;
import com.secureon.appmovil.model.entity.Ubicacion;
import com.secureon.appmovil.model.entity.Usuario;
import com.secureon.appmovil.util.MessageService;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificacionService {

    @Autowired
    private TwilioConfig twilioConfig;

    @Autowired
    private ContactoService contactoService;

    @Autowired
    private ConfiguracionService configuracionService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private AlarmaContactoService alarmaContactoService;

    @Autowired
    private CatalogoService catalogoService;

    @Async("taskExecutor")
    public void enviarAlertaContactos(Alarma alarma) {
        List<Contacto> contactos = contactoService.getContactosUsuario(alarma.getUsuario().getId());

        if (contactos.isEmpty()) {
            log.info("No hay contactos SMS para la alerta {}", alarma.getId());
            return;
        }

        String mensaje = getMensajeEnvio(alarma);
        
        for (Contacto contacto : contactos) {
            try {
                Message message = Message.creator(
                        new PhoneNumber(contacto.getTelefono()),
                        new PhoneNumber(twilioConfig.getFromNumber()),
                        mensaje
                ).create();
                log.info("SMS enviado a {}: SID {}", contacto.getTelefono(), message.getSid());
            } catch (Exception e) {
                log.error("Error enviando SMS a {}: {}", contacto.getTelefono(), e.getMessage());
            }
        }
    }

    private String getMensajeEnvio(Alarma alarma) {
        Usuario usuario = alarma.getUsuario();
        Dispositivo dispositivo = alarma.getDispositivo();
        ConfiguracionUsuario config = configuracionService.getConfiguracionUsuario(usuario, dispositivo);
        String mensaje = config.getTemplateMensaje();
        String nombreuser = usuario.getApellido() + ", " + usuario.getNombre();
        return String.format(mensaje, nombreuser, getDuracionAlarma(alarma.getFechaActivacion()), 
                            getUltimaUbicacion(alarma.getUbicaciones()));
    }

    private String getDuracionAlarma(OffsetDateTime desde) {
        long segundos = Duration.between(desde, OffsetDateTime.now()).getSeconds();
        long abs = Math.abs(segundos);
        if (abs <= 120) {
            return abs + " " + messageService.getMessage("time.seconds");
        }
        long minutos = abs / 60;
        if (minutos <= 120) {
            return minutos + " " + messageService.getMessage("time.minutes");
        }
        long horas = minutos / 60;
        return horas + " " + messageService.getMessage("time.hours");
    }

    private String getUltimaUbicacion(List<Ubicacion> ubicaciones) {
        String ubicacionStr = "Ubicación no disponible";
        if (ubicaciones == null || ubicaciones.isEmpty())
            return ubicacionStr;
        Optional<Ubicacion> existe = ubicaciones.stream()
            .max(Comparator.comparing(Ubicacion::getFechaToma));
        if (existe.isPresent()) {
            double lat = existe.get().getPosicion().getY();
            double lng = existe.get().getPosicion().getX();
            ubicacionStr = String.format("https://maps.google.com/?q=%.6f,%.6f", lat, lng);
        }
        return ubicacionStr;
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
            if (!esSMS || !esWhatsapp) {
                throw new RuntimeException("Servicio no implementado");
            } 
            this.enviarMensaje(mensaje, contacto.getTelefono(), esSMS);
            alarmaContactoService.enviarAlarmaContacto(alarma, contacto, contacto.getCanalNotificacion(), 
                    catalogoService.getEstadoEnvio(1) , mensaje);
        } catch (Exception e) {
            String canalStr = esSMS ? "SMS" : esWhatsapp ? "whatsapp" : "S/D";
            String msjErr = String.format("Error enviando {0} a {1}: {2}", canalStr, 
                            contacto.getTelefono(), e.getMessage());
            log.error(msjErr);
            alarmaContactoService.enviarAlarmaContacto(alarma, contacto, contacto.getCanalNotificacion(), 
                    catalogoService.getEstadoEnvio(3) , msjErr);
        }
    }

    private void enviarMensaje(String mensaje, String telefono, boolean esSMS ) throws Exception {
            String twilioPhone = esSMS ? twilioConfig.getFromNumber() : twilioConfig.getWhatsappFromNumber();
            Message message = Message.creator(
                    new PhoneNumber(telefono),
                    new PhoneNumber(twilioPhone),
                    mensaje
            ).create(); 
            log.info("Mensaje enviado a {}: SID {}", telefono, message.getSid());
    }
 
}