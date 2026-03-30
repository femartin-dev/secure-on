package com.secureon.cdmcontrol.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.Ubicacion;

import java.util.List;
import java.util.UUID;
@Repository
public interface UbicacionRepository extends JpaRepository<Ubicacion, UUID> {
    List<Ubicacion> findByAlarmaOrderByFechaTomaAsc(Alarma alarma);
}
