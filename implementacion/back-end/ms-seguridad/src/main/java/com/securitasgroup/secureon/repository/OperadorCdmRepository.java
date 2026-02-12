package com.securitasgroup.secureon.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securitasgroup.secureon.model.entity.OperadorCdm;

@Repository
public interface OperadorCdmRepository extends JpaRepository<OperadorCdm, UUID> {
    Optional<OperadorCdm> findByEmail(String email);
    Optional<OperadorCdm> findByUsuario(String usuario);
    Optional<OperadorCdm> findByLegajo(Integer legajo);
    boolean existsByEmail(String email);
    boolean existsByUsuario(String usuario);
    boolean existsByLegajo(Integer legajo);
}
