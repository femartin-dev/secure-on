package com.secureon.seguridad.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envía código de verificación simple
     */
    public void enviarMail(String destinatario, String codigo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(destinatario);
            mensaje.setSubject("Código de verificación Secure-On");
            mensaje.setText("Tu código de verificación es: " + codigo);
            mailSender.send(mensaje);
            logger.info("Correo de verificación enviado a: {}", destinatario);
        } catch (Exception e) {
            logger.error("Error al enviar correo de verificación a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar correo", e);
        }
    }

    /**
     * Envía correo HTML con código de verificación
     */
    public void enviarMailHTML(String destinatario, String codigo) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setTo(destinatario);
            helper.setSubject("Código de verificación Secure-On");
            
            String htmlContent = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<div style=\"background-color: #f8f9fa; padding: 20px; border-radius: 5px;\">" +
                "<h2 style=\"color: #333;\">Verificación de Correo</h2>" +
                "<p>Tu código de verificación es:</p>" +
                "<div style=\"background-color: #007bff; color: white; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px;\">" +
                "%s" +
                "</div>" +
                "<p style=\"color: #666; margin-top: 20px;\">Este código expirará en 10 minutos.</p>" +
                "<p style=\"color: #666;\">Si no solicitaste este código, ignora este correo.</p>" +
                "</div>" +
                "</body></html>",
                codigo
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(mensaje);
            logger.info("Correo HTML de verificación enviado a: {}", destinatario);
        } catch (MessagingException e) {
            logger.error("Error al enviar correo HTML a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar correo HTML", e);
        }
    }

    /**
     * Envía notificación de bienvenida
     */
    public void enviarMailBienvenida(String destinatario, String nombreUsuario) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setTo(destinatario);
            helper.setSubject("¡Bienvenido a Secure-On!");
            
            String htmlContent = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<h2>¡Bienvenido a Secure-On!</h2>" +
                "<p>Hola %s,</p>" +
                "<p>Tu cuenta ha sido creada exitosamente.</p>" +
                "<p>Ya puedes acceder a la plataforma con tus credenciales.</p>" +
                "<br><p>Saludos,<br>Equipo Secure-On</p>" +
                "</body></html>",
                nombreUsuario
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(mensaje);
            logger.info("Correo de bienvenida enviado a: {}", destinatario);
        } catch (MessagingException e) {
            logger.error("Error al enviar correo de bienvenida a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar correo", e);
        }
    }

    /**
     * Envía correo de reseteo de contraseña
     */
    public void enviarMailResetPassword(String destinatario, String resetLink) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setTo(destinatario);
            helper.setSubject("Reseteo de Contraseña - Secure-On");
            
            String htmlContent = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<h2>Solicitud de Reseteo de Contraseña</h2>" +
                "<p>Recibimos una solicitud para resetear tu contraseña.</p>" +
                "<p><a href=\"%s\" style=\"background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Resetear Contraseña</a></p>" +
                "<p style=\"color: #666;\">Este enlace expirará en 1 hora.</p>" +
                "<p style=\"color: #666;\">Si no solicitaste esto, ignora este correo.</p>" +
                "</body></html>",
                resetLink
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(mensaje);
            logger.info("Correo de reseteo enviado a: {}", destinatario);
        } catch (MessagingException e) {
            logger.error("Error al enviar correo de reseteo a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar correo", e);
        }
    }

    /**
     * Envía alerta de seguridad
     */
    public void enviarMailAlertaSeguridad(String destinatario, String mensaje) {
        try {
            MimeMessage email = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(email, true, "UTF-8");
            
            helper.setTo(destinatario);
            helper.setSubject("⚠️ Alerta de Seguridad - Secure-On");
            
            String htmlContent = String.format(
                "<html><body style=\"font-family: Arial, sans-serif;\">" +
                "<h2 style=\"color: #dc3545;\">Alerta de Seguridad</h2>" +
                "<p>Se ha detectado una actividad importante en tu cuenta:</p>" +
                "<div style=\"background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; border-radius: 5px;\">" +
                "<p>%s</p>" +
                "</div>" +
                "<p style=\"color: #666;\">Si no reconoces esta actividad, contacta al soporte inmediatamente.</p>" +
                "</body></html>",
                mensaje
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(email);
            logger.info("Alerta de seguridad enviada a: {}", destinatario);
        } catch (MessagingException e) {
            logger.error("Error al enviar alerta de seguridad a {}: {}", destinatario, e.getMessage());
            throw new RuntimeException("Error al enviar correo", e);
        }
    }
}