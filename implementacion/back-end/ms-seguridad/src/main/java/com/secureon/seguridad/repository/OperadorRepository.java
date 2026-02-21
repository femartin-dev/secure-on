package com.secureon.seguridad.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.seguridad.model.entity.Operador;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, UUID> {
    Optional<Operador> findByEmail(String email);
    Optional<Operador> findByUsuario(String usuario);
    Optional<Operador> findByLegajo(Integer legajo);
    boolean existsByEmail(String email);
    boolean existsByUsuario(String usuario);
    boolean existsByLegajo(Integer legajo);
}
