import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { IncidenciaCategoria, IncidenciaPrioridad } from '../types/database';

interface NewIncidentModalProps {
  viajeId?: string;
  onClose: () => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ viajeId, onClose }) => {
  const { registrarIncidencia } = useDatabase();
  const [categoria, setCategoria] = useState<IncidenciaCategoria>('asignacion');
  const [prioridad, setPrioridad] = useState<IncidenciaPrioridad>('media');
  const [descripcion, setDescripcion] = useState('');
  const [responsable, setResponsable] = useState('Operador Central MOONI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;

    registrarIncidencia({
      viaje_id: viajeId || null,
      categoria,
      prioridad,
      descripcion: descripcion.trim(),
      estado: 'abierta',
      responsable,
      fecha_resolucion: null,
      es_prueba: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-semibold text-white">Registrar Incidencia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {viajeId && (
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300">
              Viaje asociado: <span className="text-white font-semibold">{viajeId}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as IncidenciaCategoria)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-neutral-600"
            >
              <option value="asignacion">Asignación de conductor</option>
              <option value="ubicacion">Ubicación / Geocodificación</option>
              <option value="pago">Pago / Cobro</option>
              <option value="cancelacion">Cancelación</option>
              <option value="integracion">Integración / Webhook</option>
              <option value="soporte">Atención a cliente / Soporte</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {(['baja', 'media', 'alta'] as IncidenciaPrioridad[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    prioridad === p
                      ? 'border-white bg-neutral-800 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Descripción de la anomalía</label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe lo ocurrido sin incluir secretos, tokens ni contraseñas..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-hidden focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Responsable asignado</label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-neutral-600"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors"
            >
              Guardar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
