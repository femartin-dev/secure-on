package com.secureon.cdmcontrol.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.secureon.cdmcontrol.model.entity.EstadoAsignacion;
import com.secureon.cdmcontrol.model.entity.TipoAutoridad;

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

    private List<EstadoAsignacion> estadosAsignacion;
    private List<TipoAutoridad> tiposAutoridad;

}
