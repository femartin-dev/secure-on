package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Alarma;
import com.secureon.appmovil.model.entity.Ubicacion;

@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, UUID> {
    Optional<Ubicacion> findById(UUID id);

    List<Ubicacion> findByAlarma(Alarma alarma);
}