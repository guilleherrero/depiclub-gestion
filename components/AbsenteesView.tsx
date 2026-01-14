
import React, { useState, useMemo } from 'react';
import { LaserAppointment, EstheticAppointment, LaserClient, LaserServiceDay, WhatsAppConfig } from '../types';
import WhatsAppMenu from './WhatsAppMenu';

interface AbsenteesViewProps {
  laserApps: LaserAppointment[];
  esthApps: EstheticAppointment[];
  clients: LaserClient[];
  serviceDays: LaserServiceDay[];
  onUpdateLaserStatus: (id: string, u: Partial<LaserAppointment>) => void;
  onUpdateEsthStatus: (id: string, u: Partial<EstheticAppointment>) => void;
  onRescheduleLaser: (app: LaserAppointment, dayId: string) => void;
  onRescheduleEsth: (app: EstheticAppointment, date: string) => void;
  waConfig: WhatsAppConfig;
}

const AbsenteesView: React.FC<AbsenteesViewProps> = ({ 
  laserApps, esthApps, clients, serviceDays, onUpdateLaserStatus, onUpdateEsthStatus, onRescheduleLaser, onRescheduleEsth, waConfig 
}) => {
  const [filterType, setFilterType] = useState<'all' | 'laser' | 'esth'>('all');
  const [rescheduleData, setRescheduleData] = useState<{ id: string, type: 'laser' | 'esth' } | null>(null);
  const [newDate, setNewDate] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const noShows = useMemo(() => {
    const laserNS = laserApps.filter(a => a.status === 'no-show').map(a => ({
      ...a,
      type: 'laser' as const,
      date: serviceDays.find(d => d.id === a.serviceDayId)?.date || 'S/D',
      client: clients.find(c => c.id === a.clientId)
    }));

    const esthNS = esthApps.filter(a => a.status === 'no-show').map(a => ({
      ...a,
      type: 'esth' as const,
      client: clients.find(c => c.id === a.clientId)
    }));

    return [...laserNS, ...esthNS]
      .filter(item => filterType === 'all' || item.type === filterType)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [laserApps, esthApps, clients, serviceDays, filterType]);

  const handleReschedule = () => {
    if (!rescheduleData || !newDate) return;
    if (rescheduleData.type === 'laser') {
      const original = laserApps.find(a => a.id === rescheduleData.id);
      if (original) {
        onRescheduleLaser(original, newDate);
        onUpdateLaserStatus(rescheduleData.id, { recoveryStatus: 'recovered' });
      }
    } else {
      const original = esthApps.find(a => a.id === rescheduleData.id);
      if (original) {
        onRescheduleEsth(original, newDate);
        onUpdateEsthStatus(rescheduleData.id, { recoveryStatus: 'recovered' });
      }
    }
    setRescheduleData(null);
    setNewDate('');
    alert("Turno reprogramado exitosamente");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Reporte de Ausentes</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Gestión de recupero directa</p>
        </div>
        <div className="flex p-1.5 bg-white border rounded-[2rem] shadow-sm">
          <button onClick={() => setFilterType('all')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Todos</button>
          <button onClick={() => setFilterType('laser')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'laser' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Láser</button>
          <button onClick={() => setFilterType('esth')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'esth' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Estética</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {noShows.map((item, idx) => (
          <div key={`${item.type}-${item.id}`} className={`bg-white p-8 rounded-[3.5rem] border-2 shadow-xl flex flex-col justify-between group transition-all relative ${item.recoveryStatus === 'recovered' ? 'border-emerald-100 bg-emerald-50/20 opacity-60' : 'border-rose-100 hover:border-rose-300'}`}>
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl uppercase ${item.type === 'laser' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {item.clientName.charAt(0)}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.recoveryStatus === 'recovered' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'}`}>
                  {item.recoveryStatus === 'recovered' ? 'Recuperada' : 'No-Show'}
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{item.clientName}</h4>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{item.client?.phone || 'Sin Teléfono'}</p>
              
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Servicio</span>
                  <span className={`px-2 py-0.5 rounded-md font-black uppercase ${item.type === 'laser' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.type}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Inasistencia</span>
                  <span className="text-slate-700">{item.date.split('-').reverse().join('/')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 relative">
              <button 
                onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${activeMenuId === item.id ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                📲 WhatsApp
              </button>
              {activeMenuId === item.id && item.client && (
                <WhatsAppMenu 
                  phone={item.client.phone}
                  name={item.client.name}
                  service={item.type === 'laser' ? 'Depilación Láser' : 'Estética'}
                  waConfig={waConfig}
                  preferredType="absentee"
                  onClose={() => setActiveMenuId(null)}
                />
              )}
              <button 
                onClick={() => setRescheduleData({ id: item.id, type: item.type })}
                className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-lime-600 transition-all"
              >
                🔄
              </button>
            </div>
          </div>
        ))}
        {noShows.length === 0 && (
          <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[4rem] border-slate-100">
            <p className="text-4xl mb-4">✨</p>
            <p className="font-black uppercase text-slate-300 tracking-[0.3em] text-sm">No hay ausencias pendientes de recupero</p>
          </div>
        )}
      </div>

      {rescheduleData && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6" onClick={() => setRescheduleData(null)}>
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl animate-slideUp" onClick={e => e.stopPropagation()}>
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center">Reprogramar Turno</h3>
             <div className="space-y-6">
                {rescheduleData.type === 'laser' ? (
                  <select 
                    className="w-full p-6 bg-slate-50 border-2 border-indigo-100 rounded-3xl font-black text-xl text-indigo-600 outline-none"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                  >
                    <option value="">Elegir Jornada Láser...</option>
                    {serviceDays.map(d => <option key={d.id} value={d.id}>{d.date.split('-').reverse().join('/')}</option>)}
                  </select>
                ) : (
                  <input 
                    type="date" 
                    className="w-full p-6 bg-slate-50 border-2 border-emerald-100 rounded-3xl font-black text-xl text-emerald-600 outline-none"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                  />
                )}
                <div className="flex gap-4">
                  <button onClick={() => setRescheduleData(null)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px]">Cancelar</button>
                  <button 
                    onClick={handleReschedule} 
                    disabled={!newDate}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] shadow-xl disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsenteesView;
