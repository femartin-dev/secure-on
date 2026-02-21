package com.secureon.cdmcontrol.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.secureon.cdmcontrol.model.entity.Alarma;
import com.secureon.cdmcontrol.model.entity.AlarmaOperador;
import com.secureon.cdmcontrol.model.entity.EstadoAlarma;
import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;
import com.secureon.cdmcontrol.model.entity.Operador;
import com.secureon.cdmcontrol.model.entity.PrioridadAlarma;
import com.secureon.cdmcontrol.repository.AlarmaOperadorRepository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AsignacionService {

    @Autowired
    private OperadorService operadorService;

    @Autowired
    private AlarmaOperadorRepository alarmaOperadorRepository;

    @Autowired
    private PrioridadService prioridadService;

    @Autowired
    private CatalogoService catalogoService;

    @Autowired
    private AlarmaService alarmaService;

    public Page<AlarmaOperador> listarAlarmas(Integer estadoAlarmaId, Integer prioridadId,
                                    OffsetDateTime fechaDesde, OffsetDateTime fechaHasta,
                                    UUID operadorId, Integer estadoAsigId, Pageable pageable) {
        Operador operador = operadorService.obtenerPorId(operadorId);
        EstadoAlarma estadoAlarma = catalogoService.getEstadoAlarma(estadoAlarmaId);
        EstadoAsignacion estadoAsignacion = catalogoService.getEstadoAsignacion(estadoAsigId);
        PrioridadAlarma prioridad = prioridadService.getPrioridadAlarma(prioridadId);
        return alarmaOperadorRepository.buscarConFiltros(estadoAlarma, prioridad, 
                                                        fechaDesde, fechaHasta, operador, 
                                                        estadoAsignacion, pageable);
    }

    // Asignación automática: selecciona un operador disponible
    @Transactional
    public AlarmaOperador asignarAlarma(Alarma alarma) {
        List<Operador> operadores = operadorService.listarOperadoresActivos();
        List<Operador> seleccionados = new ArrayList<>();
        int valorCarga = 10; //valorCargaMaximo
        for (Operador op : operadores) {
            List<AlarmaOperador> activas = alarmaOperadorRepository.findAlarmasActivasByOperador(op);
            int valoracion = getValoracionCargaTrabajo(activas, prioridadService.getPrioridadAlarma(1))
                            + getValoracionCargaTrabajo(activas, prioridadService.getPrioridadAlarma(2))
                            + getValoracionCargaTrabajo(activas, prioridadService.getPrioridadAlarma(3));


            // Se puede filtrar por prioridad de las alertas activas (ej: si son de baja prioridad, puede tomar más)
            if (valoracion < valorCarga) {
                valorCarga = valoracion;
                seleccionados.clear();
                seleccionados.add(op);
            } else if (valoracion == valorCarga) {
                seleccionados.add(op);
            }
        }
        if (seleccionados.isEmpty()) {
            throw new RuntimeException("No hay operadores disponibles");
        }
        List<AlarmaOperador> cerrarAOs = alarmaOperadorRepository.findByAlarma(alarma).stream()
            .filter(ao -> ao.getOperador() == null || seleccionados.contains(ao.getOperador()))
            .collect(Collectors.toList());
        cerrarAOs.stream().filter(ao -> seleccionados.contains(ao.getOperador()))
                    .map(ao -> ao.getOperador()).findFirst()
                    .ifPresent(o -> seleccionados.remove(o));
        cerrarAOs.stream().forEach(this::cerrarAsignacionAlarma);
        Operador operador = seleccionados.stream().findAny().orElse(null);
        Integer estadoId = operador != null ? 2 : 1;
        Optional<AlarmaOperador> existe = cerrarAOs.stream()
                    .filter(ao -> ao.getOperador() == null).findFirst();
        AlarmaOperador asignacion;
        if (existe.isPresent()) {
            asignacion = this.editarEstadoAsignacion(existe.get(), operador, true);
        } else {
            asignacion = this.crearAsignacion(alarma, operador, estadoId, true);
        }
        return alarmaOperadorRepository.save(asignacion);
    }

    @Transactional
    private void cerrarAsignacionAlarma(AlarmaOperador ao) {
        if (ao.getOperador() == null || ao.getEstadoAsignacion().equals(catalogoService.getEstadoAsignacion(1))) {
            ao.setOperador(null);
            ao.setEstadoAsignacion(catalogoService.getEstadoAsignacion(1)); //a nuevo
            alarmaOperadorRepository.save(ao);
        } else {
            ao.setEstadoAsignacion(catalogoService.getEstadoAsignacion(6)); //a nuevo
            alarmaOperadorRepository.save(ao);
        } 
    }

    @Transactional
    public AlarmaOperador reasignarAlarma(Alarma alarma, Operador operador) {
        List<AlarmaOperador> cerrarAOs = alarmaOperadorRepository.findByAlarma(alarma).stream()
            .filter(ao -> ao.getOperador() != null && operador.equals(ao.getOperador()))
            .collect(Collectors.toList());
        cerrarAOs.forEach(this::cerrarAsignacionAlarma);
        AlarmaOperador newAO = crearAsignacion(alarma, operador, 2,false);
        return alarmaOperadorRepository.save(newAO);
    }

    @Transactional
    public AlarmaOperador reasignarAlarma(UUID alarmaId, UUID operadorId) {
        Alarma alarma = alarmaService.obtenerAlarma(alarmaId)
                    .orElseThrow(() -> new RuntimeException("Alarma no encontrada"));
        Operador operador = operadorService.obtenerPorId(operadorId);
        return reasignarAlarma(alarma, operador);
    }


    private AlarmaOperador crearAsignacion(Alarma alarma, Operador operador, 
                                        Integer estadoId, boolean esAuto) {
        AlarmaOperador asignacion = new AlarmaOperador();
        asignacion.setAlarma(alarma);
        asignacion.setOperador(operador);
        asignacion.setEsAsignacionAuto(esAuto);
        asignacion.setEstadoAsignacion(catalogoService.getEstadoAsignacion(estadoId)); 
        return  asignacion;
    }

    private AlarmaOperador editarEstadoAsignacion(AlarmaOperador ao, Operador operador, boolean isAuto) {
        return editarEstadoAsignacion(ao, operador, 2, null, isAuto, null);                                       
    }

    private AlarmaOperador editarEstadoAsignacion(AlarmaOperador ao, Operador operador,
                                                Integer estadoId, Boolean falsaAlarma, 
                                                Boolean isAuto, String observaciones) {
        if (ao.getEstadoAsignacion().equals(catalogoService.getEstadoAsignacion(1))) {
            ao.setOperador(operador);
        }
        ao.setEstadoAsignacion(catalogoService.getEstadoAsignacion(estadoId)); //Reasignada
        ao.setFechaVerificacion(OffsetDateTime.now());
        ao.setObservacionesVerificacion(observaciones);
        ao.setFalsaAlarma(falsaAlarma);
        ao.setEsAsignacionAuto(isAuto);
        return ao;
    }



    private int getValoracionCargaTrabajo(List<AlarmaOperador> alarmasOperador, PrioridadAlarma prioridad) {
        if (alarmasOperador == null || alarmasOperador.isEmpty())
            return 0;
        Long result = alarmasOperador.stream()
                                    .filter(a -> prioridad.equals(a.getAlarma().getPrioridad()))
                                    .count();
        return result.intValue() * prioridad.getValoracion();
    }


}
