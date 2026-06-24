package com.secureon.appmovil.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.MotivoActivacion;

@Repository
public interface MotivoActivacionRepository extends JpaRepository<MotivoActivacion, Integer>{
    Optional<MotivoActivacion> findById(Integer id);
    List<MotivoActivacion> findByHabilitadaTrue();
}
