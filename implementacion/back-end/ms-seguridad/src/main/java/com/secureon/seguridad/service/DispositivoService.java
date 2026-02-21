package com.secureon.seguridad.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.secureon.seguridad.dto.request.RegistrarDispositivoRequest;
import com.secureon.seguridad.exeptions.ResourceNotFoundException;
import com.secureon.seguridad.model.entity.Dispositivo;
import com.secureon.seguridad.model.entity.Usuario;
import com.secureon.seguridad.repository.DispositivoRepository;
import com.secureon.seguridad.repository.UsuarioRepository;
import com.secureon.seguridad.util.MessagesService;

import jakarta.transaction.Transactional;

@Service
public class DispositivoService {
    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MessagesService messageService;

    @Transactional
    public Dispositivo registrar(RegistrarDispositivoRequest request) {
        Usuario usuario = getUsuarioPorId(request.getUsuarioId());
        Optional<Dispositivo> existente = dispositivoRepository
            .findByUsuarioAndDispositivoAppId(usuario, request.getDispositivoAppId());
        
        if (existente.isPresent()) {
            Dispositivo dispositivo = existente.get();
            // Actualizar datos del dispositivo
            dispositivo.setNumero(request.getNumero());
            dispositivo.setFabricante(request.getFabricante());
            dispositivo.setModelo(request.getModelo());
            dispositivo.setPlataforma(request.getPlataforma());
            dispositivo.setSistemaOperativo(request.getSistemaOperativo());
            dispositivo.setVersionDelSO(request.getVersionDelSO());
            dispositivo.setZonaHoraria(request.getZonaHoraria());
            dispositivo.setIdiomaId(request.getIdiomaId());
            dispositivo.setEsPrincipal(request.getEsPrincipal());
            dispositivo.setEstaActivo(true);
            return dispositivoRepository.save(dispositivo);
        } else {
            boolean esPrincipal = dispositivoRepository.findByUsuarioAndEstaActivoTrue(usuario).stream().count() == 0;
            Dispositivo nuevo = new Dispositivo();
            nuevo.setUsuario(usuario);
            nuevo.setDispositivoAppId(request.getDispositivoAppId());
            nuevo.setNumero(request.getNumero());
            nuevo.setFabricante(request.getFabricante());
            nuevo.setModelo(request.getModelo());
            nuevo.setPlataforma(request.getPlataforma());
            nuevo.setSistemaOperativo(request.getSistemaOperativo());
            nuevo.setVersionDelSO(request.getVersionDelSO());
            nuevo.setZonaHoraria(request.getZonaHoraria());
            nuevo.setIdiomaId(request.getIdiomaId());
            nuevo.setEsPrincipal(esPrincipal); // Se puede marcar como principal si es el primero
            return dispositivoRepository.save(nuevo);
        }
    }

    public Dispositivo obtenerPorAppId(Usuario usuario, UUID dispositivoAppId) {
        return dispositivoRepository.findByUsuarioAndDispositivoAppId(usuario, dispositivoAppId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.device.not-found")));
    }

    public Dispositivo obtenerPorNumero(Usuario usuario, String nroTelefono) {
        return dispositivoRepository.findByUsuarioAndNumero(usuario, nroTelefono)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.device.not-found")));
    }

    public Dispositivo obtenerPorNumero(UUID usuarioId, String nroTelefono) {
        Usuario usuario = getUsuarioPorId(usuarioId);
        return dispositivoRepository.findByUsuarioAndNumero(usuario, nroTelefono)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.device.not-found")));
    }

    private Usuario getUsuarioPorId(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.user.not-found.id")));
    }
}
