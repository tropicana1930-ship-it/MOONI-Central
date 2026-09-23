import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  CheckCheck,
  MapPin,
  Car,
  User,
  CreditCard,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const WhatsAppSimulator: React.FC = () => {
  const { crearSolicitudWhatsApp, viajes, conductores, vehiculos } = useDatabase();

  // Form inputs for simulation
  const [nombre, setNombre] = useState('Pasajero Demo');
  const [telefono, setTelefono] = useState('+5215500000000');
  const [origen, setOrigen] = useState('Calle Durango 210, Col. Roma');
  const [referencia, setReferencia] = useState('Frente al café en la esquina');
  const [destino, setDestino] = useState('Av. Insurgentes Sur 1602, Crédito Constructor');
  const [enlaceMapa, setEnlaceMapa] = useState('');
  const [numeroPasajeros, setNumeroPasajeros] = useState(1);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'enlace_de_pago'>('efectivo');
  const [consentimiento, setConsentimiento] = useState(true);

  // Active simulated trip ID to track notifications
  const [viajeIdSimulado, setViajeIdSimulado] = useState<string | null>(
    viajes[0]?.id_viaje || null
  );
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const viajeActivo = viajes.find((v) => v.id_viaje === viajeIdSimulado) || viajes[0];
  const conductorAsignado = viajeActivo && viajeActivo.conductor_asignado_id
    ? conductores.find((c) => c.id_conductor === viajeActivo.conductor_asignado_id)
    : null;
  const vehiculoAsignado = viajeActivo && viajeActivo.vehiculo_asignado_id
    ? vehiculos.find((v) => v.id_vehiculo === viajeActivo.vehiculo_asignado_id)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !origen.trim() || !destino.trim()) return;

    const res = crearSolicitudWhatsApp({
      nombrePasajero: nombre.trim(),
      telefono: telefono.trim(),
      origen: origen.trim(),
      referencia: referencia.trim(),
      destino: destino.trim(),
      enlaceMapaOrigen: enlaceMapa.trim() || undefined,
      numeroPasajeros,
      metodoPago,
      consentimiento,
    });

    setViajeIdSimulado(res.viaje.id_viaje);
    setMensajeExito(`¡Solicitud recibida! Se creó el registro ${res.viaje.id_viaje} en la tabla Viajes.`);
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // Build the message preview according to the trip's state
  const getSimulatedNotificationMessage = () => {
    if (!viajeActivo) return 'No hay viajes activos para previsualizar.';

    switch (viajeActivo.estado) {
      case 'solicitado':
        return `🤖 *MOONI Transporte*\nHola ${nombre}, recibimos tu solicitud de viaje:\n📍 *Origen:* ${viajeActivo.origen_direccion}\n🎯 *Destino:* ${viajeActivo.destino_direccion}\n👥 *Pasajeros:* ${viajeActivo.numero_pasajeros}\n💳 *Método:* ${viajeActivo.metodo_pago === 'efectivo' ? 'Efectivo al conductor' : 'Enlace de pago'}\n\nEstamos buscando un conductor disponible en tu zona. Te notificaremos en unos instantes.`;

      case 'buscando_conductor':
        return `🔍 *MOONI Transporte*\nBuscando el mejor conductor disponible cercano a tu punto de partida...\n\n_ID de Solicitud: ${viajeActivo.id_viaje}_`;

      case 'asignado':
        return `✅ *¡Conductor Asignado!*\n${conductorAsignado ? conductorAsignado.nombre : 'Conductor'} ha aceptado tu viaje.\n🚗 *Vehículo:* ${vehiculoAsignado ? `${vehiculoAsignado.marca} ${vehiculoAsignado.modelo} (${vehiculoAsignado.color})` : 'Unidad asignada'}\n🚘 *Placas:* ${vehiculoAsignado?.placas || '(En pruebas)'}\n\nEl conductor se pondrá en marcha hacia tu ubicación.`;

      case 'en_camino':
        return `🚗 *Conductor en camino*\nTu conductor va en camino a:\n📍 ${viajeActivo.origen_direccion}\n${viajeActivo.referencia_recogida ? `Ref: ${viajeActivo.referencia_recogida}\n` : ''}\nPor favor permanece atento en tu punto de encuentro.`;

      case 'conductor_llego':
        return `📍 *¡Tu conductor ha llegado!*\nEl vehículo está esperándote en:\n${viajeActivo.origen_direccion}.\n\nPor favor aborda la unidad para comenzar el viaje.`;

      case 'en_viaje':
        return `🟢 *Viaje en curso*\nVas en camino hacia:\n🎯 ${viajeActivo.destino_direccion}\n\n¡Que tengas un excelente trayecto con MOONI!`;

      case 'finalizado':
        return `🏁 *Viaje Finalizado*\n¡Gracias por viajar con MOONI!\n\n💵 *Total:* ${viajeActivo.importe_cotizado !== null ? `${viajeActivo.importe_cotizado} ${viajeActivo.moneda || 'MXN'}` : 'Cotización base'}\n💳 *Forma de pago:* ${viajeActivo.metodo_pago === 'efectivo' ? 'Efectivo entregado al conductor' : 'Enlace digital'}\nEstatus de pago: ${viajeActivo.estado_pago}\n\nEsperamos verte pronto de nuevo.`;

      case 'cancelado':
        return `❌ *Viaje Cancelado*\nTu viaje ${viajeActivo.id_viaje} ha sido cancelado.\nMotivo: ${viajeActivo.motivo_cancelacion || 'Cancelado por el operador'}.\n\nSi necesitas un nuevo servicio, escríbenos de nuevo.`;

      case 'sin_disponibilidad':
        return `⚠️ *Sin conductores disponibles*\nEn este momento no pudimos encontrar un conductor en tu zona. Un operador se pondrá en contacto contigo a la brevedad.`;

      default:
        return 'Estado de solicitud recibido.';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 space-y-1">
          <div className="font-semibold text-white">
            Simulador Operativo de WhatsApp (Entorno de Pruebas MOONI)
          </div>
          <p className="text-neutral-400">
            Conforme al alcance: este módulo simula la captura por ManyChat y las notificaciones por plantilla de WhatsApp sin realizar cobros, llamadas a APIs externas ni envíos reales de mensajes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated WhatsApp Intake Form */}
        <div className="lg:col-span-6 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Simular Solicitud de Pasajero</h2>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">Input ManyChat Bot</span>
          </div>

          {mensajeExito && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Nombre Pasajero</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Teléfono WhatsApp (Texto)</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+52 1..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Dirección de Origen</label>
              <input
                type="text"
                required
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Calle, número, colonia..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Referencia de recogida (Opcional)</label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Frente a la tienda, portón rojo..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Dirección de Destino</label>
              <input
                type="text"
                required
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Destino, plaza o referencia..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">
                Enlace Google Maps (Opcional)
              </label>
              <input
                type="url"
                value={enlaceMapa}
                onChange={(e) => setEnlaceMapa(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-neutral-600"
              />
              <span className="text-[11px] text-neutral-500 mt-0.5 block">
                Ubicación mediante enlace compartido; no seguimiento GPS en vivo.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Número de Pasajeros</label>
                <select
                  value={numeroPasajeros}
                  onChange={(e) => setNumeroPasajeros(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
                >
                  <option value={1}>1 pasajero</option>
                  <option value={2}>2 pasajeros</option>
                  <option value={3}>3 pasajeros</option>
                  <option value={4}>4 pasajeros</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Método de Pago Acordado</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as 'efectivo' | 'enlace_de_pago')}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-neutral-600"
                >
                  <option value="efectivo">Efectivo al conductor</option>
                  <option value="enlace_de_pago">Enlace de pago (digital)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentimiento}
                  onChange={(e) => setConsentimiento(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-white"
                />
                <span>Pasajero acepta aviso de privacidad y gestión de datos</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              <span>Simular Envío de Solicitud WhatsApp</span>
            </button>
          </form>
        </div>

        {/* Right Column: WhatsApp Chat Preview & Real-Time Status Notification */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
            {/* WhatsApp App Mock Header */}
            <div className="bg-neutral-900 p-3.5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                  M
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">MOONI Soporte & Despacho</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Cuenta comercial verificada</div>
                </div>
              </div>

              {/* Selector of which trip to preview */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 font-mono">Ver viaje:</span>
                <select
                  value={viajeIdSimulado || viajeActivo?.id_viaje || ''}
                  onChange={(e) => setViajeIdSimulado(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white font-mono"
                >
                  {viajes.map((v) => (
                    <option key={v.id_viaje} value={v.id_viaje}>
                      {v.id_viaje} ({v.estado})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 bg-[#0d1418] min-h-[360px] text-xs">
              {/* Passenger inbound message */}
              <div className="flex justify-end">
                <div className="bg-[#005c4b] text-neutral-100 p-3 rounded-lg max-w-xs shadow-sm space-y-1">
                  <p>Hola, quiero pedir un viaje desde {origen} hacia {destino}.</p>
                  <div className="text-[10px] text-emerald-200 text-right flex items-center justify-end gap-1 font-mono">
                    <span>12:00</span>
                    <CheckCheck className="w-3 h-3 text-sky-300" />
                  </div>
                </div>
              </div>

              {/* MOONI automated notification message */}
              <div className="flex justify-start">
                <div className="bg-[#202c33] text-neutral-200 p-3.5 rounded-lg max-w-sm shadow-sm space-y-2 whitespace-pre-line border border-neutral-800/60 font-sans">
                  {getSimulatedNotificationMessage()}
                  <div className="text-[10px] text-neutral-400 text-right font-mono pt-1">
                    Ahora · Estado: {viajeActivo?.estado || 'solicitado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
              <span>Viaje: {viajeActivo?.id_viaje}</span>
              <span className="capitalize text-emerald-400 font-semibold">
                Estado: {viajeActivo?.estado.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Quick Explanation Card */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-2 text-neutral-400">
            <div className="font-semibold text-white">Flujo Operativo de Estados WhatsApp:</div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li><strong className="text-white">solicitado:</strong> Recepción y confirmación inicial.</li>
              <li><strong className="text-white">buscando_conductor:</strong> Concurrencia de ofertas enviadas a conductores.</li>
              <li><strong className="text-white">asignado:</strong> Confirmación con datos del conductor y placa.</li>
              <li><strong className="text-white">en_camino / conductor_llego:</strong> Avisos de aproximación y llegada.</li>
              <li><strong className="text-white">finalizado:</strong> Confirmación de viaje y recibo manual/enlace.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
