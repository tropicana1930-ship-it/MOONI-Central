import React, { useState } from 'react';
import {
  Table,
  Filter,
  Eye,
  Download,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { AIRTABLE_TABLES_SCHEMA, VISTAS_DOCUMENTACION } from '../utils/schemaMetadata';
import { TablaNombre, AirtableVistaId } from '../types/database';

export const AirtableBaseView: React.FC = () => {
  const {
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
    actualizarConfiguracion,
  } = useDatabase();

  const [tablaActiva, setTablaActiva] = useState<TablaNombre>('viajes');
  const [vistaSeleccionada, setVistaSeleccionada] = useState<AirtableVistaId>('todas');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modalExportarAbierto, setModalExportarAbierto] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Record<string, unknown> | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Switch to relevant table when a specific view is picked
  const handleSelectVista = (vistaId: AirtableVistaId) => {
    setVistaSeleccionada(vistaId);
    if (vistaId === 'viajes_activos' || vistaId === 'solicitudes_sin_conductor' || vistaId === 'viajes_requieren_operador' || vistaId === 'viajes_finalizados' || vistaId === 'viajes_cancelados') {
      setTablaActiva('viajes');
    } else if (vistaId === 'conductores_aprobados_disponibles' || vistaId === 'conductores_pendientes_aprobacion') {
      setTablaActiva('conductores');
    } else if (vistaId === 'ofertas_pendientes_vencidas') {
      setTablaActiva('ofertas_viaje');
    } else if (vistaId === 'pagos_pendientes_fallidos' || vistaId === 'reembolsos_pendientes') {
      setTablaActiva('pagos');
    } else if (vistaId === 'incidencias_abiertas') {
      setTablaActiva('incidencias');
    }
  };

  const getTablaData = () => {
    switch (tablaActiva) {
      case 'pasajeros':
        return pasajeros;
      case 'conductores':
        return conductores;
      case 'vehiculos':
        return vehiculos;
      case 'viajes':
        return viajes;
      case 'ofertas_viaje':
        return ofertas;
      case 'pagos':
        return pagos;
      case 'historial_eventos':
        return historial;
      case 'incidencias':
        return incidencias;
      case 'configuracion':
        return [configuracion];
      default:
        return [];
    }
  };

  const schemaActual = AIRTABLE_TABLES_SCHEMA.find((t) => t.id === tablaActiva) || AIRTABLE_TABLES_SCHEMA[0];
  const rawData = getTablaData();

  // Filter according to selected pre-configured view
  const filteredData = (rawData as unknown as Record<string, unknown>[]).filter((item) => {
    // 1. Check test filter
    const isTest = Boolean(item.es_prueba);
    if (vistaSeleccionada !== 'registros_de_prueba') {
      if (filtroPrueba === 'excluir_pruebas' && isTest) return false;
      if (filtroPrueba === 'solo_pruebas' && !isTest) return false;
    }

    // 2. View specific filters
    if (vistaSeleccionada === 'viajes_activos') {
      return ['asignado', 'en_camino', 'conductor_llego', 'en_viaje'].includes(String(item.estado));
    }
    if (vistaSeleccionada === 'solicitudes_sin_conductor') {
      return (
        ['solicitado', 'buscando_conductor'].includes(String(item.estado)) &&
        !item.conductor_asignado_id
      );
    }
    if (vistaSeleccionada === 'viajes_requieren_operador') {
      return Boolean(item.requiere_operador);
    }
    if (vistaSeleccionada === 'viajes_finalizados') {
      return item.estado === 'finalizado';
    }
    if (vistaSeleccionada === 'viajes_cancelados') {
      return item.estado === 'cancelado';
    }
    if (vistaSeleccionada === 'conductores_aprobados_disponibles') {
      return item.autorizacion === 'aprobado' && item.disponibilidad === 'disponible';
    }
    if (vistaSeleccionada === 'conductores_pendientes_aprobacion') {
      return item.autorizacion === 'pendiente';
    }
    if (vistaSeleccionada === 'ofertas_pendientes_vencidas') {
      return ['pendiente_envio', 'enviada', 'vencida'].includes(String(item.estado));
    }
    if (vistaSeleccionada === 'pagos_pendientes_fallidos') {
      return ['pendiente', 'procesando', 'fallido'].includes(String(item.estado));
    }
    if (vistaSeleccionada === 'reembolsos_pendientes') {
      return item.estado === 'reembolso_pendiente';
    }
    if (vistaSeleccionada === 'incidencias_abiertas') {
      return ['abierta', 'en_proceso'].includes(String(item.estado));
    }
    if (vistaSeleccionada === 'registros_de_prueba') {
      return isTest === true;
    }

    // 3. Search query
    if (terminoBusqueda) {
      const q = terminoBusqueda.toLowerCase();
      return Object.values(item).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );
    }

    return true;
  });

  const exportTableAsCSV = (tableId: TablaNombre) => {
    let dataToExport: Record<string, unknown>[] = [];
    if (tableId === 'pasajeros') dataToExport = pasajeros as unknown as Record<string, unknown>[];
    if (tableId === 'conductores') dataToExport = conductores as unknown as Record<string, unknown>[];
    if (tableId === 'vehiculos') dataToExport = vehiculos as unknown as Record<string, unknown>[];
    if (tableId === 'viajes') dataToExport = viajes as unknown as Record<string, unknown>[];
    if (tableId === 'ofertas_viaje') dataToExport = ofertas as unknown as Record<string, unknown>[];
    if (tableId === 'pagos') dataToExport = pagos as unknown as Record<string, unknown>[];
    if (tableId === 'historial_eventos') dataToExport = historial as unknown as Record<string, unknown>[];
    if (tableId === 'incidencias') dataToExport = incidencias as unknown as Record<string, unknown>[];
    if (tableId === 'configuracion') dataToExport = [configuracion] as unknown as Record<string, unknown>[];

    if (dataToExport.length === 0) return;

    const schema = AIRTABLE_TABLES_SCHEMA.find((s) => s.id === tableId);
    const headers = schema ? schema.fields.map((f) => f.name) : Object.keys(dataToExport[0]);
    const keys = schema ? schema.fields.map((f) => f.key) : Object.keys(dataToExport[0]);

    const csvRows = [
      headers.join(','),
      ...dataToExport.map((row) =>
        keys
          .map((k) => {
            const val = row[k];
            if (val === null || val === undefined) return '""';
            if (Array.isArray(val)) return `"${val.join('; ')}"`;
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MOONI_${tableId}_airtable.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySchemaJSON = () => {
    const jsonStr = JSON.stringify(AIRTABLE_TABLES_SCHEMA, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Title & Airtable Sync Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Base: “MOONI — MVP Transporte — Pruebas”
            </h1>
            <span className="text-xs bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded">
              9 Tablas · 12 Vistas
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Estructura relacional nativa con campos enlazados, trazabilidad de eventos y reglas operativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTableAsCSV(tablaActiva)}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-850 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Descargar datos actuales de esta tabla en formato CSV compatible con Airtable"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setModalExportarAbierto(true)}
            className="px-3.5 py-1.5 bg-white text-neutral-950 hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Esquema Airtable JSON</span>
          </button>
        </div>
      </div>

      {/* Tables Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-800 pb-2">
        {AIRTABLE_TABLES_SCHEMA.map((tab) => {
          const isActive = tablaActiva === tab.id;
          let count = 0;
          if (tab.id === 'pasajeros') count = pasajeros.length;
          else if (tab.id === 'conductores') count = conductores.length;
          else if (tab.id === 'vehiculos') count = vehiculos.length;
          else if (tab.id === 'viajes') count = viajes.length;
          else if (tab.id === 'ofertas_viaje') count = ofertas.length;
          else if (tab.id === 'pagos') count = pagos.length;
          else if (tab.id === 'historial_eventos') count = historial.length;
          else if (tab.id === 'incidencias') count = incidencias.length;
          else if (tab.id === 'configuracion') count = 1;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setTablaActiva(tab.id as TablaNombre);
                setVistaSeleccionada('todas');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>{tab.name}</span>
              <span className="text-[11px] font-mono text-neutral-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Views & Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-400" />
          <span className="text-xs text-neutral-400">Vista:</span>
          <select
            value={vistaSeleccionada}
            onChange={(e) => handleSelectVista(e.target.value as AirtableVistaId)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-neutral-500 font-medium"
          >
            <option value="todas">Todas las filas</option>
            <optgroup label="Vistas de Viajes">
              <option value="viajes_activos">Viajes activos</option>
              <option value="solicitudes_sin_conductor">Solicitudes sin conductor</option>
              <option value="viajes_requieren_operador">Viajes que requieren operador</option>
              <option value="viajes_finalizados">Viajes finalizados</option>
              <option value="viajes_cancelados">Viajes cancelados</option>
            </optgroup>
            <optgroup label="Vistas de Conductores">
              <option value="conductores_aprobados_disponibles">Conductores aprobados y disponibles</option>
              <option value="conductores_pendientes_aprobacion">Conductores pendientes de aprobación</option>
            </optgroup>
            <optgroup label="Vistas de Ofertas y Pagos">
              <option value="ofertas_pendientes_vencidas">Ofertas pendientes y vencidas</option>
              <option value="pagos_pendientes_fallidos">Pagos pendientes o fallidos</option>
              <option value="reembolsos_pendientes">Reembolsos pendientes</option>
            </optgroup>
            <optgroup label="Vistas de Incidencias & Auditoría">
              <option value="incidencias_abiertas">Incidencias abiertas</option>
              <option value="registros_de_prueba">Registros de prueba</option>
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Filtrar registros..."
              className="bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-neutral-600 w-52"
            />
          </div>

          <span className="text-xs font-mono text-neutral-400">
            {filteredData.length} registros
          </span>
        </div>
      </div>

      {/* Airtable Interactive Data Grid */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs text-neutral-300 border-collapse">
            <thead className="bg-neutral-900/90 text-neutral-400 font-medium sticky top-0 z-10 border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-3 font-mono text-[11px] text-neutral-500 w-10 border-r border-neutral-800 text-center">
                  #
                </th>
                {schemaActual.fields.map((field) => (
                  <th
                    key={field.key}
                    className="py-2.5 px-3.5 font-medium whitespace-nowrap border-r border-neutral-800 text-neutral-300"
                    title={`${field.name} (${field.airtableType}): ${field.description}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{field.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {field.airtableType === 'Link to another record' ? '🔗' : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-mono text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={schemaActual.fields.length + 1}
                    className="p-8 text-center text-neutral-500 font-sans text-xs"
                  >
                    No hay registros que coincidan con la vista o filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr
                    key={String(row[schemaActual.fields[0].key]) || idx}
                    onClick={() => setRegistroSeleccionado(row)}
                    className="hover:bg-neutral-900/70 transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-3 text-neutral-600 text-center border-r border-neutral-850 tabular-nums">
                      {idx + 1}
                    </td>

                    {schemaActual.fields.map((field) => {
                      const value = row[field.key];
                      return (
                        <td
                          key={field.key}
                          className="py-2 px-3.5 border-r border-neutral-850 whitespace-nowrap max-w-xs truncate"
                        >
                          {formatCellValue(value, field.airtableType)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Drawer / Modal */}
      {registroSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Detalle del Registro</h3>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Tabla: {schemaActual.name} · ID: {String(registroSeleccionado[schemaActual.fields[0].key])}
                </div>
              </div>
              <button
                onClick={() => setRegistroSeleccionado(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schemaActual.fields.map((field) => {
                  const val = registroSeleccionado[field.key];
                  return (
                    <div
                      key={field.key}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-1"
                    >
                      <div className="text-neutral-500 font-mono text-[11px] flex items-center justify-between">
                        <span>{field.name}</span>
                        <span className="text-[10px] text-neutral-600">{field.airtableType}</span>
                      </div>
                      <div className="text-white font-mono break-words">
                        {val === null || val === undefined || val === '' ? (
                          <span className="text-neutral-600 italic">Vacio</span>
                        ) : typeof val === 'boolean' ? (
                          val ? '✓ Verdadero' : '✗ Falso'
                        ) : Array.isArray(val) ? (
                          val.length > 0 ? val.join(', ') : <span className="text-neutral-600 italic">Sin enlaces</span>
                        ) : (
                          String(val)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
              <button
                onClick={() => setRegistroSeleccionado(null)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Airtable Schema Export Modal */}
      {modalExportarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Esquema JSON & Especificación para Airtable
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Estructura completa de las 9 tablas, campos, tipos y relaciones para replicar o importar.
                </p>
              </div>
              <button
                onClick={() => setModalExportarAbierto(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">schema_mooni_airtable_mvp.json</span>
                <button
                  onClick={copySchemaJSON}
                  className="px-3 py-1.5 bg-white text-neutral-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? '¡Copiado al portapapeles!' : 'Copiar Esquema JSON'}</span>
                </button>
              </div>

              <pre className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-300 max-h-96 overflow-y-auto">
                {JSON.stringify(AIRTABLE_TABLES_SCHEMA, null, 2)}
              </pre>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-2 text-neutral-400">
                <div className="font-semibold text-white">Instrucciones de Importación a Airtable:</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Crea una nueva base en blanco en Airtable llamada <span className="text-white font-mono">MOONI — MVP Transporte — Pruebas</span>.</li>
                  <li>Usa el botón "Exportar CSV" de cada pestaña para generar los archivos de datos de cada tabla.</li>
                  <li>Importa cada CSV seleccionando "Add to table" o creando la tabla con el nombre correspondiente en español.</li>
                  <li>Configura los campos de relación (Pasajero, Conductor, Vehículo, Viaje) como tipo <span className="text-white font-mono">Link to another record</span>.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
              <button
                onClick={() => setModalExportarAbierto(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatCellValue(val: unknown, type: string) {
  if (val === null || val === undefined || val === '') {
    return <span className="text-neutral-600 italic">—</span>;
  }
  if (typeof val === 'boolean') {
    return val ? (
      <span className="text-emerald-400 font-semibold">✓</span>
    ) : (
      <span className="text-neutral-600">✗</span>
    );
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-neutral-600 italic">—</span>;
    return (
      <span className="text-sky-400 underline underline-offset-2">
        {val.join(', ')}
      </span>
    );
  }
  if (type === 'Date with time' || type === 'Created time' || type === 'Last modified time') {
    try {
      const d = new Date(String(val));
      return (
        <span className="text-neutral-400">
          {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      );
    } catch {
      return String(val);
    }
  }
  return String(val);
}
