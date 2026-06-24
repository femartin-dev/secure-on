package com.secureon.appmovil.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.common.model.entity.CanalNotificacion;
import com.secureon.common.model.entity.EstadoAlarma;
import com.secureon.common.model.entity.EstadoEnvio;
import com.secureon.common.model.entity.EstadoSalud;
import com.secureon.common.model.entity.Idioma;
import com.secureon.common.model.entity.MetodoActivacion;
import com.secureon.common.model.entity.MetodoUbicacion;
import com.secureon.common.model.entity.MotivoActivacion;
import com.secureon.common.model.entity.PrioridadAlarma;
import com.secureon.common.model.entity.TipoEvidencia;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Getter
@Setter
public class CatalogoResponse {

    private List<EstadoAlarma> estadosAlarma;
    private List<MetodoUbicacion> metodosUbicacion;
    private List<MetodoActivacion> metodosActivacion;
    private List<Idioma> idiomas;
    private List<PrioridadAlarma> prioridades;
    private List<CanalNotificacion> canalesNotificacion;
    private List<EstadoEnvio> estadosEnvio;
    private List<MotivoActivacion> motivosActivacion;
    private List<TipoEvidencia> tipoEvidencias;
    private List<EstadoSalud> estadosSalud;

}
