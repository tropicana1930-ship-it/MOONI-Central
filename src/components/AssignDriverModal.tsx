import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Car, AlertCircle } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Viaje, Conductor } from '../types/database';

interface AssignDriverModalProps {
  viaje: Viaje;
  onClose: () => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ viaje, onClose }) => {
  const { conductores, vehiculos, asignarConductor } = useDatabase();
  const [selectedConductorId, setSelectedConductorId] = useState<string>('');
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available drivers:
  // Approved AND Available
  const conductoresAprobadosDisponibles = conductores.filter(
    (c) => c.autorizacion === 'aprobado' && c.disponibilidad === 'disponible'
  );

  const conductoresNoElegibles = conductores.filter(
    (c) => c.autorizacion !== 'aprobado' || c.disponibilidad !== 'disponible'
  );

  const handleSelectConductor = (c: Conductor) => {
    if (c.autorizacion !== 'aprobado') {
      setErrorMessage(`El conductor ${c.nombre} no está aprobado. Por regla de seguridad no puede ser asignado.`);
      return;
    }
    if (c.disponibilidad !== 'disponible') {
      setErrorMessage(`El conductor ${c.nombre} tiene estatus "${c.disponibilidad}". Solo conductores disponibles pueden tomar el viaje.`);
      return;
    }

    setErrorMessage(null);
    setSelectedConductorId(c.id_conductor);
    if (c.vehiculos_ids.length > 0) {
      setSelectedVehiculoId(c.vehiculos_ids[0]);
    } else {
      setSelectedVehiculoId('');
    }
  };

  const handleConfirmAssignment = () => {
    if (!selectedConductorId) {
      setErrorMessage('Por favor selecciona un conductor aprobado y disponible.');
      return;
    }

    const res = asignarConductor(viaje.id_viaje, selectedConductorId, selectedVehiculoId || null);
    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo asignar el conductor.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-white">Asignar Conductor al Viaje</h2>
            <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 font-mono">
              <span>{viaje.id_viaje}</span>
              <span>·</span>
              <span className="truncate max-w-xs">{viaje.origen_direccion}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Security policy banner */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Regla de seguridad MOONI:</span> Solo conductores con estatus{' '}
              <span className="text-emerald-400 font-mono">aprobado</span> y disponibilidad{' '}
              <span className="text-emerald-400 font-mono">disponible</span> son elegibles para asignación. Conductores pendientes o suspendidos están bloqueados por sistema.
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Approved and Available Drivers */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Conductores Aprobados y Disponibles ({conductoresAprobadosDisponibles.length})
            </div>

            {conductoresAprobadosDisponibles.length === 0 ? (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-400 text-center">
                No hay conductores aprobados con disponibilidad inmediata. Puedes cambiar la disponibilidad o registrar nuevos conductores en la pestaña de tablas.
              </div>
            ) : (
              <div className="space-y-2">
                {conductoresAprobadosDisponibles.map((cond) => {
                  const isSelected = selectedConductorId === cond.id_conductor;
                  const vehiculo = vehiculos.find((v) => cond.vehiculos_ids.includes(v.id_vehiculo));

                  return (
                    <div
                      key={cond.id_conductor}
                      onClick={() => handleSelectConductor(cond)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-white bg-neutral-800'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 text-xs font-bold">
                            ✓
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{cond.nombre}</div>
                            <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{cond.id_conductor}</span>
                              <span>·</span>
                              <span>{cond.zona_operacion || 'Zona metropolitana'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                            {cond.disponibilidad}
                          </span>
                        </div>
                      </div>

                      {vehiculo && (
                        <div className="mt-2.5 pt-2 border-t border-neutral-850 flex items-center gap-2 text-xs text-neutral-400">
                          <Car className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {vehiculo.marca} {vehiculo.modelo} ({vehiculo.color}) · Capacidad {vehiculo.capacidad_pasajeros} pax
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ineligible drivers notice */}
          {conductoresNoElegibles.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Conductores no elegibles actualmente ({conductoresNoElegibles.length})
              </div>
              <div className="space-y-1.5">
                {conductoresNoElegibles.map((cond) => (
                  <div
                    key={cond.id_conductor}
                    onClick={() => handleSelectConductor(cond)}
                    className="p-2.5 rounded-lg border border-neutral-850 bg-neutral-950/50 flex items-center justify-between text-xs text-neutral-500 cursor-not-allowed"
                  >
                    <div>
                      <span className="font-medium text-neutral-400">{cond.nombre}</span>
                      <span className="ml-2 font-mono text-[11px] text-neutral-500">{cond.id_conductor}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-neutral-500">Autorización: {cond.autorizacion}</span>
                      <span>·</span>
                      <span className="text-neutral-500">Estado: {cond.disponibilidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAssignment}
            disabled={!selectedConductorId}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              selectedConductorId
                ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Confirmar Asignación
          </button>
        </div>
      </div>
    </div>
  );
};
