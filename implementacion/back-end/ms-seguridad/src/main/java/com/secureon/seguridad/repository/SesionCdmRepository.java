package com.secureon.seguridad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.seguridad.model.entity.Operador;
import com.secureon.seguridad.model.entity.Sesion;
import com.secureon.seguridad.model.entity.SesionCdm;

@Repository
public interface SesionCdmRepository extends JpaRepository<SesionCdm, UUID> {
    Optional<SesionCdm> findBySesionTokenRestablecimiento(String token);
    void deleteByOperador(Operador operador);
    void deleteBySesion(Sesion sesion);
    void deleteByOperadorAndSesion(Operador operador, Sesion sesion);
}