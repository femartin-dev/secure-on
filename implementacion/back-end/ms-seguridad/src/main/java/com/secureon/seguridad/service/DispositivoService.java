package com.secureon.seguridad.service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.secureon.common.exception.BadRequestException;
import com.secureon.common.exception.ResourceNotFoundException;
import com.secureon.common.model.entity.Dispositivo;
import com.secureon.common.model.entity.Idioma;
import com.secureon.common.model.entity.Usuario;
import com.secureon.common.util.MessagesService;

import com.secureon.seguridad.dto.request.RegistrarDispositivoRequest;
import com.secureon.seguridad.repository.DispositivoRepository;
import com.secureon.seguridad.repository.IdiomaRepository;
import com.secureon.seguridad.repository.UsuarioRepository;

import io.micrometer.common.util.StringUtils;
import jakarta.transaction.Transactional;

@Service
public class DispositivoService {
    @Autowired
    private DispositivoRepository dispositivoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IdiomaRepository idiomaRepository;

    @Autowired
    private MessagesService messageService;

    @Transactional
    public Dispositivo registrar(RegistrarDispositivoRequest request) {
        Usuario usuario = getUsuarioPorId(request.getUsuarioId());
        Optional<Dispositivo> existente = dispositivoRepository
            .findByUsuarioAndDispositivoAppId(usuario, request.getDispositivoAppId());
        boolean esPrincipal = false;
        Dispositivo dispositivo = null;
        if (existente.isPresent()) {
            esPrincipal = request.getEsPrincipal();
            dispositivo = existente.get();
        } else {
            esPrincipal = dispositivoRepository.findByUsuarioAndEstaActivoTrue(usuario).stream().count() == 0;
            dispositivo = new Dispositivo();
            dispositivo.setFechaCreacion(OffsetDateTime.now());
            dispositivo.setUsuario(usuario);
            dispositivo.setDispositivoAppId(request.getDispositivoAppId());
        }
        dispositivo.setNumero(request.getNumero());
        dispositivo.setFabricante(request.getFabricante());
        dispositivo.setModelo(request.getModelo());
        dispositivo.setPlataforma(request.getPlataforma());
        dispositivo.setSistemaOperativo(request.getSistemaOperativo());
        dispositivo.setVersionSO(request.getVersionDelSO());
        dispositivo.setZonaHoraria(request.getZonaHoraria());
        dispositivo.setIdioma(getIdiomaPorId(request.getIdiomaId()));
        dispositivo.setEsPrincipal(esPrincipal);
        dispositivo.setEstaActivo(false);
        Dispositivo savedDispositivo = dispositivoRepository.save(dispositivo);
        return savedDispositivo;
    }

    public Dispositivo getDispositivo(UUID dispositivoId) {
        return dispositivoRepository.findById(dispositivoId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.device.not-found")));
    }

    public Dispositivo obtenerPorAppId(Usuario usuario, String dispositivoAppId) {
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

    private Idioma getIdiomaPorId(String idiomaId) {
        idiomaId = StringUtils.isBlank(idiomaId) ? messageService.getMessage("user.default.language") : idiomaId;
        return idiomaRepository.findById(idiomaId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.getMessage("err.language.not-found")));
    }

    public void activarDispositivo(UUID dispositivoId) {
        Dispositivo dispositivo = getDispositivo(dispositivoId);
        if (dispositivo.getEstaActivo()) {
            throw new BadRequestException(messageService.getMessage("err.device.already-active"));
        }
        dispositivo.setEstaActivo(true);
        dispositivoRepository.save(dispositivo);
    }
}
