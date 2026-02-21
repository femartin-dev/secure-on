package com.secureon.cdmcontrol.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.secureon.cdmcontrol.model.entity.Autoridad;

import java.util.List;
import java.util.UUID;

@Repository
public interface AutoridadRepository extends JpaRepository<Autoridad, UUID> {
    // Búsqueda de autoridades cercanas (usando PostGIS)
    @Query(value = "SELECT * FROM secure_on_cdmso.autoridades a WHERE ST_DWithin(a.ubicacion_autoridad, :point, :radio) AND a.habilitada = true", nativeQuery = true)
    List<Autoridad> findAutoridadesCercanas(@Param("point") String pointWkt, @Param("radio") double radio);
}
