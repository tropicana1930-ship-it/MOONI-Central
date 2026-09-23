import React from 'react';
import {
  Car,
  TableProperties,
  MessageSquare,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useDatabase, FiltroPruebaModo } from '../context/DatabaseContext';

interface HeaderProps {
  tabActiva: 'despacho' | 'airtable' | 'whatsapp' | 'auditoria';
  setTabActiva: (tab: 'despacho' | 'airtable' | 'whatsapp' | 'auditoria') => void;
  onAbrirNuevaSolicitud: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabActiva,
  setTabActiva,
  onAbrirNuevaSolicitud,
}) => {
  const { filtroPrueba, setFiltroPrueba, resetearDatos, viajes, incidencias } = useDatabase();

  const viajesRequierenOperador = viajes.filter((v) => v.requiere_operador && v.estado !== 'finalizado' && v.estado !== 'cancelado').length;
  const incidenciasAbiertas = incidencias.filter((i) => i.estado === 'abierta').length;

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
            MOONI Central
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setTabActiva('despacho')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              tabActiva === 'despacho'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Central de Despacho</span>
            {viajesRequierenOperador > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Requiere operador" />
            )}
          </button>

          <button
            onClick={() => setTabActiva('airtable')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              tabActiva === 'airtable'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Tablas Airtable</span>
          </button>

          <button
            onClick={() => setTabActiva('whatsapp')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              tabActiva === 'whatsapp'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Simulador WhatsApp</span>
          </button>

          <button
            onClick={() => setTabActiva('auditoria')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
              tabActiva === 'auditoria'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Informe & Auditoría</span>
            {incidenciasAbiertas > 0 && (
              <span className="text-xs text-amber-400 font-mono">({incidenciasAbiertas})</span>
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Segmented filter control for test records */}
          <div className="hidden lg:flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFiltroPrueba('incluir_pruebas')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                filtroPrueba === 'incluir_pruebas'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Muestra registros de prueba y reales juntos"
            >
              Con Pruebas
            </button>
            <button
              onClick={() => setFiltroPrueba('excluir_pruebas')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                filtroPrueba === 'excluir_pruebas'
                  ? 'bg-neutral-800 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Regla: excluir registros con Es prueba = true"
            >
              Solo Operativos
            </button>
            <button
              onClick={() => setFiltroPrueba('solo_pruebas')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                filtroPrueba === 'solo_pruebas'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Solo registros de prueba"
            >
              Solo Pruebas
            </button>
          </div>

          <button
            onClick={resetearDatos}
            title="Restablecer base a datos de prueba iniciales"
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg border border-neutral-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onAbrirNuevaSolicitud}
            className="px-3.5 py-1.5 bg-white text-neutral-950 font-medium text-xs rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span>+ Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800 bg-neutral-950 py-2 px-3 text-xs">
        <button
          onClick={() => setTabActiva('despacho')}
          className={`flex flex-col items-center gap-1 ${tabActiva === 'despacho' ? 'text-white font-medium' : 'text-neutral-400'}`}
        >
          <Car className="w-4 h-4" />
          <span>Despacho</span>
        </button>
        <button
          onClick={() => setTabActiva('airtable')}
          className={`flex flex-col items-center gap-1 ${tabActiva === 'airtable' ? 'text-white font-medium' : 'text-neutral-400'}`}
        >
          <TableProperties className="w-4 h-4" />
          <span>Airtable</span>
        </button>
        <button
          onClick={() => setTabActiva('whatsapp')}
          className={`flex flex-col items-center gap-1 ${tabActiva === 'whatsapp' ? 'text-white font-medium' : 'text-neutral-400'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </button>
        <button
          onClick={() => setTabActiva('auditoria')}
          className={`flex flex-col items-center gap-1 ${tabActiva === 'auditoria' ? 'text-white font-medium' : 'text-neutral-400'}`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Auditoría</span>
        </button>
      </div>
    </header>
  );
};
