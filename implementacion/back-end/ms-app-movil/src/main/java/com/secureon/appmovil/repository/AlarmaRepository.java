package com.secureon.appmovil.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.model.entity.Usuario;

@Repository
public interface AlarmaRepository extends JpaRepository<Alarma, UUID> {

    Optional<Alarma> findByIdAndEstadoAlarma(UUID id, EstadoAlarma estado);

    List<Alarma> findByUsuarioAndEstadoAlarma(Usuario usuario, EstadoAlarma estado);

    List<Alarma> findByUsuarioIdAndDispositivoIdAndEstadoAlarma(UUID usuarioId, UUID dispositivoId, EstadoAlarma estado);

    @Query("SELECT a FROM Alarma a WHERE a.usuario.id = :usuario AND " +
            "(:estado IS NULL OR a.estadoAlarma = :estado) AND " +
            "(:prioridad IS NULL OR a.prioridad = :prioridad) AND " +
            "(:fechaDesde IS NULL OR a.fechaActivacion >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR a.fechaActivacion <= :fechaHasta)")
    List<Alarma> buscarConFiltros(@Param("usuario") Usuario usuario,
                                    @Param("estado") EstadoAlarma estado,
                                    @Param("prioridad") PrioridadAlarma prioridad,
                                    @Param("fechaDesde") OffsetDateTime fechaDesde,
                                    @Param("fechaHasta") OffsetDateTime fechaHasta);
    Optional<Alarma> findById(UUID alarmaId);
}