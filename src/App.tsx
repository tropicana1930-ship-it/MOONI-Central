import React, { useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Header } from './components/Header';
import { DispatchCentral } from './components/DispatchCentral';
import { AirtableBaseView } from './components/AirtableBaseView';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { IntegrationsReport } from './components/IntegrationsReport';

export default function App() {
  const [tabActiva, setTabActiva] = useState<'despacho' | 'airtable' | 'whatsapp' | 'auditoria'>('despacho');

  return (
    <DatabaseProvider>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
        <Header
          tabActiva={tabActiva}
          setTabActiva={setTabActiva}
          onAbrirNuevaSolicitud={() => setTabActiva('whatsapp')}
        />

        <main className="flex-1">
          {tabActiva === 'despacho' && <DispatchCentral />}
          {tabActiva === 'airtable' && <AirtableBaseView />}
          {tabActiva === 'whatsapp' && <WhatsAppSimulator />}
          {tabActiva === 'auditoria' && <IntegrationsReport />}
        </main>

        <footer className="border-t border-neutral-800 bg-neutral-950 py-4 px-6 text-center text-xs text-neutral-500 font-mono">
          <span>MOONI — MVP Transporte — Pruebas · Entorno de Validación y Despacho · Base de Pruebas</span>
        </footer>
      </div>
    </DatabaseProvider>
  );
}
