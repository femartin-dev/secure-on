package com.secureon.seguridad.util;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.secureon.seguridad.exeptions.UnauthorizedException;

public class SecurityUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Autowired
    private static MessagesService messageService;

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        throw new UnauthorizedException(messageService.getMessage("err.user.not-auth"));
    }

    public static String generateVerificationCode6Digits() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}
