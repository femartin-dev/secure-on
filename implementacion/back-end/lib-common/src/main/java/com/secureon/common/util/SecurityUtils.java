package com.secureon.common.util;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.secureon.common.exception.UnauthorizedException;

public class SecurityUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int VERIFICATION_CODE_LENGTH = 6;

    @Autowired
    private static MessagesService messageService;

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        throw new UnauthorizedException(messageService.getMessage("err.user.not-auth"));
    }

    public static String generateVerificationCode() {
        return generateNumericCode(VERIFICATION_CODE_LENGTH);
    }

    public static String generateVerificationCode6Digits() {
        return generateVerificationCode();
    }

    public static String generateEmailVerificationCode() {
        return generateVerificationCode();
    }

    public static String generateDeviceVerificationCode() {
        return generateVerificationCode();
    }

    private static String generateNumericCode(int digits) {
        int upperBound = (int) Math.pow(10, digits);
        return String.format("%0" + digits + "d", SECURE_RANDOM.nextInt(upperBound));
    }
}
