/**
 * MOONI — MVP Transporte — Pruebas
 * Tipos de datos, modelos relacionales y definiciones de campos para Airtable.
 */

export type ConsentimientoEstado = 'pendiente' | 'aceptado' | 'rechazado';
export type PasajeroEstado = 'activo' | 'bloqueado';

export interface Pasajero {
  id_pasajero: string;
  nombre: string;
  telefono_whatsapp: string; // Formato texto para preservar '+' y ceros
  id_contacto_manychat: string;
  consentimiento: ConsentimientoEstado;
  fecha_consentimiento: string | null;
  version_aviso_privacidad: string | null;
  estado: PasajeroEstado;
  viajes_ids: string[]; // Relación inversa con Viajes
  notas_operativas: string;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type ConductorAutorizacion = 'pendiente' | 'aprobado' | 'suspendido';
export type ConductorDisponibilidad = 'desconectado' | 'disponible' | 'reservado' | 'ocupado';

export interface Conductor {
  id_conductor: string;
  nombre: string;
  telefono_whatsapp: string;
  id_contacto_manychat: string;
  autorizacion: ConductorAutorizacion;
  disponibilidad: ConductorDisponibilidad;
  vehiculos_ids: string[]; // Relación con Vehículos
  zona_operacion: string;
  ultima_actualizacion_disponibilidad: string;
  viajes_ids: string[]; // Relación inversa con Viajes
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type VehiculoEstado = 'pendiente' | 'habilitado' | 'fuera_de_servicio';

export interface Vehiculo {
  id_vehiculo: string;
  conductor_id: string | null; // Relación con Conductor
  marca: string;
  modelo: string;
  color: string;
  placas: string;
  capacidad_pasajeros: number;
  estado: VehiculoEstado;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type ViajeEstado =
  | 'solicitado'
  | 'buscando_conductor'
  | 'asignado'
  | 'en_camino'
  | 'conductor_llego'
  | 'en_viaje'
  | 'finalizado'
  | 'cancelado'
  | 'sin_disponibilidad';

export type TipoPrecio = 'fijo' | 'estimado';
export type MetodoPago = 'efectivo' | 'enlace_de_pago';
export type EstadoPago = 'pendiente' | 'procesando' | 'pagado' | 'fallido' | 'reembolso_pendiente' | 'reembolsado';
export type CanceladoPor = 'pasajero' | 'conductor' | 'operador' | 'sistema';

export interface Viaje {
  id_viaje: string;
  clave_idempotencia: string;
  pasajero_id: string; // Enlace a un solo registro de Pasajeros
  conductor_asignado_id: string | null; // Enlace a un solo registro de Conductores
  vehiculo_asignado_id: string | null; // Enlace a un solo registro de Vehículos
  origen_direccion: string;
  referencia_recogida: string;
  origen_latitud: number | null; // Número decimal
  origen_longitud: number | null; // Número decimal
  enlace_mapa_origen: string | null;
  destino_direccion: string;
  destino_latitud: number | null; // Número decimal
  destino_longitud: number | null; // Número decimal
  enlace_mapa_destino: string | null;
  numero_pasajeros: number;
  estado: ViajeEstado;
  id_cotizacion: string | null;
  importe_cotizado: number | null; // Número decimal
  moneda: string | null; // Texto sin asumir moneda hasta configurar
  tipo_precio: TipoPrecio | null;
  metodo_pago: MetodoPago | null;
  estado_pago: EstadoPago;
  fecha_confirmacion_pasajero: string | null;
  fecha_asignacion: string | null;
  fecha_llegada: string | null;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  fecha_cancelacion: string | null;
  cancelado_por: CanceladoPor | null;
  motivo_cancelacion: string | null;
  requiere_operador: boolean;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type OfertaEstado = 'pendiente_envio' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida' | 'invalidada';

export interface OfertaViaje {
  id_oferta: string;
  viaje_id: string; // Enlace a Viajes
  conductor_id: string; // Enlace a Conductores
  estado: OfertaEstado;
  fecha_envio: string | null;
  fecha_vencimiento: string | null;
  fecha_respuesta: string | null;
  id_operacion_externa: string | null;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type MetodoVerificacionPago = 'notificacion_proveedor' | 'confirmacion_manual_efectivo';

export interface Pago {
  id_pago_interno: string;
  viaje_id: string; // Enlace a Viajes
  proveedor: string | null;
  id_transaccion_proveedor: string | null;
  clave_idempotencia: string;
  importe: number | null;
  moneda: string | null;
  metodo: MetodoPago | null;
  estado: EstadoPago;
  enlace_de_pago: string | null;
  fecha_confirmacion: string | null;
  metodo_verificacion: MetodoVerificacionPago | null;
  confirmado_por: string | null;
  id_evento_proveedor: string | null;
  importe_reembolsado: number | null;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type EventoOrigen = 'ManyChat' | 'Make' | 'operador' | 'proveedor_pago';
export type EventoResultado = 'correcto' | 'error';

export interface HistorialEvento {
  id_evento: string;
  viaje_id: string; // Enlace a Viajes
  tipo_evento: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  fecha_hora: string;
  origen: EventoOrigen;
  id_operacion_externa: string | null;
  actor_responsable: string;
  resultado: EventoResultado;
  descripcion_error: string | null;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type IncidenciaCategoria = 'asignacion' | 'ubicacion' | 'pago' | 'cancelacion' | 'integracion' | 'soporte';
export type IncidenciaPrioridad = 'baja' | 'media' | 'alta';
export type IncidenciaEstado = 'abierta' | 'en_proceso' | 'resuelta';

export interface Incidencia {
  id_incidencia: string;
  viaje_id: string | null; // Enlace opcional a Viajes
  categoria: IncidenciaCategoria;
  prioridad: IncidenciaPrioridad;
  descripcion: string;
  estado: IncidenciaEstado;
  responsable: string | null;
  fecha_resolucion: string | null;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type ModoTarifa = 'fija' | 'zonas' | 'distancia' | 'pendiente';
export type EstadoConfiguracion = 'pendiente' | 'validada';

export interface Configuracion {
  nombre_comercial: string; // "MOONI"
  ciudad: string | null;
  zonas_cobertura: string | null;
  zona_horaria: string | null;
  horarios: string | null;
  moneda: string | null;
  modo_tarifa: ModoTarifa;
  reglas_tarifa: string | null;
  metodos_pago_habilitados: string[] | null;
  momento_cobro: string | null;
  politica_cancelacion: string | null;
  politica_reembolso: string | null;
  contacto_soporte: string | null;
  url_aviso_privacidad: string | null;
  tiempo_maximo_respuesta_oferta_segundos: number | null;
  estado_configuracion: EstadoConfiguracion;
  fecha_creacion: string;
  fecha_ultima_modificacion: string;
}

export type TablaNombre =
  | 'pasajeros'
  | 'conductores'
  | 'vehiculos'
  | 'viajes'
  | 'ofertas_viaje'
  | 'pagos'
  | 'historial_eventos'
  | 'incidencias'
  | 'configuracion';

export type AirtableVistaId =
  | 'todas'
  | 'viajes_activos'
  | 'solicitudes_sin_conductor'
  | 'viajes_requieren_operador'
  | 'viajes_finalizados'
  | 'viajes_cancelados'
  | 'conductores_aprobados_disponibles'
  | 'conductores_pendientes_aprobacion'
  | 'ofertas_pendientes_vencidas'
  | 'pagos_pendientes_fallidos'
  | 'reembolsos_pendientes'
  | 'incidencias_abiertas'
  | 'registros_de_prueba';
