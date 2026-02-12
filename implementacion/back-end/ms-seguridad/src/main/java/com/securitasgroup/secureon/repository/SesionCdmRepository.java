package com.securitasgroup.secureon.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securitasgroup.secureon.model.entity.OperadorCdm;
import com.securitasgroup.secureon.model.entity.Sesion;
import com.securitasgroup.secureon.model.entity.SesionCdm;

@Repository
public interface SesionCdmRepository extends JpaRepository<SesionCdm, UUID> {
    Optional<SesionCdm> findBySesionTokenRestablecimiento(String token);
    void deleteByOperadorCdm(OperadorCdm operador);
    void deleteBySesion(Sesion sesion);
    void deleteByOperadorAndSesion(OperadorCdm operador, Sesion sesion);
}