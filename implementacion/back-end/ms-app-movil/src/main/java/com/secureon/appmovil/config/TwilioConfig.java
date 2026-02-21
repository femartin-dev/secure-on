package com.secureon.appmovil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.twilio.Twilio;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class TwilioConfig {

    @Value("${thirdparty.twilio.account-sid}")
    private String accountSid;

    @Value("${thirdparty.twilio.auth-token}")
    private String authToken;

    @Getter
    @Value("${thirdparty.twilio.sms-from-number}")
    private String fromNumber;

    @Getter
    @Value("${thirdparty.twilio.whatsapp-from-number}")
    private String whatsappFromNumber;

    @Getter
    @Value("${thirdparty.twilio.alphanumeric-sender}")
    private String alphanumericSender;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(
            accountSid,
            authToken
        );
        log.info("Twilio SDK initialized with Account SID: {}", accountSid);
    }
}
