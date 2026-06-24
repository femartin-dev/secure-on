package com.secureon.seguridad.service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MailUtils;
import com.secureon.common.util.MessagesService;
import com.secureon.common.util.SecurityUtils;
import com.secureon.common.util.SmsUtils;
import com.secureon.seguridad.dto.response.EnvioCodigoResponse;
import com.secureon.seguridad.dto.response.ValidacionResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivacionCodigoService {

    @Value("${app.code-expiration.mail}")
    private int MAIL_VERIFICATION_CODE_EXPIRATION;
    @Value("${app.code-expiration.sms}")
    private int SMS_VERIFICATION_CODE_EXPIRATION;
           
    private final MailUtils mailUtils;
    private final SmsUtils smsUtils;
    
    private final MessagesService messageService;
    private final UsuarioService usuarioService;
    private final DispositivoService dispositivoService;

    private final Map<UUID, VerificationData> emailVerifications = new ConcurrentHashMap<>();
    private final Map<UUID, VerificationData> deviceVerifications = new ConcurrentHashMap<>();

    public EnvioCodigoResponse sendEmailActivationCode(UUID usuarioId) {
        try {
            Usuario usuario = usuarioService.getUsuarioPorId(usuarioId);
            OffsetDateTime fechaExpiracion = sendEmailActivationCode(usuario);
            return new EnvioCodigoResponse(true, MAIL_VERIFICATION_CODE_EXPIRATION, fechaExpiracion);
        } catch (Exception e) {
            return new EnvioCodigoResponse(false, null, null);
        }
    }

    private OffsetDateTime sendEmailActivationCode(Usuario usuario) {
        String code = SecurityUtils.generateEmailVerificationCode();
        OffsetDateTime expiration = OffsetDateTime.now().plusSeconds(MAIL_VERIFICATION_CODE_EXPIRATION);
        emailVerifications.put(usuario.getId(), new VerificationData(code, expiration));

        String subject = messageService.getMessage("mail.activation-code.subject");
        String body = messageService.getMessage("mail.activation-code.mensaje", code, convertirSegundosAMinutos(MAIL_VERIFICATION_CODE_EXPIRATION));
        mailUtils.sendTextMail(usuario.getEmail(), subject, body);
        return expiration;
    }

    public ValidacionResponse validateEmailActivationCode(UUID usuarioId, String code) {
        try {
            boolean valido = validateAndConsume(emailVerifications, usuarioId, code);
            if (valido) {
                usuarioService.activarUsuario(usuarioId);
            }
            String mensaje = valido ? messageService.getMessage("ok.email-code.valid") : messageService.getMessage("err.email-code.invalid");
            return new ValidacionResponse(valido, mensaje);
        } catch (Exception e) {
            return new ValidacionResponse(false, messageService.getMessage("err.email-code.invalid"));
        }
    }

    public EnvioCodigoResponse sendDeviceActivationCode(UUID dispositivoId) {
        try {
            Dispositivo dispositivo = dispositivoService.getDispositivo(dispositivoId);
            OffsetDateTime fechaExpiracion = sendDeviceActivationCode(dispositivo);
            return new EnvioCodigoResponse(true, SMS_VERIFICATION_CODE_EXPIRATION, fechaExpiracion);
        } catch (Exception e) {
            return new EnvioCodigoResponse(false, null, null);
        }
    }

    public OffsetDateTime sendDeviceActivationCode(Dispositivo dispositivo) {
        String code = SecurityUtils.generateDeviceVerificationCode();
        OffsetDateTime expiration = OffsetDateTime.now().plusSeconds(SMS_VERIFICATION_CODE_EXPIRATION);
        deviceVerifications.put(dispositivo.getId(), new VerificationData(code, expiration));
        String body = messageService.getMessage("sms.activation-code.mensaje", code);
        smsUtils.sendSms(dispositivo.getNumero(), body);
        return expiration;
    }

    public ValidacionResponse validateDeviceActivationCode(UUID dispositivoId, String code) {
        try {
            boolean valido = validateAndConsume(deviceVerifications, dispositivoId, code);
            if (valido) {
                dispositivoService.activarDispositivo(dispositivoId);
            }
            String mensaje = valido ? messageService.getMessage("ok.device-code.valid") : messageService.getMessage("err.device-code.invalid");
            return new ValidacionResponse(valido, mensaje);
        } catch (Exception e) {
            return new ValidacionResponse(false, messageService.getMessage("err.device-code.invalid"));
        }
    }

    private <K> boolean validateAndConsume(Map<K, VerificationData> bucket, K key, String code) {
        VerificationData verificationData = bucket.get(key);
        if (verificationData == null) {
            return false;
        }

        if (verificationData.expiration().isBefore(OffsetDateTime.now())) {
            bucket.remove(key);
            return false;
        }

        if (!verificationData.code().equals(code)) {
            return false;
        }

        bucket.remove(key);
        return true;
    }

    private record VerificationData(String code, OffsetDateTime expiration) {
    }

    private String convertirSegundosAMinutos(int segundos) {
        return segundos >= 60 ? messageService.getMessage("msj.expiracion.minutos", segundos / 60, segundos % 60) : messageService.getMessage("msj.expiracion.segundos", segundos);
    }
}