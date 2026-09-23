/**
 * Metadatos descriptivos de las 9 tablas, tipos de campo Airtable nativos,
 * reglas de validación y vistas preconfiguradas para "MOONI — MVP Transporte — Pruebas".
 */

export interface FieldDefinition {
  name: string;
  key: string;
  airtableType:
    | 'Single line text'
    | 'Long text'
    | 'Single select'
    | 'Multiple select'
    | 'Number'
    | 'Currency'
    | 'Checkbox'
    | 'Date with time'
    | 'Link to another record'
    | 'Lookup'
    | 'URL'
    | 'Phone number'
    | 'Formula'
    | 'Created time'
    | 'Last modified time';
  description: string;
  linkedTable?: string;
  required?: boolean;
  options?: string[];
}

export interface TableMetadata {
  id: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
}

export const AIRTABLE_TABLES_SCHEMA: TableMetadata[] = [
  {
    id: 'pasajeros',
    name: 'Pasajeros',
    description: 'Directorio de usuarios registrados a través de WhatsApp.',
    fields: [
      { name: 'ID pasajero', key: 'id_pasajero', airtableType: 'Single line text', description: 'Identificador interno estable (ej. PAS-001)', required: true },
      { name: 'Nombre', key: 'nombre', airtableType: 'Single line text', description: 'Nombre completo del pasajero', required: true },
      { name: 'Teléfono WhatsApp', key: 'telefono_whatsapp', airtableType: 'Single line text', description: 'Guardado como texto para preservar el signo + y ceros iniciales' },
      { name: 'ID contacto ManyChat', key: 'id_contacto_manychat', airtableType: 'Single line text', description: 'Identificador externo provisto por ManyChat' },
      { name: 'Consentimiento', key: 'consentimiento', airtableType: 'Single select', description: 'Consentimiento para gestionar el servicio', options: ['pendiente', 'aceptado', 'rechazado'] },
      { name: 'Fecha del consentimiento', key: 'fecha_consentimiento', airtableType: 'Date with time', description: 'Fecha y hora en que se otorgó consentimiento' },
      { name: 'Versión del aviso de privacidad', key: 'version_aviso_privacidad', airtableType: 'Single line text', description: 'Versión del texto legal aceptado' },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Estado operativo del pasajero', options: ['activo', 'bloqueado'] },
      { name: 'Viajes', key: 'viajes_ids', airtableType: 'Link to another record', description: 'Relación inversa con la tabla Viajes', linkedTable: 'Viajes' },
      { name: 'Notas operativas', key: 'notas_operativas', airtableType: 'Long text', description: 'Observaciones internas del equipo de soporte' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Indica si es un registro simulado o de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de inserción' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de última actualización' },
    ],
  },
  {
    id: 'conductores',
    name: 'Conductores',
    description: 'Padrón de choferes autorizados para asignación de viajes.',
    fields: [
      { name: 'ID conductor', key: 'id_conductor', airtableType: 'Single line text', description: 'Identificador interno estable (ej. CND-001)', required: true },
      { name: 'Nombre', key: 'nombre', airtableType: 'Single line text', description: 'Nombre del conductor', required: true },
      { name: 'Teléfono WhatsApp', key: 'telefono_whatsapp', airtableType: 'Single line text', description: 'Texto para preservar signo + y formato' },
      { name: 'ID contacto ManyChat', key: 'id_contacto_manychat', airtableType: 'Single line text', description: 'ID de suscriptor en ManyChat' },
      { name: 'Autorización', key: 'autorizacion', airtableType: 'Single select', description: 'Regla: No considerar disponible para asignación a quien no esté aprobado', options: ['pendiente', 'aprobado', 'suspendido'] },
      { name: 'Disponibilidad', key: 'disponibilidad', airtableType: 'Single select', description: 'Estado en tiempo real reportado por el conductor', options: ['desconectado', 'disponible', 'reservado', 'ocupado'] },
      { name: 'Vehículos', key: 'vehiculos_ids', airtableType: 'Link to another record', description: 'Vehículos asignados o registrados', linkedTable: 'Vehículos' },
      { name: 'Zona de operación', key: 'zona_operacion', airtableType: 'Single line text', description: 'Polígono o zona urbana de trabajo' },
      { name: 'Última actualización disponibilidad', key: 'ultima_actualizacion_disponibilidad', airtableType: 'Date with time', description: 'Momento de último reporte de estado' },
      { name: 'Viajes', key: 'viajes_ids', airtableType: 'Link to another record', description: 'Historial de viajes atendidos', linkedTable: 'Viajes' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    description: 'Unidades vehiculares vinculadas a conductores.',
    fields: [
      { name: 'ID vehículo', key: 'id_vehiculo', airtableType: 'Single line text', description: 'Identificador interno (ej. VEH-001)', required: true },
      { name: 'Conductor', key: 'conductor_id', airtableType: 'Link to another record', description: 'Conductor habitual o propietario', linkedTable: 'Conductores' },
      { name: 'Marca', key: 'marca', airtableType: 'Single line text', description: 'Marca de la unidad' },
      { name: 'Modelo', key: 'modelo', airtableType: 'Single line text', description: 'Modelo y año' },
      { name: 'Color', key: 'color', airtableType: 'Single line text', description: 'Color exterior' },
      { name: 'Placas', key: 'placas', airtableType: 'Single line text', description: 'Placa vehicular oficial' },
      { name: 'Capacidad de pasajeros', key: 'capacidad_pasajeros', airtableType: 'Number', description: 'Capacidad máxima de pasajeros' },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Estado mecánico/administrativo', options: ['pendiente', 'habilitado', 'fuera_de_servicio'] },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'viajes',
    name: 'Viajes',
    description: 'Tabla nuclear de solicitudes, trayectos y estados operativos.',
    fields: [
      { name: 'ID viaje', key: 'id_viaje', airtableType: 'Single line text', description: 'Identificador único del viaje (ej. VIJ-001)', required: true },
      { name: 'Clave de idempotencia', key: 'clave_idempotencia', airtableType: 'Single line text', description: 'Previene duplicados en peticiones repetidas de webhook', required: true },
      { name: 'Pasajero', key: 'pasajero_id', airtableType: 'Link to another record', description: 'Enlace a un solo registro de Pasajeros', linkedTable: 'Pasajeros', required: true },
      { name: 'Conductor asignado', key: 'conductor_asignado_id', airtableType: 'Link to another record', description: 'Máximo un conductor asignado', linkedTable: 'Conductores' },
      { name: 'Vehículo asignado', key: 'vehiculo_asignado_id', airtableType: 'Link to another record', description: 'Máximo un vehículo asignado', linkedTable: 'Vehículos' },
      { name: 'Origen (dirección)', key: 'origen_direccion', airtableType: 'Single line text', description: 'Texto descriptivo de recogida' },
      { name: 'Referencia de recogida', key: 'referencia_recogida', airtableType: 'Single line text', description: 'Detalle para el conductor' },
      { name: 'Origen latitud', key: 'origen_latitud', airtableType: 'Number', description: 'Decimal. Permanece vacío hasta recibir datos reales validados.' },
      { name: 'Origen longitud', key: 'origen_longitud', airtableType: 'Number', description: 'Decimal. Permanece vacío hasta recibir datos reales validados.' },
      { name: 'Enlace mapa origen', key: 'enlace_mapa_origen', airtableType: 'URL', description: 'URL de Google Maps proporcionada' },
      { name: 'Destino (dirección)', key: 'destino_direccion', airtableType: 'Single line text', description: 'Texto descriptivo de destino' },
      { name: 'Destino latitud', key: 'destino_latitud', airtableType: 'Number', description: 'Decimal. Permanece vacío hasta validación externa.' },
      { name: 'Destino longitud', key: 'destino_longitud', airtableType: 'Number', description: 'Decimal. Permanece vacío hasta validación externa.' },
      { name: 'Enlace mapa destino', key: 'enlace_mapa_destino', airtableType: 'URL', description: 'URL de Google Maps destino' },
      { name: 'Número de pasajeros', key: 'numero_pasajeros', airtableType: 'Number', description: 'Cantidad de personas' },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Ciclo de vida del viaje', options: ['solicitado', 'buscando_conductor', 'asignado', 'en_camino', 'conductor_llego', 'en_viaje', 'finalizado', 'cancelado', 'sin_disponibilidad'] },
      { name: 'ID cotización', key: 'id_cotizacion', airtableType: 'Single line text', description: 'ID de cotización provista' },
      { name: 'Importe cotizado', key: 'importe_cotizado', airtableType: 'Number', description: 'Número decimal. Permanece vacío hasta cotizar.' },
      { name: 'Moneda', key: 'moneda', airtableType: 'Single line text', description: 'Sin asumir moneda hasta configurar en Configuración' },
      { name: 'Tipo de precio', key: 'tipo_precio', airtableType: 'Single select', description: 'Modelo de cálculo', options: ['fijo', 'estimado'] },
      { name: 'Método de pago', key: 'metodo_pago', airtableType: 'Single select', description: 'Canal de cobro acordado', options: ['efectivo', 'enlace_de_pago'] },
      { name: 'Estado de pago', key: 'estado_pago', airtableType: 'Single select', description: 'Estado financiero del viaje', options: ['pendiente', 'procesando', 'pagado', 'fallido', 'reembolso_pendiente', 'reembolsado'] },
      { name: 'Fecha confirmación pasajero', key: 'fecha_confirmacion_pasajero', airtableType: 'Date with time', description: 'Timestamp de confirmación' },
      { name: 'Fecha de asignación', key: 'fecha_asignacion', airtableType: 'Date with time', description: 'Timestamp de asignación' },
      { name: 'Fecha de llegada', key: 'fecha_llegada', airtableType: 'Date with time', description: 'Timestamp en que conductor avisa que llegó' },
      { name: 'Fecha de inicio', key: 'fecha_inicio', airtableType: 'Date with time', description: 'Timestamp de inicio del trayecto' },
      { name: 'Fecha de finalización', key: 'fecha_finalizacion', airtableType: 'Date with time', description: 'Timestamp de término del viaje' },
      { name: 'Fecha de cancelación', key: 'fecha_cancelacion', airtableType: 'Date with time', description: 'Timestamp si fue cancelado' },
      { name: 'Cancelado por', key: 'cancelado_por', airtableType: 'Single select', description: 'Actor que canceló', options: ['pasajero', 'conductor', 'operador', 'sistema'] },
      { name: 'Motivo de cancelación', key: 'motivo_cancelacion', airtableType: 'Long text', description: 'Causa documentada' },
      { name: 'Requiere operador', key: 'requiere_operador', airtableType: 'Checkbox', description: 'Marca de alerta para intervención humana' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'ofertas_viaje',
    name: 'Ofertas de viaje',
    description: 'Subastas y ofrecimientos de viajes a conductores por WhatsApp.',
    fields: [
      { name: 'ID oferta', key: 'id_oferta', airtableType: 'Single line text', description: 'Identificador de oferta (ej. OFR-001)', required: true },
      { name: 'Viaje', key: 'viaje_id', airtableType: 'Link to another record', description: 'Viaje ofertado', linkedTable: 'Viajes', required: true },
      { name: 'Conductor', key: 'conductor_id', airtableType: 'Link to another record', description: 'Conductor al que se envió la oferta', linkedTable: 'Conductores', required: true },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Estatus del despacho', options: ['pendiente_envio', 'enviada', 'aceptada', 'rechazada', 'vencida', 'invalidada'] },
      { name: 'Fecha de envío', key: 'fecha_envio', airtableType: 'Date with time', description: 'Momento de emisión' },
      { name: 'Fecha de vencimiento', key: 'fecha_vencimiento', airtableType: 'Date with time', description: 'Límite de tiempo para responder' },
      { name: 'Fecha de respuesta', key: 'fecha_respuesta', airtableType: 'Date with time', description: 'Momento de respuesta del conductor' },
      { name: 'ID operación externa', key: 'id_operacion_externa', airtableType: 'Single line text', description: 'ID de mensaje o callback en ManyChat' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'pagos',
    name: 'Pagos',
    description: 'Gestión y verificación de transacciones financieras.',
    fields: [
      { name: 'ID pago interno', key: 'id_pago_interno', airtableType: 'Single line text', description: 'Identificador interno (ej. PAG-001)', required: true },
      { name: 'Viaje', key: 'viaje_id', airtableType: 'Link to another record', description: 'Viaje asociado', linkedTable: 'Viajes', required: true },
      { name: 'Proveedor', key: 'proveedor', airtableType: 'Single line text', description: 'Pasarela de pago o modalidad' },
      { name: 'ID transacción proveedor', key: 'id_transaccion_proveedor', airtableType: 'Single line text', description: 'Identificador retornado por la pasarela' },
      { name: 'Clave de idempotencia', key: 'clave_idempotencia', airtableType: 'Single line text', description: 'Previene cobros duplicados', required: true },
      { name: 'Importe', key: 'importe', airtableType: 'Number', description: 'Monto de la transacción' },
      { name: 'Moneda', key: 'moneda', airtableType: 'Single line text', description: 'Código de divisa' },
      { name: 'Método', key: 'metodo', airtableType: 'Single select', description: 'Modalidad de pago', options: ['efectivo', 'enlace_de_pago'] },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Estado del cobro', options: ['pendiente', 'procesando', 'pagado', 'fallido', 'reembolso_pendiente', 'reembolsado'] },
      { name: 'Enlace de pago', key: 'enlace_de_pago', airtableType: 'URL', description: 'Enlace provisto por la pasarela externa' },
      { name: 'Fecha de confirmación', key: 'fecha_confirmacion', airtableType: 'Date with time', description: 'Momento de conciliación' },
      { name: 'Método de verificación', key: 'metodo_verificacion', airtableType: 'Single select', description: 'Canal de verificación auditado', options: ['notificacion_proveedor', 'confirmacion_manual_efectivo'] },
      { name: 'Confirmado por', key: 'confirmado_por', airtableType: 'Single line text', description: 'Identificador del operador o webhook' },
      { name: 'ID evento del proveedor', key: 'id_evento_proveedor', airtableType: 'Single line text', description: 'ID del webhook recibido' },
      { name: 'Importe reembolsado', key: 'importe_reembolsado', airtableType: 'Number', description: 'Monto devuelto si aplica' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'historial_eventos',
    name: 'Historial de eventos',
    description: 'Trazabilidad y registro de auditoría de transiciones operativas.',
    fields: [
      { name: 'ID evento', key: 'id_evento', airtableType: 'Single line text', description: 'Identificador del evento (ej. EVT-001)', required: true },
      { name: 'Viaje', key: 'viaje_id', airtableType: 'Link to another record', description: 'Viaje enlazado', linkedTable: 'Viajes', required: true },
      { name: 'Tipo de evento', key: 'tipo_evento', airtableType: 'Single line text', description: 'Nombre de la acción (ej. conductor_asigno_viaje)' },
      { name: 'Estado anterior', key: 'estado_anterior', airtableType: 'Single line text', description: 'Estado previo del viaje' },
      { name: 'Estado nuevo', key: 'estado_nuevo', airtableType: 'Single line text', description: 'Nuevo estado asignado' },
      { name: 'Fecha y hora', key: 'fecha_hora', airtableType: 'Date with time', description: 'Momento exacto del suceso' },
      { name: 'Origen', key: 'origen', airtableType: 'Single select', description: 'Sistema o persona que disparó el cambio', options: ['ManyChat', 'Make', 'operador', 'proveedor_pago'] },
      { name: 'ID operación externa', key: 'id_operacion_externa', airtableType: 'Single line text', description: 'Identificador correlativo externo' },
      { name: 'Actor o responsable', key: 'actor_responsable', airtableType: 'Single line text', description: 'Usuario, bot u operador' },
      { name: 'Resultado', key: 'resultado', airtableType: 'Single select', description: 'Resultado de la operación', options: ['correcto', 'error'] },
      { name: 'Descripción del error', key: 'descripcion_error', airtableType: 'Long text', description: 'Detalle de fallo sin secretos ni tokens' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'incidencias',
    name: 'Incidencias',
    description: 'Gestión de reclamos, alertas de despacho o anomalías de viaje.',
    fields: [
      { name: 'ID incidencia', key: 'id_incidencia', airtableType: 'Single line text', description: 'Identificador de incidencia (ej. INC-001)', required: true },
      { name: 'Viaje', key: 'viaje_id', airtableType: 'Link to another record', description: 'Viaje relacionado (opcional)', linkedTable: 'Viajes' },
      { name: 'Categoría', key: 'categoria', airtableType: 'Single select', description: 'Tipo de anomalía', options: ['asignacion', 'ubicacion', 'pago', 'cancelacion', 'integracion', 'soporte'] },
      { name: 'Prioridad', key: 'prioridad', airtableType: 'Single select', description: 'Urgencia de atención', options: ['baja', 'media', 'alta'] },
      { name: 'Descripción', key: 'descripcion', airtableType: 'Long text', description: 'Detalle del problema' },
      { name: 'Estado', key: 'estado', airtableType: 'Single select', description: 'Estado del ticket', options: ['abierta', 'en_proceso', 'resuelta'] },
      { name: 'Responsable', key: 'responsable', airtableType: 'Single line text', description: 'Persona asignada al caso' },
      { name: 'Fecha de resolución', key: 'fecha_resolucion', airtableType: 'Date with time', description: 'Momento de cierre' },
      { name: 'Es prueba', key: 'es_prueba', airtableType: 'Checkbox', description: 'Registro de prueba' },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    description: 'Parámetros globales de MOONI (Regla: nombre MOONI, estado pendiente, demás vacíos).',
    fields: [
      { name: 'Nombre comercial', key: 'nombre_comercial', airtableType: 'Single line text', description: 'Nombre oficial ("MOONI")', required: true },
      { name: 'Ciudad', key: 'ciudad', airtableType: 'Single line text', description: 'Ciudad principal de servicio' },
      { name: 'Zonas de cobertura', key: 'zonas_cobertura', airtableType: 'Long text', description: 'Lista o descripción de polígonos' },
      { name: 'Zona horaria', key: 'zona_horaria', airtableType: 'Single line text', description: 'Zona horaria IANA' },
      { name: 'Horarios', key: 'horarios', airtableType: 'Single line text', description: 'Ventana de operación' },
      { name: 'Moneda', key: 'moneda', airtableType: 'Single line text', description: 'Código ISO de divisa' },
      { name: 'Modo de tarifa', key: 'modo_tarifa', airtableType: 'Single select', description: 'Estrategia de pricing', options: ['fija', 'zonas', 'distancia', 'pendiente'] },
      { name: 'Reglas de tarifa', key: 'reglas_tarifa', airtableType: 'Long text', description: 'Detalle de fórmulas o tarifas base' },
      { name: 'Métodos de pago habilitados', key: 'metodos_pago_habilitados', airtableType: 'Multiple select', description: 'Métodos aceptados' },
      { name: 'Momento del cobro', key: 'momento_cobro', airtableType: 'Single line text', description: 'Al inicio o al finalizar' },
      { name: 'Política de cancelación', key: 'politica_cancelacion', airtableType: 'Long text', description: 'Condiciones de penalización' },
      { name: 'Política de reembolso', key: 'politica_reembolso', airtableType: 'Long text', description: 'Condiciones de reintegro' },
      { name: 'Contacto de soporte', key: 'contacto_soporte', airtableType: 'Single line text', description: 'Canal de atención' },
      { name: 'URL del aviso de privacidad', key: 'url_aviso_privacidad', airtableType: 'URL', description: 'Enlace web legal' },
      { name: 'Tiempo máx. respuesta a oferta', key: 'tiempo_maximo_respuesta_oferta_segundos', airtableType: 'Number', description: 'Segundos para aceptar antes de expirar' },
      { name: 'Estado de configuración', key: 'estado_configuracion', airtableType: 'Single select', description: 'Validación de parámetros', options: ['pendiente', 'validada'] },
      { name: 'Fecha de creación', key: 'fecha_creacion', airtableType: 'Created time', description: 'Timestamp de creación' },
      { name: 'Última modificación', key: 'fecha_ultima_modificacion', airtableType: 'Last modified time', description: 'Timestamp de modificación' },
    ],
  },
];

export const VISTAS_DOCUMENTACION = [
  { id: 'viajes_activos', nombre: 'Viajes activos', tabla: 'Viajes', filtro: 'Estado en [asignado, en_camino, conductor_llego, en_viaje] AND Es prueba = false' },
  { id: 'solicitudes_sin_conductor', nombre: 'Solicitudes sin conductor', tabla: 'Viajes', filtro: 'Estado en [solicitado, buscando_conductor] AND Conductor asignado IS EMPTY' },
  { id: 'viajes_requieren_operador', nombre: 'Viajes que requieren operador', tabla: 'Viajes', filtro: 'Requiere operador = true' },
  { id: 'viajes_finalizados', nombre: 'Viajes finalizados', tabla: 'Viajes', filtro: 'Estado = finalizado' },
  { id: 'viajes_cancelados', nombre: 'Viajes cancelados', tabla: 'Viajes', filtro: 'Estado = cancelado' },
  { id: 'conductores_aprobados_disponibles', nombre: 'Conductores aprobados y disponibles', tabla: 'Conductores', filtro: 'Autorización = aprobado AND Disponibilidad = disponible' },
  { id: 'conductores_pendientes_aprobacion', nombre: 'Conductores pendientes de aprobación', tabla: 'Conductores', filtro: 'Autorización = pendiente' },
  { id: 'ofertas_pendientes_vencidas', nombre: 'Ofertas pendientes y vencidas', tabla: 'Ofertas de viaje', filtro: 'Estado en [pendiente_envio, enviada, vencida]' },
  { id: 'pagos_pendientes_fallidos', nombre: 'Pagos pendientes o fallidos', tabla: 'Pagos', filtro: 'Estado en [pendiente, procesando, fallido]' },
  { id: 'reembolsos_pendientes', nombre: 'Reembolsos pendientes', tabla: 'Pagos', filtro: 'Estado = reembolso_pendiente' },
  { id: 'incidencias_abiertas', nombre: 'Incidencias abiertas', tabla: 'Incidencias', filtro: 'Estado en [abierta, en_proceso]' },
  { id: 'registros_de_prueba', nombre: 'Registros de prueba', tabla: 'Todas las tablas', filtro: 'Es prueba = true' },
];
