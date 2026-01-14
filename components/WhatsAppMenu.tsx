
import React from 'react';
import { WhatsAppConfig } from '../types';
import { sendDirectWhatsApp, processTemplate } from '../services/whatsappService';

interface WhatsAppMenuProps {
  phone: string;
  name: string;
  service?: string;
  date?: string;
  time?: string;
  waConfig: WhatsAppConfig;
  preferredType: 'reminder' | 'absentee' | 'promo';
  onClose: () => void;
}

const WhatsAppMenu: React.FC<WhatsAppMenuProps> = ({ 
  phone, name, service, date, time, waConfig, preferredType, onClose 
}) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  // Determinar si la API de Meta está configurada
  const isApiReady = !!(waConfig.accessToken && waConfig.phoneNumberId);

  const getProcessedMessage = (type: 'reminder' | 'absentee' | 'promo') => {
    let template = '';
    if (type === 'reminder') template = waConfig.remindersTemplate;
    else if (type === 'absentee') template = waConfig.absenteesTemplate;
    else template = waConfig.promotionsTemplate;

    return processTemplate(template, { 
      nombre: name, 
      servicio: service || 'nuestros servicios', 
      fecha: date || '', 
      hora: time || '' 
    });
  };

  const handleSendDirect = async (type: 'reminder' | 'absentee' | 'promo') => {
    if (!isApiReady) return;
    
    setLoading(type);
    const message = getProcessedMessage(type);

    try {
      await sendDirectWhatsApp(waConfig, phone, message);
      alert("✅ Mensaje enviado vía API (Meta)");
      onClose();
    } catch (e: any) {
      alert("Error API: " + e.message + ". Intenta el envío manual.");
    } finally {
      setLoading(null);
    }
  };

  const handleSendManual = (type: 'reminder' | 'absentee' | 'promo') => {
    const message = getProcessedMessage(type);
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `549${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="absolute right-0 top-0 mt-12 w-64 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl z-[100] p-5 animate-scaleIn origin-top-right border-emerald-100">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enviar WhatsApp</span>
          <span className="text-[7px] font-bold text-emerald-500 uppercase">{isApiReady ? '● API Meta Activa' : '○ Modo Manual (Link)'}</span>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 font-black text-xs transition-colors">✕</button>
      </div>

      <div className="space-y-2">
        {/* Botón Recordatorio */}
        <div className="group relative">
          <button 
            onClick={() => isApiReady ? handleSendDirect('reminder') : handleSendManual('reminder')}
            disabled={!!loading}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${preferredType === 'reminder' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <span>🔔</span> {loading === 'reminder' ? 'Enviando...' : 'Recordatorio'}
            </div>
            {!isApiReady && <span className="text-[8px] opacity-40">🔗</span>}
          </button>
        </div>

        {/* Botón Recupero */}
        <div className="group relative">
          <button 
            onClick={() => isApiReady ? handleSendDirect('absentee') : handleSendManual('absentee')}
            disabled={!!loading}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${preferredType === 'absentee' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <span>🔄</span> {loading === 'absentee' ? 'Enviando...' : 'Recupero'}
            </div>
            {!isApiReady && <span className="text-[8px] opacity-40">🔗</span>}
          </button>
        </div>

        {/* Botón Promoción */}
        <div className="group relative">
          <button 
            onClick={() => isApiReady ? handleSendDirect('promo') : handleSendManual('promo')}
            disabled={!!loading}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${preferredType === 'promo' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <span>🎁</span> {loading === 'promo' ? 'Enviando...' : 'Promoción'}
            </div>
            {!isApiReady && <span className="text-[8px] opacity-40">🔗</span>}
          </button>
        </div>
      </div>

      {!isApiReady && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[7px] font-bold text-blue-600 leading-tight">
            Para enviar mensajes sin abrir pestañas de WhatsApp Web, configura tu API de Meta en la pestaña "WhatsApp".
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppMenu;
