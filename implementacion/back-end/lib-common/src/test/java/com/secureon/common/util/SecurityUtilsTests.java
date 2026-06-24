package com.secureon.common.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class SecurityUtilsTests {

    @Test
    void shouldGenerateSixDigitVerificationCode() {
        String code = SecurityUtils.generateVerificationCode();

        assertEquals(6, code.length());
        assertTrue(code.chars().allMatch(Character::isDigit));
    }

    @Test
    void shouldReuseSameGeneratorForEmailAndDeviceValidation() {
        assertEquals(6, SecurityUtils.generateEmailVerificationCode().length());
        assertEquals(6, SecurityUtils.generateDeviceVerificationCode().length());
    }
}