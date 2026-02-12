package com.securitasgroup.secureon.model.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(schema = "secure_on_cdmso", name = "sesiones_cdm")
@Getter
@Setter
public class SesionCdm {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "sesion_cdm_id")
    private UUID sesionCdmId;

    @OneToOne
    @JoinColumn(name = "sesion_id", nullable = false)
    private Sesion sesion;

    @ManyToOne
    @JoinColumn(name = "operador_id", nullable = false)
    private OperadorCdm operador;
}
