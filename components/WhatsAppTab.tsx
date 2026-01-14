
import React, { useRef, useState } from 'react';
import { WhatsAppConfig } from '../types';

interface WhatsAppTabProps {
  config: WhatsAppConfig;
  onUpdateConfig: (config: WhatsAppConfig) => void;
}

const WhatsAppTab: React.FC<WhatsAppTabProps> = ({ config, onUpdateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPin, setNewPin] = useState('');

  const handleChange = (field: keyof WhatsAppConfig, value: string) => {
    onUpdateConfig({ ...config, [field]: value });
  };

  const handleUpdatePin = () => {
    if (newPin.length < 4) return alert("El PIN debe tener al menos 4 números");
    onUpdateConfig({ ...config, masterPin: newPin });
    setNewPin('');
    alert("PIN actualizado correctamente. Úsalo la próxima vez que ingreses como Maestro.");
  };

  const handleExportData = () => {
    const allData: Record<string, string | null> = {};
    const PREFIX = 'depiclub_v19_';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) allData[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depiclub_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("¿Estás seguro de restaurar?")) {
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string') localStorage.setItem(key, value);
          });
          window.location.reload();
        }
      } catch (err) { alert("Error al importar"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Configuración y Seguridad</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestión de WhatsApp, Inteligencia y Acceso</p>
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span> Sistema Protegido
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
          {/* SEGURIDAD - CAMBIO DE PIN */}
          <div className="bg-white p-10 rounded-[3rem] border shadow-2xl space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-4">Seguridad Maestra</h3>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase">Nuevo PIN de Acceso</label>
               <div className="flex gap-2">
                  <input 
                    type="password" 
                    maxLength={6}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-4 bg-slate-50 border-2 rounded-2xl text-center font-black text-xl tracking-[0.5em] outline-none"
                    placeholder="****"
                  />
                  <button onClick={handleUpdatePin} className="bg-slate-900 text-white px-6 rounded-2xl text-[10px] font-black uppercase">Cambiar</button>
               </div>
               <p className="text-[8px] text-slate-400 uppercase font-bold">Por defecto es 1234. Recomendamos cambiarlo para mayor privacidad.</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border shadow-2xl space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-4">Conectividad Online</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <label className="text-[9px] font-black text-indigo-600 uppercase mb-2 block">Gemini AI API Key (Para reportes)</label>
                <input 
                  type="password"
                  value={config.geminiApiKey || ''} 
                  onChange={e => handleChange('geminiApiKey', e.target.value)}
                  className="w-full p-3 bg-white border rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                  placeholder="AIzaSy..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">WhatsApp Access Token</label>
                <textarea 
                  value={config.accessToken} 
                  onChange={e => handleChange('accessToken', e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-[10px] font-mono outline-none focus:border-emerald-500 h-24"
                  placeholder="EAA..."
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl space-y-6 text-white">
            <h3 className="text-sm font-black uppercase tracking-widest border-b border-white/10 pb-4">Respaldo de Datos</h3>
            <div className="pt-6 border-t border-white/10 flex gap-4">
              <button onClick={handleExportData} className="flex-1 bg-white/10 py-4 rounded-2xl text-[9px] font-black uppercase border border-white/10">Descargar Backup</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-lime-600 py-4 rounded-2xl text-[9px] font-black uppercase shadow-lg">Cargar Backup</button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border shadow-2xl space-y-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b pb-4">Plantillas de WhatsApp</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Recordatorio de Turnos</label>
                <textarea value={config.remindersTemplate} onChange={e => handleChange('remindersTemplate', e.target.value)} className="w-full p-5 bg-slate-50 border-2 rounded-3xl text-xs font-bold leading-relaxed outline-none h-24" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Recupero de Ausentes (No-Show)</label>
                <textarea value={config.absenteesTemplate} onChange={e => handleChange('absenteesTemplate', e.target.value)} className="w-full p-5 bg-slate-50 border-2 rounded-3xl text-xs font-bold leading-relaxed outline-none h-24" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Promociones y Marketing</label>
                <textarea value={config.promotionsTemplate} onChange={e => handleChange('promotionsTemplate', e.target.value)} className="w-full p-5 bg-slate-50 border-2 rounded-3xl text-xs font-bold leading-relaxed outline-none h-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTab;
