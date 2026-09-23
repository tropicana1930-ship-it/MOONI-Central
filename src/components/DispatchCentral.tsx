import React, { useState } from 'react';
import {
  Car,
  Clock,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  Ban,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Viaje, ViajeEstado } from '../types/database';
import { AssignDriverModal } from './AssignDriverModal';
import { NewIncidentModal } from './NewIncidentModal';

export const DispatchCentral: React.FC = () => {
  const {
    viajes,
    pasajeros,
    conductores,
    vehiculos,
    pagos,
    historial,
    incidencias,
    filtroPrueba,
    cambiarEstadoViaje,
    desasignarConductor,
    toggleRequiereOperador,
    confirmarPagoManualEfectivo,
  } = useDatabase();

  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState<string>(viajes[0]?.id_viaje || '');
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [modalIncidenciaAbierto, setModalIncidenciaAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filter trips based on testing mode
  const viajesFiltradosPorPrueba = viajes.filter((v) => {
    if (filtroPrueba === 'excluir_pruebas') return !v.es_prueba;
    if (filtroPrueba === 'solo_pruebas') return v.es_prueba;
    return true;
  });

  // Filter by state
  const viajesVisibles = viajesFiltradosPorPrueba.filter((v) => {
    if (filtroEstado === 'sin_asignar') return v.estado === 'solicitado' || v.estado === 'buscando_conductor';
    if (filtroEstado === 'activos') return ['asignado', 'en_camino', 'conductor_llego', 'en_viaje'].includes(v.estado);
    if (filtroEstado === 'requiere_operador') return v.requiere_operador;
    if (filtroEstado === 'finalizados') return v.estado === 'finalizado';
    if (filtroEstado === 'cancelados') return v.estado === 'cancelado';
    return true;
  }).filter((v) => {
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    const pasajero = pasajeros.find((p) => p.id_pasajero === v.pasajero_id);
    return (
      v.id_viaje.toLowerCase().includes(term) ||
      v.origen_direccion.toLowerCase().includes(term) ||
      v.destino_direccion.toLowerCase().includes(term) ||
      (pasajero && pasajero.nombre.toLowerCase().includes(term))
    );
  });

  const viajeActual = viajes.find((v) => v.id_viaje === viajeSeleccionadoId) || viajesVisibles[0];
  const pasajeroActual = viajeActual ? pasajeros.find((p) => p.id_pasajero === viajeActual.pasajero_id) : null;
  const conductorActual = viajeActual && viajeActual.conductor_asignado_id ? conductores.find((c) => c.id_conductor === viajeActual.conductor_asignado_id) : null;
  const vehiculoActual = viajeActual && viajeActual.vehiculo_asignado_id ? vehiculos.find((v) => v.id_vehiculo === viajeActual.vehiculo_asignado_id) : null;
  const pagoActual = viajeActual ? pagos.find((p) => p.viaje_id === viajeActual.id_viaje) : null;
  const historialActual = viajeActual ? historial.filter((h) => h.viaje_id === viajeActual.id_viaje) : [];
  const incidenciasActuales = viajeActual ? incidencias.filter((i) => i.viaje_id === viajeActual.id_viaje) : [];

  // Metrics (Strict rule: No inventar tarifas ni sumar cotizaciones como cobros reales)
  const totalActivos = viajesFiltradosPorPrueba.filter((v) => ['asignado', 'en_camino', 'conductor_llego', 'en_viaje'].includes(v.estado)).length;
  const totalSinAsignar = viajesFiltradosPorPrueba.filter((v) => ['solicitado', 'buscando_conductor'].includes(v.estado)).length;
  const totalRequierenOperador = viajesFiltradosPorPrueba.filter((v) => v.requiere_operador && !['finalizado', 'cancelado'].includes(v.estado)).length;
  const conductoresDisponiblesAprobados = conductores.filter((c) => c.autorizacion === 'aprobado' && c.disponibilidad === 'disponible').length;
  const pagosVerificadosEfectivo = pagos.filter((p) => p.estado === 'pagado').length;
  const pagosPendientes = pagos.filter((p) => ['pendiente', 'procesando'].includes(p.estado)).length;

  const handleNextState = () => {
    if (!viajeActual) return;
    const currentState = viajeActual.estado;

    if (currentState === 'solicitado') cambiarEstadoViaje(viajeActual.id_viaje, 'buscando_conductor');
    else if (currentState === 'buscando_conductor') {
      setModalAsignarAbierto(true);
    } else if (currentState === 'asignado') cambiarEstadoViaje(viajeActual.id_viaje, 'en_camino');
    else if (currentState === 'en_camino') cambiarEstadoViaje(viajeActual.id_viaje, 'conductor_llego');
    else if (currentState === 'conductor_llego') cambiarEstadoViaje(viajeActual.id_viaje, 'en_viaje');
    else if (currentState === 'en_viaje') cambiarEstadoViaje(viajeActual.id_viaje, 'finalizado');
  };

  const handleCancelTrip = () => {
    if (!viajeActual) return;
    const motivo = prompt('Motivo de cancelación del viaje:');
    if (motivo !== null) {
      cambiarEstadoViaje(viajeActual.id_viaje, 'cancelado', {
        canceladoPor: 'operador',
        motivoCancelacion: motivo || 'Cancelación manual por operador central',
      });
    }
  };

  const getBadgeClassForState = (estado: ViajeEstado) => {
    switch (estado) {
      case 'solicitado':
      case 'buscando_conductor':
        return 'text-amber-400 bg-amber-950/40 border border-amber-800/60';
      case 'asignado':
      case 'en_camino':
      case 'conductor_llego':
        return 'text-sky-400 bg-sky-950/40 border border-sky-800/60';
      case 'en_viaje':
        return 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60';
      case 'finalizado':
        return 'text-neutral-300 bg-neutral-800 border border-neutral-700';
      case 'cancelado':
      case 'sin_disponibilidad':
        return 'text-red-400 bg-red-950/40 border border-red-800/60';
      default:
        return 'text-neutral-400 bg-neutral-900 border border-neutral-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* KPI Overview Banner (No fake scoreboard, clean operational counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400 font-medium">Viajes Activos</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">{totalActivos}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">En asignación o ruta</div>
        </div>

        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-amber-400 font-medium">Sin Conductor</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">{totalSinAsignar}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Esperando asignación</div>
        </div>

        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-emerald-400 font-medium">Conductores Libres</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {conductoresDisponiblesAprobados}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Aprobados y listos</div>
        </div>

        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-red-400 font-medium">Requieren Operador</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-1">{totalRequierenOperador}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Intervención manual</div>
        </div>

        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400 font-medium">Pagos Pendientes</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">{pagosPendientes}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">En proceso o efectivo</div>
        </div>

        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-400 font-medium">Pagados Verificados</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">{pagosVerificadosEfectivo}</div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Confirmados auditados</div>
        </div>
      </div>

      {/* Main Operations Split: Left Queue / Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trip Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-white">Cola de Despacho</h2>
            <span className="text-xs font-mono text-neutral-500">{viajesVisibles.length} solicitudes</span>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por ID, pasajero o dirección..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-neutral-700"
            />

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'sin_asignar', label: 'Sin Asignar' },
                { id: 'activos', label: 'Activos' },
                { id: 'requiere_operador', label: 'Requiere Operador' },
                { id: 'finalizados', label: 'Finalizados' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltroEstado(f.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs ${
                    filtroEstado === f.id
                      ? 'bg-white text-neutral-950 font-semibold'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Cards List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {viajesVisibles.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-400">
                No hay viajes en esta vista. Puedes crear una nueva solicitud desde el Simulador WhatsApp o cambiar el filtro.
              </div>
            ) : (
              viajesVisibles.map((viaje) => {
                const isSelected = viajeActual?.id_viaje === viaje.id_viaje;
                const pas = pasajeros.find((p) => p.id_pasajero === viaje.pasajero_id);
                const cond = conductores.find((c) => c.id_conductor === viaje.conductor_asignado_id);

                return (
                  <div
                    key={viaje.id_viaje}
                    onClick={() => setViajeSeleccionadoId(viaje.id_viaje)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'bg-neutral-900 border-white shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white">{viaje.id_viaje}</span>
                        {viaje.requiere_operador && (
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono">
                            OPERADOR
                          </span>
                        )}
                        {viaje.es_prueba && (
                          <span className="text-[10px] text-neutral-500 font-mono">Prueba</span>
                        )}
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded capitalize ${getBadgeClassForState(viaje.estado)}`}>
                        {viaje.estado.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-medium text-neutral-200 truncate">
                      {pas?.nombre || 'Pasajero no especificado'}
                    </div>

                    <div className="mt-1 space-y-1 text-xs text-neutral-400">
                      <div className="flex items-start gap-1.5 truncate">
                        <span className="text-neutral-500 shrink-0">De:</span>
                        <span className="truncate">{viaje.origen_direccion}</span>
                      </div>
                      <div className="flex items-start gap-1.5 truncate">
                        <span className="text-neutral-500 shrink-0">A:</span>
                        <span className="truncate">{viaje.destino_direccion}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>{cond ? cond.nombre : 'Sin conductor'}</span>
                      <span>
                        {viaje.importe_cotizado !== null
                          ? `${viaje.importe_cotizado} ${viaje.moneda || 'MXN'}`
                          : 'Sin cotizar'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Trip Inspector & Operator Action Station */}
        <div className="lg:col-span-7">
          {viajeActual ? (
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
              {/* Header Bar */}
              <div className="p-5 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">{viajeActual.id_viaje}</h3>
                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded capitalize ${getBadgeClassForState(viajeActual.estado)}`}>
                      {viajeActual.estado.replace('_', ' ')}
                    </span>
                    {viajeActual.es_prueba && (
                      <span className="text-xs text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded font-mono">
                        Registro de prueba
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2 font-mono">
                    <span>Clave Idempotencia: {viajeActual.clave_idempotencia}</span>
                  </div>
                </div>

                {/* Operator quick toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRequiereOperador(viajeActual.id_viaje)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                      viajeActual.requiere_operador
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{viajeActual.requiere_operador ? 'Quitar Alerta Operador' : 'Marcar Operador'}</span>
                  </button>

                  <button
                    onClick={() => setModalIncidenciaAbierto(true)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white transition-colors"
                  >
                    + Incidencia
                  </button>
                </div>
              </div>

              {/* Lifecycle Progression Control (Uber-style) */}
              <div className="p-5 bg-neutral-900/30">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Progresión del Viaje (Operación Despacho)
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {viajeActual.estado !== 'finalizado' && viajeActual.estado !== 'cancelado' && (
                    <>
                      {viajeActual.estado === 'solicitado' && (
                        <button
                          onClick={handleNextState}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Pasar a Buscando Conductor</span>
                        </button>
                      )}

                      {viajeActual.estado === 'buscando_conductor' && (
                        <button
                          onClick={() => setModalAsignarAbierto(true)}
                          className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Asignar Conductor Aprobado</span>
                        </button>
                      )}

                      {viajeActual.estado === 'asignado' && (
                        <button
                          onClick={handleNextState}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Marcar: Conductor en Camino</span>
                        </button>
                      )}

                      {viajeActual.estado === 'en_camino' && (
                        <button
                          onClick={handleNextState}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Marcar: Conductor Llegó al Punto</span>
                        </button>
                      )}

                      {viajeActual.estado === 'conductor_llego' && (
                        <button
                          onClick={handleNextState}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar Viaje (Pasajero a bordo)</span>
                        </button>
                      )}

                      {viajeActual.estado === 'en_viaje' && (
                        <button
                          onClick={handleNextState}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Finalizar Viaje con Éxito</span>
                        </button>
                      )}

                      <button
                        onClick={handleCancelTrip}
                        className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancelar Viaje</span>
                      </button>
                    </>
                  )}

                  {viajeActual.estado === 'finalizado' && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Este viaje ha sido completado y cerrado operativamente.</span>
                    </div>
                  )}

                  {viajeActual.estado === 'cancelado' && (
                    <div className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                      <XCircle className="w-4 h-4" />
                      <span>Viaje cancelado por: {viajeActual.cancelado_por || 'operador'}. Motivo: {viajeActual.motivo_cancelacion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Details: Passenger & Route */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Passenger Section */}
                <div className="space-y-3">
                  <div className="font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Pasajero</span>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1.5">
                    <div className="text-sm font-semibold text-white">
                      {pasajeroActual ? pasajeroActual.nombre : 'No registrado'}
                    </div>
                    <div className="text-neutral-400 font-mono">
                      WhatsApp: {pasajeroActual?.telefono_whatsapp || '(Vacío en pruebas)'}
                    </div>
                    <div className="text-neutral-500 font-mono text-[11px]">
                      ManyChat ID: {pasajeroActual?.id_contacto_manychat || 'N/A'}
                    </div>
                    <div className="pt-1 flex items-center gap-1 text-[11px]">
                      <span className="text-neutral-500">Consentimiento:</span>
                      <span className={`font-mono ${pasajeroActual?.consentimiento === 'aceptado' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {pasajeroActual?.consentimiento || 'pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Route Section */}
                <div className="space-y-3">
                  <div className="font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Ruta & Ubicación</span>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-mono">Origen</div>
                      <div className="text-white font-medium">{viajeActual.origen_direccion}</div>
                      {viajeActual.referencia_recogida && (
                        <div className="text-neutral-400 text-[11px] mt-0.5 italic">
                          Ref: {viajeActual.referencia_recogida}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase font-mono">Destino</div>
                      <div className="text-white font-medium">{viajeActual.destino_direccion}</div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>Pasajeros: {viajeActual.numero_pasajeros}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viajeActual.origen_direccion)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>Ver en Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Card: Driver & Vehicle */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Conductor & Vehículo Asignado</span>
                  </div>

                  {conductorActual && viajeActual.estado !== 'finalizado' && viajeActual.estado !== 'cancelado' && (
                    <button
                      onClick={() => desasignarConductor(viajeActual.id_viaje)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Desasignar
                    </button>
                  )}
                </div>

                {conductorActual ? (
                  <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{conductorActual.nombre}</span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                          {conductorActual.autorizacion}
                        </span>
                      </div>
                      <div className="text-neutral-400 font-mono mt-0.5">
                        ID: {conductorActual.id_conductor} · ManyChat: {conductorActual.id_contacto_manychat}
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-1">
                        Vehículo: {vehiculoActual ? `${vehiculoActual.marca} ${vehiculoActual.modelo} (${vehiculoActual.color}) · Cap: ${vehiculoActual.capacidad_pasajeros}` : 'Sin vehículo asignado'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-neutral-500 font-mono">Disponibilidad actual</div>
                      <div className="text-xs text-emerald-400 font-mono font-medium capitalize">
                        {conductorActual.disponibilidad}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-900/60 border border-dashed border-neutral-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-neutral-400">No hay conductor asignado a este viaje.</span>
                    <button
                      onClick={() => setModalAsignarAbierto(true)}
                      className="px-3 py-1.5 bg-white text-neutral-950 font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      Asignar Conductor
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Section & Cash Verification */}
              <div className="p-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Estado Financiero & Cobro</span>
                </div>

                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {viajeActual.importe_cotizado !== null
                        ? `${viajeActual.importe_cotizado} ${viajeActual.moneda || 'MXN'}`
                        : 'Cotización pendiente'}
                    </div>
                    <div className="text-neutral-400 font-mono text-[11px] mt-0.5 flex items-center gap-2">
                      <span>Método: {viajeActual.metodo_pago || 'No acordado'}</span>
                      <span>·</span>
                      <span className="capitalize">Estatus: {viajeActual.estado_pago}</span>
                    </div>
                    {pagoActual?.metodo_verificacion && (
                      <div className="text-[11px] text-neutral-500 font-mono mt-1">
                        Verificación: {pagoActual.metodo_verificacion} (por {pagoActual.confirmado_por})
                      </div>
                    )}
                  </div>

                  {viajeActual.metodo_pago === 'efectivo' && viajeActual.estado_pago !== 'pagado' && pagoActual && (
                    <button
                      onClick={() => confirmarPagoManualEfectivo(pagoActual.id_pago_interno, 'Operador Central MOONI')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Confirmar Cobro Efectivo (Manual)
                    </button>
                  )}

                  {viajeActual.metodo_pago === 'enlace_de_pago' && viajeActual.estado_pago !== 'pagado' && (
                    <div className="text-[11px] text-neutral-400 italic">
                      Enlace de pago externo pendiente de verificación vía webhook autenticado.
                    </div>
                  )}
                </div>
              </div>

              {/* Incidents on this trip */}
              {incidenciasActuales.length > 0 && (
                <div className="p-5 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Incidencias Registradas ({incidenciasActuales.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {incidenciasActuales.map((inc) => (
                      <div
                        key={inc.id_incidencia}
                        className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white capitalize">{inc.categoria}</span>
                          <span className="font-mono text-[11px] text-amber-400 uppercase">{inc.prioridad}</span>
                        </div>
                        <p className="text-neutral-300">{inc.descripcion}</p>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          Responsable: {inc.responsable || 'Sin asignar'} · Estado: {inc.estado}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div className="p-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Historial de Eventos (Trazabilidad)</span>
                </div>

                <div className="space-y-2">
                  {historialActual.length === 0 ? (
                    <div className="text-xs text-neutral-500">Sin eventos auditados para este registro.</div>
                  ) : (
                    historialActual.map((evt) => (
                      <div
                        key={evt.id_evento}
                        className="p-2.5 bg-neutral-900/60 border border-neutral-850 rounded-lg text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            <span>{evt.tipo_evento.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ({evt.origen})
                            </span>
                          </div>
                          <div className="text-neutral-400 text-[11px] mt-0.5">
                            {evt.estado_anterior ? `${evt.estado_anterior} → ` : ''}
                            <span className="text-emerald-400">{evt.estado_nuevo}</span>
                            {` por ${evt.actor_responsable}`}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                          {new Date(evt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400">
              Selecciona un viaje de la cola para inspeccionar sus datos.
            </div>
          )}
        </div>
      </div>

      {modalAsignarAbierto && viajeActual && (
        <AssignDriverModal
          viaje={viajeActual}
          onClose={() => setModalAsignarAbierto(false)}
        />
      )}

      {modalIncidenciaAbierto && viajeActual && (
        <NewIncidentModal
          viajeId={viajeActual.id_viaje}
          onClose={() => setModalIncidenciaAbierto(false)}
        />
      )}
    </div>
  );
};
