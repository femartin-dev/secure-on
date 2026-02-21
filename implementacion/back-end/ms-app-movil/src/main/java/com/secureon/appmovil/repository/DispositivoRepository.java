package com.secureon.appmovil.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Dispositivo;

@Repository
public interface DispositivoRepository extends JpaRepository<Dispositivo, UUID>{
    Optional<Dispositivo> findById(UUID id);
}
