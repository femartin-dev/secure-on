package com.secureon.seguridad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Operador;
import com.secureon.common.model.entity.Sesion;
import com.secureon.common.model.entity.SesionCdm;

@Repository
public interface SesionCdmRepository extends JpaRepository<SesionCdm, UUID> {
    Optional<SesionCdm> findBySesionTokenRestablecimiento(String token);
    Optional<SesionCdm> findBySesion(Sesion sesion);
    void deleteByOperador(Operador operador);
    void deleteBySesion(Sesion sesion);
    void deleteByOperadorAndSesion(Operador operador, Sesion sesion);
}