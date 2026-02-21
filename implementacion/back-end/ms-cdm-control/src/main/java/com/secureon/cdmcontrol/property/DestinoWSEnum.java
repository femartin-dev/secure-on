package com.secureon.cdmcontrol.property;

import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public enum DestinoWSEnum {
    // Topics - Alarma
    TOPIC_ALARMA_NUEVA("topics", "alarma","nueva"),
    TOPIC_ALARMA_CAMBIO_ESTADO("topics", "alarma", "cambio-estado"),
    TOPIC_ALARMA_REACTIVACION("topics", "alarma", "reactivacion"),
    TOPIC_ALARMA_FINALIZACION("topics", "alarma", "finalizacion"),
    TOPIC_ALARMA_ASIGNACION("topics", "alarma", "asignacion"),
    
    // Topics - Ubicación
    TOPIC_UBICACION_REALTIME("topics", "ubicacion", "realtime"),
    TOPIC_UBICACION_HISTORIAL("topics", "ubicacion", "historial"),
    
    // Topics - Operador
    TOPIC_OPERADOR_ESTADO("topics", "operador", "estado"),
    TOPIC_OPERADOR_ASIGNACION("topics", "operador", "asignacion"),
    
    // Topics - Sistema
    TOPIC_SISTEMA_SALUD("topics", "sistema", "salud"),
    TOPIC_SISTEMA_ALERTAS("topics", "sistema", "alertas"),
    
    // Queues - Usuario
    QUEUE_USUARIO_NOTIFICACIONES("queues", "usuario", "notificaciones"),
    QUEUE_USUARIO_ALERTAS("queues", "usuario", "alertas"),
    
    // Queues - Operador
    QUEUE_OPERADOR_TAREAS("queues", "operador", "tareas"),
    QUEUE_OPERADOR_ASIGNACIONES("queues", "operador", "asignaciones"),
    
    // Queues - CDM
    QUEUE_CDM_CONTROL("queues", "cdm", "control"),
    QUEUE_CDM_AUDITORIA("queues", "cdm", "auditoria");

    private final String[] propNames;
    private static DestinoWSProperty properties;
    private String cachedPath; 

    private DestinoWSEnum(String propName) {
        this.propNames = propName.split(".");
    }

    private DestinoWSEnum(String... propName) {
        this.propNames = propName;
    }

    public String getPropertyName(int nivel) {
        return this.propNames[nivel];
    }

    public int getPropertyLength() {
        return this.propNames.length;
    }
    
    public static void init(DestinoWSProperty props) {
        properties = props;
        for (DestinoWSEnum destino : values()) {
            destino.loadPath();
        }
        log.info("Enum inicializado");
    }

    private void loadPath() {
        if (properties == null) {
            log.warn("properties es null para {}", this.name());
            this.cachedPath = null;
            return;
        }
        
        if (propNames.length == 0) {
            log.warn("propNames vacío para {}", this.name());
            this.cachedPath = null;
            return;
        }
        
        log.debug("Cargando {} con path: {}", this.name(), String.join(".", propNames));
        
        try {
            Object current = properties;
            
            for (int i = 0; i < propNames.length; i++) {
                String nivel = propNames[i];
                log.debug("  Nivel {}: '{}' - current es: {}", i, nivel, 
                    current != null ? current.getClass().getSimpleName() : "null");
                
                if (current instanceof DestinoWSProperty destProps) {
                    if ("topics".equals(nivel)) {
                        current = destProps.getTopics();
                        log.debug("  Accediendo a topics");
                    } else if ("queues".equals(nivel)) {
                        current = destProps.getQueues();
                        log.debug("  Accediendo a queues");
                    } else {
                        log.error("  Nivel raíz inválido: {}", nivel);
                        this.cachedPath = null;
                        return;
                    }
                } 
                else if (current instanceof Map<?, ?> map) {
                    log.debug("    Map contiene claves: {}", map.keySet());
                    
                    if (!map.containsKey(nivel)) {
                        log.warn("  No existe clave '{}' en el mapa", nivel);
                        log.debug(" Claves disponibles: {}", map.keySet());
                        this.cachedPath = null;
                        return;
                    }
                    
                    if (i == propNames.length - 1) {
                        Object value = map.get(nivel);
                        if (value instanceof String stringValue) {
                            this.cachedPath = stringValue;
                            log.debug("    ✓ Path encontrado: {}", this.cachedPath);
                        } else {
                            log.warn("    ✗ Valor no es String: {}", 
                                value != null ? value.getClass() : "null");
                            this.cachedPath = null;
                        }
                    } else {
                        current = map.get(nivel);
                        log.debug("    → Avanzando al siguiente nivel");
                    }
                } else {
                    log.error("    ✗ Tipo inesperado: {}", 
                        current != null ? current.getClass() : "null");
                    this.cachedPath = null;
                    return;
                }
            }
            
        } catch (Exception e) {
            log.error("Error en loadPath para {}: {}", this.name(), e.getMessage(), e);
            this.cachedPath = null;
        }
    }

    public String getPath() {
        if (cachedPath == null && properties != null) {
            loadPath();
        }
        return cachedPath;
    }

    public String getFullPropertyKey() {
        return String.join(".", propNames);
    }

    public boolean isTopic() {
        return propNames.length > 0 && "topics".equals(propNames[0]);
    }
    
    public boolean isQueue() {
        return propNames.length > 0 && "queues".equals(propNames[0]);
    }
    
    @Override
    public String toString() {
        return String.format("%s[%s -> %s]", 
            this.name(),  getFullPropertyKey(), 
            cachedPath != null ? cachedPath : "NO CARGADO"
        );
    }
}
