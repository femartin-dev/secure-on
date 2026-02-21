package com.secureon.appmovil.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.secureon.appmovil.model.entity.Contacto;
import com.secureon.appmovil.model.entity.Usuario;

@Repository
public interface ContactoRepository extends JpaRepository<Contacto, UUID> {

    List<Contacto> findByUsuario(Usuario usuario);

}