package com.secureon.common.util;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.secureon.common.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmsUtils {

    private static final String WHATSAPP_PREFIX = "whatsapp:";

    private final TwilioConfig twilioConfig;

    public String sendSms(String telefono, String mensaje) {
        return sendMessage(telefono, mensaje, false);
    }

    public String sendWhatsapp(String telefono, String mensaje) {
        return sendMessage(telefono, mensaje, true);
    }

    private String sendMessage(String telefono, String mensaje, boolean whatsapp) {
        TwilioConfig config = requireTwilioConfig();
        telefono = telefono.startsWith("+") ? telefono : ("+" + telefono);
        String fromNumber = whatsapp ? config.getWhatsappFromNumber() : config.getFromNumber();
        String destination = whatsapp ? ensureWhatsappPrefix(telefono) : telefono;
        String source = whatsapp ? ensureWhatsappPrefix(fromNumber) : fromNumber;

        Message message = Message.creator(
            new PhoneNumber(destination),
            new PhoneNumber(source),
            mensaje
        ).create();

        log.info("Mensaje {} enviado a {}: SID {}", whatsapp ? "whatsapp" : "SMS", telefono, message.getSid());
        return message.getSid();
    }

    private TwilioConfig requireTwilioConfig() {
        if (twilioConfig == null) {
            throw new IllegalStateException("Twilio no esta configurado en la aplicacion");
        }
        return twilioConfig;
    }

    private String ensureWhatsappPrefix(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            return phoneNumber;
        }
        return phoneNumber.startsWith(WHATSAPP_PREFIX) ? phoneNumber : WHATSAPP_PREFIX + phoneNumber;
    }
}