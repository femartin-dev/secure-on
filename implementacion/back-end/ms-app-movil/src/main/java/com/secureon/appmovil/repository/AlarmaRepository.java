package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.Usuario;

@Repository
public interface AlarmaRepository extends JpaRepository<Alarma, UUID> {

    Optional<Alarma> findByIdAndEstadoAlarma(UUID id, EstadoAlarma estado);

    List<Alarma> findByUsuarioAndEstadoAlarma(Usuario usuario, EstadoAlarma estado);
}