package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Cuestionario;

@Repository
public interface CuestionarioRepository extends JpaRepository<Cuestionario, UUID> {
    Optional<Cuestionario> findByAlarmaId(UUID alarmaId);

    @Query("SELECT c FROM Cuestionario c WHERE c.alarma.usuario.id = :usuarioId")
    List<Cuestionario> findByUsuarioId(UUID usuarioId);

}
