package com.secureon.appmovil.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.common.model.entity.Alarma;
import com.secureon.common.model.entity.AlarmaContacto;
import com.secureon.common.model.entity.CanalNotificacion;
import com.secureon.common.model.entity.Contacto;

import java.util.List;


@Repository
public interface AlarmaContactoRespository extends JpaRepository<AlarmaContacto, UUID>{
    List<AlarmaContacto> findByAlarmaAndContactoOrderByFechaEnvioDesc(Alarma alarma, Contacto contacto);
    List<AlarmaContacto> findByAlarmaAndContacto(Alarma alarma, Contacto contacto);
    List<AlarmaContacto> findByAlarmaAndCanalNotificacion(Alarma alarma, CanalNotificacion canalNotificacion);
    boolean existsByAlarmaAndContactoAndCanalNotificacion(Alarma alarma, Contacto contacto, CanalNotificacion canalNotificacion);
}
