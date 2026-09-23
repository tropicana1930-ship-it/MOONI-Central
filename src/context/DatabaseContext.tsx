import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Pasajero,
  Conductor,
  Vehiculo,
  Viaje,
  OfertaViaje,
  Pago,
  HistorialEvento,
  Incidencia,
  Configuracion,
  ViajeEstado,
  CanceladoPor,
} from '../types/database';
import {
  PASAJEROS_INICIALES,
  CONDUCTORES_INICIALES,
  VEHICULOS_INICIALES,
  VIAJES_INICIALES,
  OFERTAS_INICIALES,
  PAGOS_INICIALES,
  HISTORIAL_INICIAL,
  INCIDENCIAS_INICIALES,
  CONFIGURACION_INICIAL,
} from '../data/initialData';

const STORAGE_KEY = 'mooni_mvp_airtable_db_v1';

export type FiltroPruebaModo = 'excluir_pruebas' | 'incluir_pruebas' | 'solo_pruebas';

interface DatabaseContextType {
  pasajeros: Pasajero[];
  conductores: Conductor[];
  vehiculos: Vehiculo[];
  viajes: Viaje[];
  ofertas: OfertaViaje[];
  pagos: Pago[];
  historial: HistorialEvento[];
  incidencias: Incidencia[];
  configuracion: Configuracion;
  filtroPrueba: FiltroPruebaModo;
  setFiltroPrueba: (modo: FiltroPruebaModo) => void;
  resetearDatos: () => void;
  asignarConductor: (viajeId: string, conductorId: string, vehiculoId: string | null) => { success: boolean; error?: string };
  desasignarConductor: (viajeId: string) => void;
  cambiarEstadoViaje: (
    viajeId: string,
    nuevoEstado: ViajeEstado,
    detalles?: { canceladoPor?: CanceladoPor; motivoCancelacion?: string; actor?: string }
  ) => void;
  toggleRequiereOperador: (viajeId: string) => void;
  confirmarPagoManualEfectivo: (pagoId: string, operadorNombre: string) => void;
  registrarIncidencia: (incidencia: Omit<Incidencia, 'id_incidencia' | 'fecha_creacion' | 'fecha_ultima_modificacion'>) => void;
  resolverIncidencia: (incidenciaId: string, responsable: string) => void;
  crearSolicitudWhatsApp: (datos: {
    nombrePasajero: string;
    telefono: string;
    origen: string;
    referencia?: string;
    destino: string;
    enlaceMapaOrigen?: string;
    enlaceMapaDestino?: string;
    numeroPasajeros: number;
    metodoPago: 'efectivo' | 'enlace_de_pago';
    consentimiento: boolean;
  }) => { viaje: Viaje; pasajero: Pasajero };
  actualizarRegistro: (tabla: string, id: string, campos: Record<string, unknown>) => void;
  actualizarConfiguracion: (campos: Partial<Configuracion>) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pasajeros, setPasajeros] = useState<Pasajero[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pasajeros`);
    return saved ? JSON.parse(saved) : PASAJEROS_INICIALES;
  });

  const [conductores, setConductores] = useState<Conductor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_conductores`);
    return saved ? JSON.parse(saved) : CONDUCTORES_INICIALES;
  });

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehiculos`);
    return saved ? JSON.parse(saved) : VEHICULOS_INICIALES;
  });

  const [viajes, setViajes] = useState<Viaje[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_viajes`);
    return saved ? JSON.parse(saved) : VIAJES_INICIALES;
  });

  const [ofertas, setOfertas] = useState<OfertaViaje[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ofertas`);
    return saved ? JSON.parse(saved) : OFERTAS_INICIALES;
  });

  const [pagos, setPagos] = useState<Pago[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pagos`);
    return saved ? JSON.parse(saved) : PAGOS_INICIALES;
  });

  const [historial, setHistorial] = useState<HistorialEvento[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_historial`);
    return saved ? JSON.parse(saved) : HISTORIAL_INICIAL;
  });

  const [incidencias, setIncidencias] = useState<Incidencia[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_incidencias`);
    return saved ? JSON.parse(saved) : INCIDENCIAS_INICIALES;
  });

  const [configuracion, setConfiguracion] = useState<Configuracion>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_configuracion`);
    return saved ? JSON.parse(saved) : CONFIGURACION_INICIAL;
  });

  // Default: 'incluir_pruebas' for testing UI, can be switched to 'excluir_pruebas'
  const [filtroPrueba, setFiltroPrueba] = useState<FiltroPruebaModo>('incluir_pruebas');

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pasajeros`, JSON.stringify(pasajeros));
  }, [pasajeros]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_conductores`, JSON.stringify(conductores));
  }, [conductores]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehiculos`, JSON.stringify(vehiculos));
  }, [vehiculos]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_viajes`, JSON.stringify(viajes));
  }, [viajes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ofertas`, JSON.stringify(ofertas));
  }, [ofertas]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pagos`, JSON.stringify(pagos));
  }, [pagos]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_historial`, JSON.stringify(historial));
  }, [historial]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_incidencias`, JSON.stringify(incidencias));
  }, [incidencias]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_configuracion`, JSON.stringify(configuracion));
  }, [configuracion]);

  const resetearDatos = () => {
    setPasajeros(PASAJEROS_INICIALES);
    setConductores(CONDUCTORES_INICIALES);
    setVehiculos(VEHICULOS_INICIALES);
    setViajes(VIAJES_INICIALES);
    setOfertas(OFERTAS_INICIALES);
    setPagos(PAGOS_INICIALES);
    setHistorial(HISTORIAL_INICIAL);
    setIncidencias(INCIDENCIAS_INICIALES);
    setConfiguracion(CONFIGURACION_INICIAL);
  };

  const asignarConductor = (viajeId: string, conductorId: string, vehiculoId: string | null): { success: boolean; error?: string } => {
    const conductor = conductores.find((c) => c.id_conductor === conductorId);
    if (!conductor) {
      return { success: false, error: 'El conductor especificado no existe.' };
    }

    // Regla estricta del usuario:
    // "No considerar disponible para asignación a un conductor que no esté aprobado."
    if (conductor.autorizacion !== 'aprobado') {
      return {
        success: false,
        error: `Regla de seguridad: El conductor ${conductor.nombre} tiene estatus de autorización "${conductor.autorizacion}". Solo conductores "aprobados" pueden ser asignados.`,
      };
    }

    // Validar disponibilidad
    if (conductor.disponibilidad !== 'disponible') {
      return {
        success: false,
        error: `El conductor no está disponible actualmente (estatus: ${conductor.disponibilidad}).`,
      };
    }

    // Seleccionar vehículo si no viene explícito
    const vehId = vehiculoId || (conductor.vehiculos_ids.length > 0 ? conductor.vehiculos_ids[0] : null);

    const now = new Date().toISOString();

    // Actualizar viaje
    setViajes((prev) =>
      prev.map((v) => {
        if (v.id_viaje === viajeId) {
          return {
            ...v,
            conductor_asignado_id: conductorId,
            vehiculo_asignado_id: vehId,
            estado: 'asignado',
            fecha_asignacion: now,
            fecha_ultima_modificacion: now,
          };
        }
        return v;
      })
    );

    // Actualizar disponibilidad del conductor a 'reservado'
    setConductores((prev) =>
      prev.map((c) => {
        if (c.id_conductor === conductorId) {
          const updatedViajes = c.viajes_ids.includes(viajeId) ? c.viajes_ids : [...c.viajes_ids, viajeId];
          return {
            ...c,
            disponibilidad: 'reservado',
            ultima_actualizacion_disponibilidad: now,
            viajes_ids: updatedViajes,
            fecha_ultima_modificacion: now,
          };
        }
        return c;
      })
    );

    // Crear oferta aceptada o registrar en ofertas
    const nuevaOfertaId = `OFR-${String(ofertas.length + 1).padStart(3, '0')}`;
    const nuevaOferta: OfertaViaje = {
      id_oferta: nuevaOfertaId,
      viaje_id: viajeId,
      conductor_id: conductorId,
      estado: 'aceptada',
      fecha_envio: now,
      fecha_vencimiento: null,
      fecha_respuesta: now,
      id_operacion_externa: 'ASIGNACION-CENTRAL-MANUAL',
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setOfertas((prev) => [nuevaOferta, ...prev]);

    // Registrar en historial de eventos
    const nuevoEventoId = `EVT-${String(historial.length + 1).padStart(3, '0')}`;
    const nuevoEvento: HistorialEvento = {
      id_evento: nuevoEventoId,
      viaje_id: viajeId,
      tipo_evento: 'conductor_asigno_viaje',
      estado_anterior: 'buscando_conductor',
      estado_nuevo: 'asignado',
      fecha_hora: now,
      origen: 'operador',
      id_operacion_externa: null,
      actor_responsable: 'Operador Central MOONI',
      resultado: 'correcto',
      descripcion_error: null,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setHistorial((prev) => [nuevoEvento, ...prev]);

    return { success: true };
  };

  const desasignarConductor = (viajeId: string) => {
    const viaje = viajes.find((v) => v.id_viaje === viajeId);
    if (!viaje || !viaje.conductor_asignado_id) return;

    const condId = viaje.conductor_asignado_id;
    const now = new Date().toISOString();

    setViajes((prev) =>
      prev.map((v) =>
        v.id_viaje === viajeId
          ? {
              ...v,
              conductor_asignado_id: null,
              vehiculo_asignado_id: null,
              estado: 'buscando_conductor',
              fecha_asignacion: null,
              fecha_ultima_modificacion: now,
            }
          : v
      )
    );

    // Liberar conductor
    setConductores((prev) =>
      prev.map((c) =>
        c.id_conductor === condId
          ? {
              ...c,
              disponibilidad: 'disponible',
              ultima_actualizacion_disponibilidad: now,
              fecha_ultima_modificacion: now,
            }
          : c
      )
    );

    // Historial
    const nuevoEventoId = `EVT-${String(historial.length + 1).padStart(3, '0')}`;
    const nuevoEvento: HistorialEvento = {
      id_evento: nuevoEventoId,
      viaje_id: viajeId,
      tipo_evento: 'desasignacion_conductor',
      estado_anterior: viaje.estado,
      estado_nuevo: 'buscando_conductor',
      fecha_hora: now,
      origen: 'operador',
      id_operacion_externa: null,
      actor_responsable: 'Operador Central MOONI',
      resultado: 'correcto',
      descripcion_error: null,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setHistorial((prev) => [nuevoEvento, ...prev]);
  };

  const cambiarEstadoViaje = (
    viajeId: string,
    nuevoEstado: ViajeEstado,
    detalles?: { canceladoPor?: CanceladoPor; motivoCancelacion?: string; actor?: string }
  ) => {
    const viaje = viajes.find((v) => v.id_viaje === viajeId);
    if (!viaje) return;

    const now = new Date().toISOString();
    const timestampsActualizados: Partial<Viaje> = {
      estado: nuevoEstado,
      fecha_ultima_modificacion: now,
    };

    if (nuevoEstado === 'conductor_llego') timestampsActualizados.fecha_llegada = now;
    if (nuevoEstado === 'en_viaje') timestampsActualizados.fecha_inicio = now;
    if (nuevoEstado === 'finalizado') timestampsActualizados.fecha_finalizacion = now;
    if (nuevoEstado === 'cancelado') {
      timestampsActualizados.fecha_cancelacion = now;
      timestampsActualizados.cancelado_por = detalles?.canceladoPor || 'operador';
      timestampsActualizados.motivo_cancelacion = detalles?.motivoCancelacion || 'Cancelado administrativamente';
    }

    setViajes((prev) =>
      prev.map((v) => (v.id_viaje === viajeId ? { ...v, ...timestampsActualizados } : v))
    );

    // Liberar conductor si finalizó o se canceló
    if (['finalizado', 'cancelado', 'sin_disponibilidad'].includes(nuevoEstado) && viaje.conductor_asignado_id) {
      setConductores((prev) =>
        prev.map((c) =>
          c.id_conductor === viaje.conductor_asignado_id
            ? {
                ...c,
                disponibilidad: 'disponible',
                ultima_actualizacion_disponibilidad: now,
                fecha_ultima_modificacion: now,
              }
            : c
        )
      );
    }

    // Registrar en Historial
    const nuevoEventoId = `EVT-${String(historial.length + 1).padStart(3, '0')}`;
    const nuevoEvento: HistorialEvento = {
      id_evento: nuevoEventoId,
      viaje_id: viajeId,
      tipo_evento: `cambio_estado_${nuevoEstado}`,
      estado_anterior: viaje.estado,
      estado_nuevo: nuevoEstado,
      fecha_hora: now,
      origen: 'operador',
      id_operacion_externa: null,
      actor_responsable: detalles?.actor || 'Operador Central MOONI',
      resultado: 'correcto',
      descripcion_error: null,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setHistorial((prev) => [nuevoEvento, ...prev]);
  };

  const toggleRequiereOperador = (viajeId: string) => {
    const now = new Date().toISOString();
    setViajes((prev) =>
      prev.map((v) =>
        v.id_viaje === viajeId
          ? {
              ...v,
              requiere_operador: !v.requiere_operador,
              fecha_ultima_modificacion: now,
            }
          : v
      )
    );
  };

  const confirmarPagoManualEfectivo = (pagoId: string, operadorNombre: string) => {
    const now = new Date().toISOString();
    let viajeAsociadoId: string | null = null;

    setPagos((prev) =>
      prev.map((p) => {
        if (p.id_pago_interno === pagoId) {
          viajeAsociadoId = p.viaje_id;
          return {
            ...p,
            estado: 'pagado',
            metodo_verificacion: 'confirmacion_manual_efectivo',
            confirmado_por: operadorNombre,
            fecha_confirmacion: now,
            fecha_ultima_modificacion: now,
          };
        }
        return p;
      })
    );

    if (viajeAsociadoId) {
      setViajes((prev) =>
        prev.map((v) =>
          v.id_viaje === viajeAsociadoId
            ? { ...v, estado_pago: 'pagado', fecha_ultima_modificacion: now }
            : v
        )
      );

      // Log de evento
      const nuevoEventoId = `EVT-${String(historial.length + 1).padStart(3, '0')}`;
      const nuevoEvento: HistorialEvento = {
        id_evento: nuevoEventoId,
        viaje_id: viajeAsociadoId,
        tipo_evento: 'confirmacion_pago_efectivo',
        estado_anterior: 'pendiente',
        estado_nuevo: 'pagado',
        fecha_hora: now,
        origen: 'operador',
        id_operacion_externa: null,
        actor_responsable: operadorNombre,
        resultado: 'correcto',
        descripcion_error: null,
        es_prueba: true,
        fecha_creacion: now,
        fecha_ultima_modificacion: now,
      };
      setHistorial((prev) => [nuevoEvento, ...prev]);
    }
  };

  const registrarIncidencia = (incidenciaData: Omit<Incidencia, 'id_incidencia' | 'fecha_creacion' | 'fecha_ultima_modificacion'>) => {
    const now = new Date().toISOString();
    const id = `INC-${String(incidencias.length + 1).padStart(3, '0')}`;
    const nueva: Incidencia = {
      ...incidenciaData,
      id_incidencia: id,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setIncidencias((prev) => [nueva, ...prev]);

    if (incidenciaData.viaje_id) {
      // Marcar en viaje que requiere operador
      toggleRequiereOperador(incidenciaData.viaje_id);
    }
  };

  const resolverIncidencia = (incidenciaId: string, responsable: string) => {
    const now = new Date().toISOString();
    setIncidencias((prev) =>
      prev.map((i) =>
        i.id_incidencia === incidenciaId
          ? {
              ...i,
              estado: 'resuelta',
              responsable,
              fecha_resolucion: now,
              fecha_ultima_modificacion: now,
            }
          : i
      )
    );
  };

  const crearSolicitudWhatsApp = (datos: {
    nombrePasajero: string;
    telefono: string;
    origen: string;
    referencia?: string;
    destino: string;
    enlaceMapaOrigen?: string;
    enlaceMapaDestino?: string;
    numeroPasajeros: number;
    metodoPago: 'efectivo' | 'enlace_de_pago';
    consentimiento: boolean;
  }): { viaje: Viaje; pasajero: Pasajero } => {
    const now = new Date().toISOString();

    // Buscar o registrar pasajero
    let pasajero = pasajeros.find(
      (p) => (p.telefono_whatsapp && p.telefono_whatsapp === datos.telefono) || p.nombre.toLowerCase() === datos.nombrePasajero.toLowerCase()
    );

    const viajeId = `VIJ-${String(viajes.length + 1).padStart(3, '0')}`;

    if (!pasajero) {
      const nuevoPasajeroId = `PAS-${String(pasajeros.length + 1).padStart(3, '0')}`;
      pasajero = {
        id_pasajero: nuevoPasajeroId,
        nombre: datos.nombrePasajero,
        telefono_whatsapp: datos.telefono,
        id_contacto_manychat: `MC-WA-${Math.floor(100000 + Math.random() * 900000)}`,
        consentimiento: datos.consentimiento ? 'aceptado' : 'pendiente',
        fecha_consentimiento: datos.consentimiento ? now : null,
        version_aviso_privacidad: 'v1.0-mvp',
        estado: 'activo',
        viajes_ids: [viajeId],
        notas_operativas: 'Pasajero registrado vía WhatsApp Simulator',
        es_prueba: true,
        fecha_creacion: now,
        fecha_ultima_modificacion: now,
      };
      setPasajeros((prev) => [pasajero!, ...prev]);
    } else {
      // Actualizar relación
      setPasajeros((prev) =>
        prev.map((p) =>
          p.id_pasajero === pasajero!.id_pasajero
            ? {
                ...p,
                viajes_ids: [...p.viajes_ids, viajeId],
                fecha_ultima_modificacion: now,
              }
            : p
        )
      );
    }

    const claveIdempotencia = `REQ-WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const nuevoViaje: Viaje = {
      id_viaje: viajeId,
      clave_idempotencia: claveIdempotencia,
      pasajero_id: pasajero.id_pasajero,
      conductor_asignado_id: null,
      vehiculo_asignado_id: null,
      origen_direccion: datos.origen,
      referencia_recogida: datos.referencia || '',
      origen_latitud: null, // Regla: no inventar coordenadas por IA
      origen_longitud: null,
      enlace_mapa_origen: datos.enlaceMapaOrigen || null,
      destino_direccion: datos.destino,
      destino_latitud: null,
      destino_longitud: null,
      enlace_mapa_destino: datos.enlaceMapaDestino || null,
      numero_pasajeros: datos.numeroPasajeros,
      estado: 'buscando_conductor',
      id_cotizacion: null,
      importe_cotizado: null,
      moneda: null, // Regla: sin asumir moneda hasta configurar
      tipo_precio: null,
      metodo_pago: datos.metodoPago,
      estado_pago: 'pendiente',
      fecha_confirmacion_pasajero: now,
      fecha_asignacion: null,
      fecha_llegada: null,
      fecha_inicio: null,
      fecha_finalizacion: null,
      fecha_cancelacion: null,
      cancelado_por: null,
      motivo_cancelacion: null,
      requiere_operador: false,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };

    setViajes((prev) => [nuevoViaje, ...prev]);

    // Crear registro de pago pendiente
    const nuevoPagoId = `PAG-${String(pagos.length + 1).padStart(3, '0')}`;
    const nuevoPago: Pago = {
      id_pago_interno: nuevoPagoId,
      viaje_id: viajeId,
      proveedor: datos.metodoPago === 'efectivo' ? 'Manual Efectivo' : 'Enlace Webhook Pendiente',
      id_transaccion_proveedor: null,
      clave_idempotencia: `PAY-IDEMP-${viajeId}`,
      importe: null,
      moneda: null,
      metodo: datos.metodoPago,
      estado: 'pendiente',
      enlace_de_pago: null,
      fecha_confirmacion: null,
      metodo_verificacion: null,
      confirmado_por: null,
      id_evento_proveedor: null,
      importe_reembolsado: null,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setPagos((prev) => [nuevoPago, ...prev]);

    // Historial
    const nuevoEventoId = `EVT-${String(historial.length + 1).padStart(3, '0')}`;
    const nuevoEvento: HistorialEvento = {
      id_evento: nuevoEventoId,
      viaje_id: viajeId,
      tipo_evento: 'solicitud_whatsapp_recibida',
      estado_anterior: null,
      estado_nuevo: 'buscando_conductor',
      fecha_hora: now,
      origen: 'ManyChat',
      id_operacion_externa: claveIdempotencia,
      actor_responsable: datos.nombrePasajero,
      resultado: 'correcto',
      descripcion_error: null,
      es_prueba: true,
      fecha_creacion: now,
      fecha_ultima_modificacion: now,
    };
    setHistorial((prev) => [nuevoEvento, ...prev]);

    return { viaje: nuevoViaje, pasajero };
  };

  const actualizarRegistro = (tabla: string, id: string, campos: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const withTimestamp = { ...campos, fecha_ultima_modificacion: now };

    if (tabla === 'pasajeros') {
      setPasajeros((prev) => prev.map((item) => (item.id_pasajero === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'conductores') {
      setConductores((prev) => prev.map((item) => (item.id_conductor === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'vehiculos') {
      setVehiculos((prev) => prev.map((item) => (item.id_vehiculo === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'viajes') {
      setViajes((prev) => prev.map((item) => (item.id_viaje === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'ofertas_viaje') {
      setOfertas((prev) => prev.map((item) => (item.id_oferta === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'pagos') {
      setPagos((prev) => prev.map((item) => (item.id_pago_interno === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'historial_eventos') {
      setHistorial((prev) => prev.map((item) => (item.id_evento === id ? { ...item, ...withTimestamp } : item)));
    } else if (tabla === 'incidencias') {
      setIncidencias((prev) => prev.map((item) => (item.id_incidencia === id ? { ...item, ...withTimestamp } : item)));
    }
  };

  const actualizarConfiguracion = (campos: Partial<Configuracion>) => {
    const now = new Date().toISOString();
    setConfiguracion((prev) => ({
      ...prev,
      ...campos,
      fecha_ultima_modificacion: now,
    }));
  };

  return (
    <DatabaseContext.Provider
      value={{
        pasajeros,
        conductores,
        vehiculos,
        viajes,
        ofertas,
        pagos,
        historial,
        incidencias,
        configuracion,
        filtroPrueba,
        setFiltroPrueba,
        resetearDatos,
        asignarConductor,
        desasignarConductor,
        cambiarEstadoViaje,
        toggleRequiereOperador,
        confirmarPagoManualEfectivo,
        registrarIncidencia,
        resolverIncidencia,
        crearSolicitudWhatsApp,
        actualizarRegistro,
        actualizarConfiguracion,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase debe ser usado dentro de DatabaseProvider');
  }
  return context;
};
