-- 1
-- Crear nuevo usuario
CREATE USER secure_on_admin WITH PASSWORD 'admin-123';
CREATE USER secure_on_movil_admin WITH PASSWORD 'admin-123';
CREATE USER secure_on_cdmso_admin WITH PASSWORD 'admin-123';
CREATE USER secure_on_utils_admin WITH PASSWORD 'admin-123';


-- Crear base de datos
CREATE DATABASE secure_on_db;

\c secure_on_db

-- Crear esquema (schema)
CREATE SCHEMA IF NOT EXISTS secure_on_movil;
CREATE SCHEMA IF NOT EXISTS secure_on_cdmso;
CREATE SCHEMA IF NOT EXISTS secure_on_utils;

-- Asignar permisos
GRANT CONNECT ON DATABASE secure_on_db TO secure_on_admin, secure_on_movil_admin, secure_on_cdmso_admin, secure_on_utils_admin;
GRANT ALL PRIVILEGES ON DATABASE secure_on TO secure_on_admin;
GRANT ALL ON SCHEMA secure_on_movil TO secure_on_movil_admin;
GRANT ALL ON SCHEMA secure_on_movil TO secure_on_admin;
GRANT ALL ON SCHEMA secure_on_cdmso TO secure_on_cdmso_admin;
GRANT ALL ON SCHEMA secure_on_cdmso TO secure_on_admin;
GRANT ALL ON SCHEMA secure_on_utils TO secure_on_utils_admin;
GRANT ALL ON SCHEMA secure_on_utils TO secure_on_admin;



-- Habilitar extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Para UUIDs
CREATE EXTENSION IF NOT EXISTS "postgis";   -- Para datos geográficos (opcional)

-- 2. Tablas del Sistema Central
-----------------------------------------------------------

-- 2.1 Tabla USUARIOS 
CREATE TABLE secure_on_movil.usuarios (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
	apellido VARCHAR(50) NOT NULL,
    direccion TEXT,
    hash_contrasena VARCHAR(255) NOT NULL,
    esta_activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE secure_on_movil.usuarios IS 'Usuarios registrados en la aplicacón móvil.';

-- 2.1.1. Tablas genericas de Utilidad 
CREATE TABLE secure_on_utils.estados_alerta (
    estado_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(20),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.estados_asignacion (
    estado_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.prioridades (
    prioridad_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(20),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.metodo_activacion (
    metodo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.motivo_activacion (
    motivo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.canal_notificacion (
    canal_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.estados_envio (
    estado_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.estados_fisicos (
    estado_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.idiomas (
    idioma_id VARCHAR(2) PRIMARY KEY,
	descripcion VARCHAR(20),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.metodos_ubicacion (
    metodo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.tipos_autoridades (
    tipo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.tipos_evidencias (
    tipo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.tipos_parametros (
    tipo_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.tablas_auditoria (
    tipo_id INTEGER PRIMARY KEY,
	nombre VARCHAR(50),
	esquema VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

CREATE TABLE secure_on_utils.accion_auditoria (
    accion_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(50),
    habilitada BOOLEAN DEFAULT TRUE
);

-- 2.2 Tabla DISPOSITIVOS
CREATE TABLE secure_on_movil.dispositivos (
    dispositivo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL
        REFERENCES secure_on_movil.usuarios(user_id) ON DELETE RESTRICT,
    dispositivo_app_id UUID NOT NULL,
    numero VARCHAR(20) NOT NULL,
	fabricante VARCHAR(50),
	modelo VARCHAR(50),
	plataforma VARCHAR(50),
	sistema_operativo VARCHAR(50),
	version_del_SO VARCHAR(50),
	zona_horaria VARCHAR(50),
	idioma_id VARCHAR(2) REFERENCES secure_on_utils.idiomas(idioma_id) ON DELETE SET NULL,
	es_principal BOOLEAN DEFAULT FALSE,
	esta_activo BOOLEAN DEFAULT TRUE,
	fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT unique_dispositivo_user UNIQUE(user_id, dispositivo_app_id)
);

COMMENT ON TABLE secure_on_movil.dispositivos IS 'Datos de los dispositivos registrados por parte de los usuarios.';
CREATE INDEX idx_dispositivos_usuario ON secure_on_movil.dispositivos(user_id);


-- 2.3 Tabla ALERTAS 
CREATE TABLE secure_on_movil.alertas (
    alerta_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES secure_on_movil.usuarios(user_id) ON DELETE RESTRICT,
	dispositivo_id UUID NOT NULL REFERENCES secure_on_movil.dispositivos(dispositivo_id) ON DELETE RESTRICT,
    -- Metodo de activación (UC-002, UC-003, UC-004, UC-005)
    metodo_act_id INTEGER REFERENCES secure_on_utils.metodo_activacion(metodo_id) ON DELETE SET NULL,
    fecha_activacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion TIMESTAMP WITH TIME ZONE,
    -- Estado del flujo
    estado_id INTEGER REFERENCES secure_on_utils.estados_alerta(estado_id) ON DELETE SET NULL,
    -- Prioridad asignada por operador (UC-030)
    prioridad_id INTEGER REFERENCES secure_on_utils.prioridades(prioridad_id) ON DELETE SET NULL,
    -- Ubicación inicial (capturada en UC-034)
    --ubicacion_inicial GEOGRAPHY(POINT, 4326),
    --precision_inicial INTEGER, -- metros
	asignacion_id INTEGER REFERENCES secure_on_utils.estados_asignacion(estado_id) ON DELETE SET NULL,
    -- Campos de resiliencia
    fue_reactivada BOOLEAN DEFAULT FALSE,
	cancelada_por_cdm BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_alertas_user ON secure_on_movil.alertas(user_id);
CREATE INDEX idx_alertas_dispositivo ON secure_on_movil.alertas(dispositivo_id);
CREATE INDEX idx_alertas_estado ON secure_on_movil.alertas(estado_id);
CREATE INDEX idx_alertas_fecha ON secure_on_movil.alertas(fecha_activacion);




-- 2.4 Tabla CONFIG_USUARIO 
CREATE TABLE secure_on_movil.configuracion_usuario (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE
        REFERENCES secure_on_movil.usuarios(user_id) ON DELETE RESTRICT,
	dispositivo_id UUID NOT NULL UNIQUE
        REFERENCES secure_on_movil.dispositivos(dispositivo_id) ON DELETE RESTRICT,	
	--General
	idioma_id VARCHAR(2) REFERENCES secure_on_utils.idiomas(idioma_id) ON DELETE SET NULL,
    -- PARÁMETROS DE ACTIVACIÓN
    frase_activacion_voz VARCHAR(100) DEFAULT 'SecureOn ayuda',
    patron_activacion JSONB, -- Patron tactil en formato JSON
    sensibilidad_movimiento VARCHAR(10),
    -- PARÁMETROS DE ALARMA
    tiempo_cancelacion_seg INTEGER DEFAULT 15,
    modo_sigiloso_activo BOOLEAN DEFAULT FALSE,
    notificar_siempre_sms BOOLEAN DEFAULT FALSE,
	-- PARÁMETROS DE SEGURIDAD
	patron_desbloqueo JSONB,
	pin_desbloqueo INTEGER,
	pass_desbloqueo VARCHAR(20),
    -- PARÁMETROS DE GESTIÓN
	umbral_bateria_media INTEGER DEFAULT 50,
    umbral_bateria_baja INTEGER DEFAULT 20,
    umbral_bateria_critica INTEGER DEFAULT 5,
	nro_intentos_fallidos INTEGER DEFAULT 3,
	template_mensaje TEXT,
    frecuencia_captura_fotos INTEGER DEFAULT 30,
	frecuencia_graba_audio INTEGER DEFAULT 30,
    frecuencia_ubicacion INTEGER DEFAULT 15,
    -- RETENCIÓN Y AUDITORÍA
	conservar_evidencias BOOLEAN DEFAULT FALSE,
    retencion_evidencias_dias INTEGER DEFAULT 30,
	limite_espacio_evidencias INTEGER DEFAULT 1000,
	borrar_antiguas BOOLEAN DEFAULT FALSE,
	borrar_enviadas BOOLEAN DEFAULT TRUE,
	espacio_critico_pct DOUBLE PRECISION,
	conservar_historial_local INTEGER DEFAULT 30,
	-- RED
	usar_datos_moviles BOOLEAN DEFAULT TRUE,
	limite_datos INTEGER DEFAULT 2000,
	envio_solo_WiFi BOOLEAN DEFAULT TRUE,
	-- Geolocalizacion
	precision_red INTEGER DEFAULT 2000,
	ubicacion_wifi BOOLEAN DEFAULT FALSE,
	-- Audio
	usar_filtros_ruido BOOLEAN DEFAULT FALSE,
	compresion_audio VARCHAR(3),
	-- Camara
	habilitar_camaras VARCHAR(1),
	resolucion_fotos_dpi DOUBLE PRECISION, 
	umbral_minimo_lux INTEGER DEFAULT 50
);

COMMENT ON TABLE secure_on_movil.configuracion_usuario IS 'Configuración extensible de preferencias y umbrales por usuario.';

-- 2.5 Tabla CUESTIONARIO
CREATE TABLE secure_on_movil.cuestionario (
    cuestionario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL
        REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE RESTRICT,
    -- Sección: Naturaleza del Incidente
    motivo_act_id INTEGER REFERENCES secure_on_utils.motivo_activacion(motivo_id) ON DELETE SET NULL,
    descripcion_incidente TEXT,
    -- Sección: Estado del Usuario
    estado_usuario INTEGER REFERENCES secure_on_utils.estados_fisicos(estado_id) ON DELETE SET NULL,
    requiere_asistencia BOOLEAN,
    -- Sección: Respuesta de Autoridades
    autoridades_contactadas VARCHAR(500),
    evaluacion_autoridades INTEGER,
    danios_materiales VARCHAR(500),
	evaluacion_sistema TEXT,
	observaciones TEXT,
    -- Sección: Metadatos
    fecha_completado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_completado VARCHAR(45), 
    tiempo_completar INTEGER,
	completado_pct DOUBLE PRECISION 
);

COMMENT ON TABLE secure_on_movil.cuestionario IS 'Respuestas estructuradas del usuario tras finalizar una alerta.';
CREATE INDEX idx_cuestionario_alerta ON secure_on_movil.cuestionario(alerta_id);


-- 2.6 Tabla CONTACTOS_EMERGENCIA
CREATE TABLE secure_on_movil.contactos (
    contacto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES secure_on_movil.usuarios(user_id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    relacion VARCHAR(50),
    canal_id INTEGER NOT NULL REFERENCES secure_on_utils.canal_notificacion(canal_id) ON DELETE CASCADE,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_contact UNIQUE(user_id, telefono)
);

CREATE INDEX idx_contactos_user ON secure_on_movil.contactos(user_id);

-- 2.7 Tabla ALERTAS_CONTACTOS 
CREATE TABLE secure_on_movil.alertas_contactos (
    alerta_contacto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE CASCADE,
    contacto_id UUID NOT NULL REFERENCES secure_on_movil.contactos(contacto_id),
    canal_id INTEGER NOT NULL REFERENCES secure_on_utils.canal_notificacion(canal_id) ON DELETE CASCADE,
    fecha_envio TIMESTAMP WITH TIME ZONE,
    estado_id INTEGER REFERENCES secure_on_utils.estados_envio(estado_id) ON DELETE SET NULL,
    intentos INTEGER DEFAULT 0,
    error_mensaje TEXT,
    CONSTRAINT unique_alerta_contacto UNIQUE(alerta_id, contacto_id, canal_id)
);

-- 2.8 Tabla EVIDENCIAS 
CREATE TABLE secure_on_movil.evidencias (
    evidencia_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE CASCADE,
    evidencia_tipo_id INTEGER REFERENCES secure_on_utils.tipos_evidencias(tipo_id) ON DELETE CASCADE,
    ruta_archivo TEXT,
    duracion_segundos INTEGER,
    fecha_toma TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ubicacion_toma GEOGRAPHY(POINT, 4326),
    bateria_nivel INTEGER,
    luz_ambiente_lux INTEGER,
    enviado_cdm BOOLEAN DEFAULT FALSE,
    fecha_envio_cdm TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_evidencias_alerta ON secure_on_movil.evidencias(alerta_id);
CREATE INDEX idx_evidencias_tipo ON secure_on_movil.evidencias(evidencia_tipo_id);
CREATE INDEX idx_evidencias_envio ON secure_on_movil.evidencias(enviado_cdm) WHERE enviado_cdm = FALSE;

-- 2.9 Tabla UBICACIONES
CREATE TABLE secure_on_movil.ubicaciones (
    ubicacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE CASCADE,
	posicion GEOGRAPHY(POINT, 4326),
    precision_toma INTEGER,
    metodo_ubic_id INTEGER REFERENCES secure_on_utils.metodos_ubicacion(metodo_id) ON DELETE CASCADE,
    bateria_nivel INTEGER,
    es_estimada BOOLEAN DEFAULT FALSE,
    velocidad DECIMAL(5, 2),
	altura DECIMAL(7,2),
	fecha_toma TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ubicaciones_alerta ON secure_on_movil.ubicaciones(alerta_id);
CREATE INDEX idx_ubicaciones_timestamp ON secure_on_movil.ubicaciones(fecha_toma);

-- 2.10 Tabla OPERADORES_CDM 
CREATE TABLE secure_on_cdmso.operadores_cdm (
    operador_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
	apellido VARCHAR(50) NOT NULL,
	legajo INTEGER,
    email VARCHAR(255) UNIQUE NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL,
    es_administrador BOOLEAN DEFAULT FALSE,
    esta_activo BOOLEAN DEFAULT TRUE,
	supervisor_id UUID REFERENCES secure_on_cdmso.operadores_cdm(operador_id) ON DELETE SET NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.11 Tabla ALERTAS_OPERADORES 
CREATE TABLE secure_on_cdmso.alertas_operadores (
    asignacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alerta_id UUID NOT NULL 
        REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE RESTRICT,
    operador_id UUID NOT NULL
        REFERENCES secure_on_cdmso.operadores_cdm(operador_id) ON DELETE RESTRICT,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    es_asignacion_auto BOOLEAN DEFAULT TRUE,
    fecha_verificacion TIMESTAMP WITH TIME ZONE,
    observaciones_verificacion TEXT,
    falsa_alarma BOOLEAN DEFAULT FALSE
);

-- 2.12 Tabla AUTORIDADES 
CREATE TABLE secure_on_cdmso.autoridades (
    autoridad_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autoridad_tipo_id INTEGER NOT NULL REFERENCES secure_on_utils.tipos_autoridades(tipo_id) ON DELETE RESTRICT,
    ubicacion_autoridad GEOGRAPHY(POINT, 4326),
    nombre VARCHAR(255),
    telefono VARCHAR(50),
	email VARCHAR(255),
	canal_id INTEGER NOT NULL REFERENCES secure_on_utils.canal_notificacion(canal_id) ON DELETE SET NULL,
    habilitada BOOLEAN DEFAULT TRUE
);

-- 2.13 Tabla ALERTAS_AUTORIDADES 
CREATE TABLE secure_on_cdmso.alertas_autoridades (
	notificacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asignacion_id UUID NOT NULL
        REFERENCES secure_on_cdmso.alertas_operadores(asignacion_id) ON DELETE RESTRICT,
    alerta_id UUID NOT NULL
        REFERENCES secure_on_movil.alertas(alerta_id) ON DELETE RESTRICT,
    fecha_notificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones_notificacion TEXT,
	tiempo_respuesta_seg INTEGER
);

CREATE INDEX idx_asignaciones_operador ON secure_on_cdmso.alertas_operadores(operador_id);
CREATE INDEX idx_asignaciones_estado ON secure_on_cdmso.alertas_operadores(fecha_verificacion) WHERE fecha_verificacion IS NULL;

-- 2.14 Tabla parametros sistema 
CREATE TABLE secure_on_utils.parametros_sistema (
    parametro_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(500),
    categoria_id INTEGER REFERENCES secure_on_utils.tipos_parametros(tipo_id) ON DELETE SET NULL,
    habilitada BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE secure_on_utils.parametros_sistema IS 'Tabla de configuración global del sistema';


-- 2.15 tablas de sesion
CREATE TABLE secure_on_utils.sesiones (
    sesion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    token_restablecimiento VARCHAR(255),
    expiracion_token TIMESTAMP WITH TIME ZONE,
    mfa_habilitado BOOLEAN DEFAULT FALSE,
    mfa_secreto TEXT
);

CREATE TABLE secure_on_movil.sesiones_usuario (
	sesion_usuario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	sesion_id UUID NOT NULL REFERENCES secure_on_utils.sesiones(sesion_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES secure_on_movil.usuarios(user_id) ON DELETE CASCADE,
	dispositivo_id UUID NOT NULL REFERENCES secure_on_movil.dispositivos(dispositivo_id) ON DELETE CASCADE
);

CREATE TABLE secure_on_cdmso.sesiones_cdm (
	sesion_cdm_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	sesion_id UUID NOT NULL REFERENCES secure_on_utils.sesiones(sesion_id) ON DELETE CASCADE,
	operador_id UUID NOT NULL REFERENCES secure_on_cdmso.operadores_cdm(operador_id) ON DELETE CASCADE
);

-- 2.16 Tabla auditoria sistema 
CREATE TABLE secure_on_utils.logs_sistema (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	tabla_id INTEGER NOT NULL REFERENCES secure_on_utils.tablas_auditoria(tipo_id) ON DELETE SET NULL,
    accion_id INTEGER NOT NULL REFERENCES secure_on_utils.accion_auditoria(accion_id) ON DELETE SET NULL,
    usuario VARCHAR(500) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
	ip VARCHAR(200),
	datos_anteriores JSONB,
	datos_actuales JSONB
);

COMMENT ON TABLE secure_on_utils.parametros_sistema IS 'Tabla de auditoria global del sistema';

CREATE INDEX idx_logs_fecha ON secure_on_utils.logs_sistema(fecha);
CREATE INDEX idx_logs_tabla_accion ON secure_on_utils.logs_sistema(tabla_id, accion_id);

-- 3. Inserciones Iniciales de Configuracion
-----------------------------------------------------------
-- Llenar tabla de acciones de auditoría
INSERT INTO secure_on_utils.accion_auditoria (accion_id, descripcion) VALUES
(1, 'Creación'),
(2, 'Actualización'),
(3, 'Eliminación'),
(4, 'Borrado Lógico');

-- Llenar tabla de tablas a auditar
INSERT INTO secure_on_utils.tablas_auditoria (tipo_id, nombre, esquema) VALUES
(1, 'usuarios', 'secure_on_movil'),
(2, 'alertas', 'secure_on_movil'),
(3, 'dispositivos', 'secure_on_movil'),
(4, 'configuracion_usuario', 'secure_on_movil'),
(5, 'cuestionario', 'secure_on_movil'),
(6, 'contactos', 'secure_on_movil'),
(7, 'alertas_contactos', 'secure_on_movil'),
(8, 'evidencias', 'secure_on_movil'),
(9, 'ubicaciones', 'secure_on_movil'),
(10, 'operadores_cdm', 'secure_on_cdmso'),
(11, 'alertas_operadores', 'secure_on_cdmso'),
(12, 'autoridades', 'secure_on_cdmso'),
(13, 'alertas_autoridades', 'secure_on_cdmso'),
(14, 'parametros_sistema', 'secure_on_utils'),
(15, 'estados_alerta', 'secure_on_utils'),
(16, 'estados_asignacion', 'secure_on_utils'),
(17, 'prioridades', 'secure_on_utils'),
(18, 'metodo_activacion', 'secure_on_utils'),
(19, 'motivo_activacion', 'secure_on_utils'),
(20, 'canal_notificacion', 'secure_on_utils'),
(21, 'estados_envio', 'secure_on_utils'),
(22, 'estados_fisicos', 'secure_on_utils'),
(23, 'idiomas', 'secure_on_utils'),
(24, 'metodos_ubicacion', 'secure_on_utils'),
(25, 'tipos_autoridades', 'secure_on_utils'),
(26, 'tipos_evidencias', 'secure_on_utils'),
(27, 'tipos_parametros', 'secure_on_utils');


INSERT INTO secure_on_utils.tipos_parametros (tipo_id, descripcion) VALUES
    (0, 'GENERAL'),
    (1, 'INTEGRACION'),
    (2, 'LIMITES'),
    (3, 'SEGURIDAD'),
    (4, 'RESILIENCIA');


-- Parámetros de Integración y Límites
INSERT INTO secure_on_utils.parametros_sistema (codigo, valor, descripcion, categoria_id) VALUES
    ('CDM_API_URL', 'https://monitoreo.secureon.com/api', 'URL base del Centro de Monitoreo', 1),
    ('CDM_API_TIMEOUT_MS', '10000', 'Timeout para llamadas al CdM en ms', 1),
    ('MAX_EVIDENCIAS_X_ALERTA', '100', 'Número máximo de evidencias por alerta', 2),
    ('ALERTA_DURACION_MAX_HORAS', '24', 'Duración máxima automática de una alerta', 2),
    ('INTENTOS_ENVIO_SMS', '3', 'Intentos de reenvío para SMS fallidos', 4),
    ('TIEMPO_INACTIVIDAD_SESION_MIN', '30', 'Tiempo de inactividad para cerrar sesión', 3),
    ('TAMANO_MAX_AUDIO_MB', '10', 'Tamaño máximo por archivo de audio', 2);

-- 4. Funciones de Utilidad y Seguridad
-----------------------------------------------------------

-- 4.1 funcion de auditoria
-- Función profesional con manejo de errores
CREATE OR REPLACE FUNCTION secure_on_utils.fn_auditoria_generica()
RETURNS TRIGGER AS $$
DECLARE
    v_tabla_id INTEGER;
    v_accion_id INTEGER;
    v_usuario VARCHAR(500);
    v_ip VARCHAR(200);
    v_json_old JSONB;
    v_json_new JSONB;
    v_es_borrado_logico BOOLEAN := FALSE;
BEGIN
    -- Obtener ID de la tabla
    SELECT tipo_id INTO v_tabla_id 
    FROM secure_on_utils.tablas_auditoria 
    WHERE esquema = TG_TABLE_SCHEMA AND nombre = TG_TABLE_NAME;
    
    -- Determinar acción básica
    IF TG_OP = 'INSERT' THEN
        v_accion_id := 1; -- creacion
    ELSIF TG_OP = 'UPDATE' THEN
        v_accion_id := 2; -- actualizacion por defecto
        
        -- Convertir registros a JSONB para análisis dinámico
        v_json_old := to_jsonb(OLD);
        v_json_new := to_jsonb(NEW);
        
        -- Verificar si es borrado lógico revisando diferentes campos posibles
        -- Caso 1: Campo 'habilitada'
        IF v_json_old ? 'habilitada' AND v_json_new ? 'habilitada' THEN
            IF (v_json_old->>'habilitada')::BOOLEAN = TRUE 
               AND (v_json_new->>'habilitada')::BOOLEAN = FALSE THEN
                v_es_borrado_logico := TRUE;
            END IF;
        -- Caso 2: Campo 'esta_activo'
        ELSIF v_json_old ? 'esta_activo' AND v_json_new ? 'esta_activo' THEN
            IF (v_json_old->>'esta_activo')::BOOLEAN = TRUE 
               AND (v_json_new->>'esta_activo')::BOOLEAN = FALSE THEN
                v_es_borrado_logico := TRUE;
            END IF;
        END IF;
        
        -- Si es borrado lógico, cambiar acción
        IF v_es_borrado_logico THEN
            v_accion_id := 4; -- borrado_logico
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_accion_id := 3; -- eliminacion
    END IF;
    
    -- Obtener usuario e IP (con manejo de errores si las configuraciones no existen)
    BEGIN
        v_usuario := current_setting('app.audit_usuario', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := current_user;
    END;
    
    BEGIN
        v_ip := current_setting('app.audit_ip', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_ip := inet_client_addr()::VARCHAR;
    END;
    
    -- Insertar en logs
    INSERT INTO secure_on_utils.logs_sistema (
        tabla_id,
        accion_id,
        usuario,
        fecha,
        ip,
        datos_anteriores,
        datos_actuales
    ) VALUES (
        v_tabla_id,
        v_accion_id,
        COALESCE(v_usuario, current_user),
        CURRENT_TIMESTAMP,
        COALESCE(v_ip, '0.0.0.0'),
        CASE 
            WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)
            ELSE NULL
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4.2 función para establecer contexto de auditoría
CREATE OR REPLACE FUNCTION secure_on_utils.set_audit_context(
    p_usuario VARCHAR(500),
    p_ip VARCHAR(200)
) RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.audit_usuario', p_usuario, FALSE);
    PERFORM set_config('app.audit_ip', p_ip, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION secure_on_utils.clear_audit_context() 
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.audit_usuario', '', FALSE);
    PERFORM set_config('app.audit_ip', '', FALSE);
END;
$$ LANGUAGE plpgsql;


-- 4.3 registro de triggers
-- Tablas del esquema secure_on_movil
CREATE TRIGGER tr_auditoria_usuarios
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.usuarios
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_alertas
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.alertas
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_dispositivos
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.dispositivos
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_configuracion_usuario
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.configuracion_usuario
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_cuestionario
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.cuestionario
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_contactos
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.contactos
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_alertas_contactos
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.alertas_contactos
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_evidencias
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.evidencias
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_ubicaciones
AFTER INSERT OR UPDATE OR DELETE ON secure_on_movil.ubicaciones
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

-- Tablas del esquema secure_on_cdmso
CREATE TRIGGER tr_auditoria_operadores_cdm
AFTER INSERT OR UPDATE OR DELETE ON secure_on_cdmso.operadores_cdm
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_alertas_operadores
AFTER INSERT OR UPDATE OR DELETE ON secure_on_cdmso.alertas_operadores
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_autoridades
AFTER INSERT OR UPDATE OR DELETE ON secure_on_cdmso.autoridades
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_alertas_autoridades
AFTER INSERT OR UPDATE OR DELETE ON secure_on_cdmso.alertas_autoridades
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

-- Tabla de parámetros del sistema
CREATE TRIGGER tr_auditoria_parametros_sistema
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.parametros_sistema
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

-- Tablas de utilidad 
CREATE TRIGGER tr_auditoria_estados_alerta
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.estados_alerta
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_estados_asignacion
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.estados_asignacion
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_prioridades
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.prioridades
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_metodo_activacion
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.metodo_activacion
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_motivo_activacion
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.motivo_activacion
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_canal_notificacion
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.canal_notificacion
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_estados_envio
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.estados_envio
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_estados_fisicos
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.estados_fisicos
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_idiomas
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.idiomas
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_metodos_ubicacion
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.metodos_ubicacion
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_tipos_autoridades
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.tipos_autoridades
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_tipos_evidencias
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.tipos_evidencias
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_tipos_parametros
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.tipos_parametros
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_tablas_auditoria
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.tipos_parametros
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();

CREATE TRIGGER tr_auditoria_accion_auditoria
AFTER INSERT OR UPDATE OR DELETE ON secure_on_utils.accion_auditoria
FOR EACH ROW EXECUTE FUNCTION secure_on_utils.fn_auditoria_generica();



/*
-- 4.4 Funcion para limpieza automatica de evidencias antiguas (retention policy)
CREATE OR REPLACE FUNCTION secure_on_utils.limpiar_evidencias_antiguas()
RETURNS INTEGER AS $$
DECLARE
    filas_eliminadas INTEGER;
BEGIN
    DELETE FROM secure_on_movil.evidencias e
    USING secure_on_movil.alertas a, secure_on_movil.configuracion_usuario c
    WHERE e.alerta_id = a.alerta_id
        AND a.user_id = c.user_id
        AND e.timestamp < CURRENT_TIMESTAMP - (c.retencion_evidencias_dias || ' days')::INTERVAL
        AND e.confirmado_cdm = TRUE
        AND e.eliminado_local = TRUE;
    
    GET DIAGNOSTICS filas_eliminadas = ROW_COUNT;
    RETURN filas_eliminadas;
END;
$$ LANGUAGE plpgsql;
*/
-- 4.3 Funcion para estadisticas del dashboard CdM (UC-029)
CREATE OR REPLACE FUNCTION secure_on_cdmso.obtener_estadisticas_cdm (
    p_fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '7 days',
    p_fecha_fin TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (
    total_alertas BIGINT,
    alertas_activas BIGINT,
    promedio_respuesta_min DECIMAL,
    falsas_alarmas_porcentaje DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_alertas,
        COUNT(*) FILTER (WHERE estado_id IN (1)) as alertas_activas,
        COALESCE(AVG(EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_activacion)) / 60), 0) as promedio_respuesta_min,
        COALESCE(100.0 * COUNT(*) FILTER (WHERE estado = 'falsa_alarma') / NULLIF(COUNT(*), 0), 0) as falsas_alarmas_porcentaje
    FROM secure_on_movil.alertas
    WHERE fecha_activacion BETWEEN p_fecha_inicio AND p_fecha_fin;
END;
$$ LANGUAGE plpgsql;


-- 5. Completar llenado de tablas de Utilidad
---------------------------------------------------
-- Idiomas
INSERT INTO secure_on_utils.idiomas (idioma_id, descripcion) VALUES
('es', 'Español'),
('en', 'English'),
('pt', 'Português'),
('fr', 'Français'),
('it', 'Italiano'),
('de', 'Deutsch');

-- Estados de alerta
INSERT INTO secure_on_utils.estados_alerta (estado_id, descripcion) VALUES
(1, 'Activa'),
(2, 'Cancelada'),
(3, 'Finalizada');

-- Prioridades
INSERT INTO secure_on_utils.prioridades (prioridad_id, descripcion) VALUES
(1, 'Normal'),
(2, 'Alta'),
(3, 'Urgencia');

-- Estados de asignación
INSERT INTO secure_on_utils.estados_asignacion (estado_id, descripcion) VALUES
(1, 'Nueva'),
(2, 'Asignada'),
(3, 'En Verificacion'),
(4, 'Notificacion Autoridades'),
(5, 'Cerrada');

-- Motivos de activación
INSERT INTO secure_on_utils.motivo_activacion (motivo_id, descripcion) VALUES
(4, 'Emergencia médica'),
(3, 'Accidente de tránsito'),
(1, 'Robo o hurto'),
(2, 'Violencia o agresión'),
(5, 'Incendio'),
(6, 'Desastre natural'),
(7, 'Persona desaparecida'),
(9, 'Situación de pánico'),
(10, 'Caída o lesión'),
(11, 'Problema cardíaco'),
(12, 'Amenaza o intimidación'),
(13, 'Intrusión en propiedad'),
(0, 'Otros');

-- Método de activación
INSERT INTO secure_on_utils.metodo_activacion (metodo_id, descripcion) VALUES
(1, 'Manual'),
(2, 'Patron Tactil'),
(3, 'Comando de Voz'),
(4, 'Movimiento'),
(5, 'Reactivacion');

-- Canal de notificación
INSERT INTO secure_on_utils.canal_notificacion (canal_id, descripcion) VALUES
(1, 'SMS'),
(2, 'Whatsapp'),
(3, 'Telegram'),
(4, 'Messenger'),
(5, 'Email'),
(6, 'Llamada'),
(0, 'Otro');

-- Estados de envío
INSERT INTO secure_on_utils.estados_envio (estado_id, descripcion) VALUES
(1, 'Enviado'),
(2, 'No Enviado'),
(3, 'Fallo Envio');

-- Estados físicos
INSERT INTO secure_on_utils.estados_fisicos (estado_id, descripcion) VALUES
(1, 'Ileso'),
(2, 'Heridas Leves'),
(3, 'Heridas de consideracion'),
(4, 'Heridas graves'),
(5, 'Heridas muy graves'),
(6, 'Fallecido'),
(0, 'Otro');

-- Métodos de ubicación
INSERT INTO secure_on_utils.metodos_ubicacion (metodo_id, descripcion) VALUES
(1, 'GPS Alta precision'),
(2, 'GPS'),
(3, 'Red Celular');

-- Tipos de autoridades
INSERT INTO secure_on_utils.tipos_autoridades (tipo_id, descripcion) VALUES
(1, 'Policia'),
(2, 'Bomberos'),
(3, 'Ambulancia'),
(4, 'Defensa Civil'),
(0, 'Otro');

-- Tipos de evidencias
INSERT INTO secure_on_utils.tipos_evidencias (tipo_id, descripcion) VALUES
(1, 'Foto'),
(2, 'Audio'),
(0, 'Otro');



-- 5. Vistas para Consultas Frecuentes
-----------------------------------------------------------

-- Vista para el Dashboard del CdM (UC-029)
CREATE OR REPLACE VIEW secure_on_cdmso.vista_dashboard_cdm AS
SELECT 
	a.alerta_id,
    u.apellido || ', ' || u.nombre as usuario_nombre,
    d.numero as telefono,
    ma.descripcion as metodo_activacion,
    a.fecha_activacion,
    pr.descripcion as prioridad,
    ea.descripcion as estado,
    ST_X(ub.posicion::geometry) as latitud,
    ST_Y(ub.posicion::geometry) as longitud,
    op.legajo,
	op.apellido || ', ' || op.nombre as operador_asignado
    COUNT(e.evidencia_id) as evidencias_pendientes,
    COUNT(DISTINCT ac.contacto_id) as contactos_notificados
FROM secure_on_movil.alertas a
JOIN secure_on_movil.usuarios u ON a.user_id = u.user_id
LEFT JOIN secure_on_cdmso.alertas_operadores ao ON a.alerta_id = ao.alerta_id
LEFT JOIN secure_on_cdmso.operadores_cdm op ON ao.operador_id = op.operador_id
LEFT JOIN secure_on_movil.evidencias e ON a.alerta_id = e.alerta_id AND e.enviado_cdm = FALSE
LEFT JOIN secure_on_movil.alertas_contactos ac ON a.alerta_id = ac.alerta_id)
LEFT JOIN secure_on_movil.ubicaciones ub ON a.alerta_id = ub.alerta_id AND ub.fecha_toma >= (SELECT MAX(uc.fecha_toma) FROM secure_on_movil.ubicaciones uc WHERE a.alerta_id = uc.alerta_id)
LEFT JOIN secure_on_utils.estados_alerta ea ON a.estado_id = ea.estado_id
LEFT JOIN secure_on_utils.prioridades pr ON a.prioridad_id = pr.prioridad_id
LEFT JOIN secure_on_utils.metodos_ubicacion ma ON a.metodo_id = ma.metodo_id
LEFT JOIN secure_on_movil.dispositivos d ON a.dispositivo_id = d.dispositivo_id
WHERE a.estado_id IN (1, 2)
GROUP BY a.alerta_id, u.apellido || ', ' || u.nombre, d.numero, op.legajo, op.apellido || ', ' || op.nombre;

CREATE TABLE secure_on_utils.estados_alerta (
    estado_id INTEGER PRIMARY KEY,
	descripcion VARCHAR(20),
    habilitada BOOLEAN DEFAULT TRUE
);

-- Vista para historial completo del usuario (UC-016, UC-022)
CREATE OR REPLACE VIEW secure_on_movil.vista_historial_usuario AS
SELECT 
    a.alerta_id,
    a.fecha_activacion,
    a.fecha_finalizacion,
	d.numero as telefono,
    ma.descripcion as metodo_activacion,
    ea.descripcion as estado,
    pr.descripcion as prioridad,
    mc.descripcion as motivo_activacion,
    ef.descripcion as lesiones_usuario,
    COUNT(e.evidencia_id) as total_evidencias,
    COUNT(ac.contacto_id) as contactos_notificados
FROM secure_on_movil.alertas a
LEFT JOIN secure_on_movil.cuestionario cq ON a.alerta_id = cq.alerta_id
LEFT JOIN secure_on_movil.evidencias e ON a.alerta_id = e.alerta_id
LEFT JOIN secure_on_movil.alertas_contactos ac ON a.alerta_id = ac.alerta_id
LEFT JOIN secure_on_utils.estados_alerta ea ON a.estado_id = ea.estado_id
LEFT JOIN secure_on_utils.prioridades pr ON a.prioridad_id = pr.prioridad_id
LEFT JOIN secure_on_utils.metodos_activacion ma ON a.metodo_id = ma.metodo_id
LEFT JOIN secure_on_utils.motivos_activacion mc ON a.motivo_id = mc.motivo_id
LEFT JOIN secure_on_utils.estados_fisicos ef ON cq.estado_id = ef.estado_id
LEFT JOIN secure_on_movil.dispositivos d ON a.dispositivo_id = d.dispositivo_id
GROUP BY a.alerta_id, mc.descripcion, ef.descripcion;

-- 6. Usuarios de Aplicación con Permisos Restringidos
-----------------------------------------------------------
-- Crear usuario para la aplicación móvil (solo acceso a sus funciones)
CREATE USER app_mobile WITH PASSWORD '<contraseña_fuerte_app>';
GRANT CONNECT ON DATABASE <nombre_base_datos> TO app_mobile;
GRANT USAGE ON SCHEMA secureon TO app_mobile;
GRANT SELECT, INSERT, UPDATE ON 
    secureon.usuarios,
    secureon.alertas,
    secureon.configuracion_usuario,
    secureon.contactos_emer,
    secureon.evidencias,
    secureon.ubicaciones,
    secureon.cuestionario_post_alarma,
    secureon.alertas_contactos
TO app_mobile;

-- Crear usuario para el dashboard CdM
CREATE USER dashboard_cdm WITH PASSWORD '<contraseña_fuerte_cdm>';
GRANT CONNECT ON DATABASE <nombre_base_datos> TO dashboard_cdm;
GRANT USAGE ON SCHEMA secureon TO dashboard_cdm;
GRANT SELECT ON 
    secureon.vista_dashboard_cdm,
    secureon.alertas,
    secureon.usuarios,
    secureon.evidencias,
    secureon.ubicaciones,
    secureon.operadores_cdm,
    secureon.alertas_operadores,
    secureon.parametros_sistema
TO dashboard_cdm;
GRANT INSERT, UPDATE ON 
    secureon.alertas_operadores,
    secureon.operadores_cdm
TO dashboard_cdm;

