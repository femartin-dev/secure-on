package com.secureon.common.model.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.secureon.common.model.converter.OffsetDateTimeConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "secure_on_utils", name = "sesiones")
@Getter
@Setter
public class Sesion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "sesion_id")
    private UUID sesionId;

    @Column(name = "fecha_login")
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime fechaLogin;

    @Column(name = "token_restablecimiento", length = 255)
    private String tokenRestablecimiento; 

    @Column(name = "expiracion_token")
    @Convert(converter = OffsetDateTimeConverter.class)
    private OffsetDateTime expiracionToken;

    @Column(name = "mfa_habilitado")
    private Boolean mfaHabilitado = false;

    @Column(name = "mfa_secreto")
    private String mfaSecreto;

}
