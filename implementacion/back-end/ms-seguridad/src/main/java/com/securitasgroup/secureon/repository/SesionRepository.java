package com.securitasgroup.secureon.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.securitasgroup.secureon.model.entity.Sesion;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, UUID> {
    Optional<Sesion> findByTokenRestablecimiento(String token);
    Optional<Sesion> findBySesionId(UUID sesionId);
}
