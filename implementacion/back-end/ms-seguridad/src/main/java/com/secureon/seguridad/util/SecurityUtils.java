package com.secureon.seguridad.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.secureon.seguridad.exeptions.UnauthorizedException;

public class SecurityUtils {

    @Autowired
    private static MessagesService messageService;

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        throw new UnauthorizedException(messageService.getMessage("err.user.not-auth"));
    }
}
