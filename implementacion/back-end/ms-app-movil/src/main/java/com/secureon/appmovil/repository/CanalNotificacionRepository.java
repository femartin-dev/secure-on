package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.CanalNotificacion;

@Repository
public interface CanalNotificacionRepository extends JpaRepository<CanalNotificacion, Integer> {
    Optional<CanalNotificacion> findById(Integer id);

    Optional<CanalNotificacion> findByDescripcion(String id);

    List<CanalNotificacion> findByHabilitadaTrue();
}
