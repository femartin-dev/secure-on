package com.secureon.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import com.twilio.Twilio;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Getter
@Setter
@Slf4j
@PropertySource(value = "classpath:global-props.yml", factory = YamlPropertySourceFactory.class)
@ConfigurationProperties(prefix = "third-party.twilio")
@ConditionalOnProperty(prefix = "third-party.twilio", name = {"account-sid", "auth-token", "sms-from-number"})
public class TwilioConfig {

    private String accountSid;

    private String authToken;

    private String smsFromNumber;

    private String whatsappFromNumber;

    private String alphanumericSender;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        log.info("Twilio SDK initialized with Account SID: {}", accountSid);
    }

    public String getFromNumber() {
        return smsFromNumber;
    }
}