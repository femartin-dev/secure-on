package com.secureon.common.util;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MailUtils {

    private final JavaMailSender mailSender;

    private final String defaultFrom;

    public MailUtils(ObjectProvider<JavaMailSender> mailSenderProvider,
                    @Value("${spring.mail.username:}") String defaultFrom) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.defaultFrom = defaultFrom;
    }

    public void sendTextMail(String to, String subject, String body) {
        sendMail(defaultFrom, to, subject, body, false, null, null, null);
    }

    public void sendHtmlMail(String to, String subject, String body) {
        sendMail(defaultFrom, to, subject, body, true, null, null, null);
    }

    public void sendMail(String from, String to, String subject, String body, boolean html, 
                        String cc, String bcc, Map<String, InputStreamSource> attachments) {
        requireMailSender();

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            boolean multipart = attachments != null && !attachments.isEmpty();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, multipart, StandardCharsets.UTF_8.name());
            if (StringUtils.hasText(from)) {
                helper.setFrom(from);
            }
            String[] toRecipients = parseRecipients(to);
            if (toRecipients.length == 0) {
                throw new IllegalArgumentException("Debe indicar al menos un destinatario en to");
            }

            helper.setTo(toRecipients);

            String[] ccRecipients = parseRecipients(cc);
            if (ccRecipients.length > 0) {
                helper.setCc(ccRecipients);
            }

            String[] bccRecipients = parseRecipients(bcc);
            if (bccRecipients.length > 0) {
                helper.setBcc(bccRecipients);
            }

            helper.setSubject(subject);
            helper.setText(body, html);

            if (attachments != null) {
                for (Map.Entry<String, InputStreamSource> attachment : attachments.entrySet()) {
                    String attachmentName = attachment.getKey();
                    InputStreamSource attachmentContent = attachment.getValue();
                    if (StringUtils.hasText(attachmentName) && attachmentContent != null) {
                        helper.addAttachment(attachmentName, attachmentContent);
                    }
                }
            }

            mailSender.send(mimeMessage);
            log.info("Mail enviado a {}", to);
        } catch (MessagingException ex) {
            throw new IllegalStateException("No se pudo preparar el mail a enviar", ex);
        }
    }

    private String[] parseRecipients(String recipients) {
        if (!StringUtils.hasText(recipients)) {
            return new String[0];
        }

        return Arrays.stream(recipients.split("[,;]"))
            .map(String::trim)
            .filter(StringUtils::hasText)
            .toArray(String[]::new);
    }

    private void requireMailSender() {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender no esta configurado en la aplicacion");
        }
    }
}