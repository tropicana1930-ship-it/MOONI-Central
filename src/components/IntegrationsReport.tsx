import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRightLeft,
  Settings,
  ShieldAlert,
  Server,
  FileText,
  Lock,
} from 'lucide-react';
import { AIRTABLE_TABLES_SCHEMA } from '../utils/schemaMetadata';

export const IntegrationsReport: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Disclaimer Header */}
      <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-white">
            ENTORNO DE PRUEBAS / NO LISTO PARA OPERAR CON PASAJEROS REALES
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            Esta base y plataforma es estrictamente un prototipo y modelo de datos operativo para validación de flujo y despacho ("MOONI — MVP Transporte — Pruebas"). No cuenta con cobro automatizado ni envío real de WhatsApp conectado. No debe emplearse con usuarios ni conductores reales en producción.
          </p>
        </div>
      </div>

      {/* 1. Lo realmente creado */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold">1. Lo Realmente Creado y Operativo</h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Se ha construido la arquitectura relacional completa en español para la base <strong className="text-white">“MOONI — MVP Transporte — Pruebas”</strong>, acompañada del panel de despacho tipo Uber y el explorador interactivo de tablas con almacenamiento persistente:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {AIRTABLE_TABLES_SCHEMA.map((t) => (
            <div key={t.id} className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>{t.name}</span>
                <span className="text-[11px] font-mono text-neutral-500">{t.fields.length} campos</span>
              </div>
              <p className="text-neutral-400 text-[11px]">{t.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 text-xs text-neutral-300 space-y-1.5">
          <div className="font-medium text-white">12 Vistas Preconfiguradas Disponibles:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-[11px] text-neutral-400">
            <div>✓ Viajes activos</div>
            <div>✓ Solicitudes sin conductor</div>
            <div>✓ Viajes requieren operador</div>
            <div>✓ Viajes finalizados</div>
            <div>✓ Viajes cancelados</div>
            <div>✓ Conductores aprobados y disponibles</div>
            <div>✓ Conductores pendientes de aprobación</div>
            <div>✓ Ofertas pendientes y vencidas</div>
            <div>✓ Pagos pendientes o fallidos</div>
            <div>✓ Reembolsos pendientes</div>
            <div>✓ Incidencias abiertas</div>
            <div>✓ Registros de prueba</div>
          </div>
        </div>
      </section>

      {/* 2. Confirmación de Relaciones entre Tablas */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <ArrowRightLeft className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-semibold">2. Confirmación de Relaciones entre Tablas</h2>
        </div>

        <div className="space-y-2.5 text-xs text-neutral-300">
          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Viaje ↔ Pasajeros:</strong> Cada Viaje enlaza a un único registro de Pasajero (<span className="font-mono text-neutral-400">pasajero_id</span>). Pasajeros tiene el campo inverso <span className="font-mono text-neutral-400">viajes_ids</span> que agrupa todo su historial de solicitudes.
            </div>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Viaje ↔ Conductor & Vehículo:</strong> Por regla estricta de negocio, un viaje tiene como máximo un conductor asignado (<span className="font-mono text-neutral-400">conductor_asignado_id</span>) y un vehículo (<span className="font-mono text-neutral-400">vehiculo_asignado_id</span>). La asignación valida que el conductor esté en estado <span className="font-mono text-emerald-400">aprobado</span> y <span className="font-mono text-emerald-400">disponible</span>.
            </div>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Conductores ↔ Vehículos:</strong> Un conductor se vincula a uno o varios vehículos (<span className="font-mono text-neutral-400">vehiculos_ids</span>); cada vehículo referencia a su conductor titular (<span className="font-mono text-neutral-400">conductor_id</span>).
            </div>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Viaje ↔ Ofertas, Pagos, Historial e Incidencias:</strong> Todos los registros hijos (<span className="font-mono text-neutral-400">viaje_id</span>) mantienen integridad referencial permitiendo auditar la oferta enviada por WhatsApp, el ticket de pago, la traza de estados y las reclamaciones.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Campos Pendientes de Configuración */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold">3. Campos Pendientes de Configuración (Regla de No Invención)</h2>
        </div>

        <p className="text-xs text-neutral-400">
          En cumplimiento estricto con las instrucciones, no se inventaron tarifas, monedas, zonas ni políticas. El registro en la tabla <strong className="text-white">Configuración</strong> fue creado con el nombre comercial <strong className="text-white">"MOONI"</strong> y estado <strong className="text-amber-400">"pendiente"</strong>, dejando vacíos los siguientes parámetros:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 p-4 rounded-lg border border-neutral-850">
          <div>• Ciudad</div>
          <div>• Zonas de cobertura (polígonos)</div>
          <div>• Zona horaria</div>
          <div>• Horarios operativos</div>
          <div>• Moneda comercial (ej. MXN, USD, COP)</div>
          <div>• Modo de tarifa (fija / zonas / distancia)</div>
          <div>• Reglas y fórmula de tarifa base</div>
          <div>• Métodos de pago habilitados</div>
          <div>• Momento del cobro</div>
          <div>• Política de cancelación</div>
          <div>• Política de reembolso</div>
          <div>• Contacto de soporte técnico</div>
          <div>• URL del aviso de privacidad oficial</div>
          <div>• Tiempo máximo de respuesta a oferta</div>
        </div>
      </section>

      {/* 4. Limitaciones de Plan o Permisos */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Lock className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-semibold">4. Limitaciones de Plan y Permisos Informadas</h2>
        </div>

        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1.5">
            <div className="font-semibold text-white">Acceso Externo Directo a Airtable:</div>
            <p className="text-neutral-400">
              En este entorno de ejecución web no se proporcionan credenciales API personales (Personal Access Token de Airtable) ni acceso OAuth a la cuenta personal de Airtable del usuario. Por tanto, para no simular en falso una creación remota en servidores de Airtable, se construyó la base nativa completa en esta aplicación con exportador de esquema JSON, exportador de CSV para cada tabla y el panel administrativo privado ("Central MOONI") tipo Uber.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1.5">
            <div className="font-semibold text-white">Permisos de Automatización y Webhooks:</div>
            <p className="text-neutral-400">
              El plan de pruebas no activa disparadores automáticos hacia el exterior (Make o Zapier) para evitar envíos no deseados de mensajes WhatsApp o cargos accidentales.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Qué falta conectar y probar */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Server className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-semibold">5. Integraciones Pendientes para Pruebas Operativas</h2>
        </div>

        <div className="space-y-2 text-xs text-neutral-300">
          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
            <strong className="text-white">1. ManyChat (Canal WhatsApp Business):</strong>
            <p className="text-neutral-400">
              Conectar el flujo conversacional de ManyChat para capturar número, nombre, confirmación de privacidad y reenviar webhooks de estado del viaje al pasajero.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
            <strong className="text-white">2. Make / n8n (Orquestación & Idempotencia):</strong>
            <p className="text-neutral-400">
              Implementar el escenario que valide la <span className="font-mono text-neutral-400">clave_idempotencia</span> para no duplicar viajes, coordine el envío de ofertas a conductores y actualice la disponibilidad en tiempo real.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
            <strong className="text-white">3. Control de Concurrencia de Ofertas:</strong>
            <p className="text-neutral-400">
              La tabla <span className="font-mono text-neutral-400">Ofertas de viaje</span> registra el envío, pero un bloqueo distribuido en el backend (Make/Redis/Database transaction) es requerido para evitar que dos conductores acepten el mismo viaje simultáneamente.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
            <strong className="text-white">4. Servicio de Mapas & Cotización:</strong>
            <p className="text-neutral-400">
              Validar direcciones mediante Google Maps Geocoding y calcular distancias en kilómetros para tarifas dinámicas una vez configuradas en la tabla Configuración.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-lg space-y-1">
            <strong className="text-white">5. Pasarela de Pagos (Stripe / Mercado Pago):</strong>
            <p className="text-neutral-400">
              Generar enlaces de pago únicos por viaje y validar webhooks firmados con llave secreta. Una captura de pantalla enviada por WhatsApp no debe considerarse como confirmación válida.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Declaración Explícita */}
      <section className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs">
        <div className="font-bold text-white text-sm">6. Declaración de Estatus Operativo</div>
        <p className="text-neutral-300 leading-relaxed">
          <strong className="text-red-400">EL SERVICIO NO ESTÁ LISTO PARA OPERAR CON PASAJEROS EN PRODUCCIÓN.</strong> Es un entorno de pruebas controlado y modelado conforme a los requerimientos de seguridad, trazabilidad de eventos y privacidad para transporte solicitado por WhatsApp.
        </p>
      </section>
    </div>
  );
};
