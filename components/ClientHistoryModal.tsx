
import React from 'react';
import { LaserAppointment, EstheticAppointment, LaserServiceDay, LaserZone, EstheticTreatment, Sale, WaxZone, ServiceType } from '../types';

interface ClientHistoryModalProps {
  clientId?: string;
  clientName: string;
  sales: Sale[];
  laserApps: LaserAppointment[];
  esthApps: EstheticAppointment[];
  serviceDays: LaserServiceDay[];
  laserZones: LaserZone[];
  waxZones: WaxZone[];
  esthTreatments: EstheticTreatment[];
  onClose: () => void;
}

const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({ 
  clientId, clientName, sales, laserApps, esthApps, serviceDays, laserZones, waxZones, esthTreatments, onClose 
}) => {
  // Historial de Cera (Desde la tabla de Ventas filtrada por nombre)
  const clientWax = sales
    .filter(s => s.serviceType === ServiceType.WAX && s.customerName?.toUpperCase() === clientName.toUpperCase())
    .map(s => ({
      date: s.date,
      type: 'CERA',
      details: s.waxZonesIds?.map(zid => waxZones.find(w => w.id === zid)?.name).join(', ') || 'Varios',
      amount: s.amount
    }));

  // Historial de Láser (Desde citas atendidas vinculadas al clientId)
  const clientLaser = clientId ? laserApps
    .filter(a => a.clientId === clientId && a.status === 'attended')
    .map(a => ({
      date: serviceDays.find(d => d.id === a.serviceDayId)?.date || 'S/D',
      type: 'LÁSER',
      details: a.zonesIds.map(zid => laserZones.find(z => z.id === zid)?.name).join(', '),
      amount: a.totalAmount
    })) : [];

  // Historial de Estética (Desde citas atendidas vinculadas al clientId)
  const clientEsth = clientId ? esthApps
    .filter(a => a.clientId === clientId && a.status === 'attended')
    .map(a => ({
      date: a.date,
      type: 'ESTÉTICA',
      details: a.treatmentIds.map(tid => esthTreatments.find(t => t.id === tid)?.name).join(', '),
      amount: a.totalAmount
    })) : [];

  const fullHistory = [...clientWax, ...clientLaser, ...clientEsth].sort((a, b) => b.date.localeCompare(a.date));

  const getBadgeStyle = (type: string) => {
    switch(type) {
      case 'LÁSER': return 'bg-indigo-600 text-white shadow-indigo-100';
      case 'ESTÉTICA': return 'bg-emerald-600 text-white shadow-emerald-100';
      case 'CERA': return 'bg-lime-500 text-white shadow-lime-100';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden animate-slideUp border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <div className="flex gap-2 mb-2">
              {clientWax.length > 0 && <span className="text-[7px] font-black px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full uppercase tracking-widest">Cera</span>}
              {clientLaser.length > 0 && <span className="text-[7px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-widest">Láser</span>}
              {clientEsth.length > 0 && <span className="text-[7px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-widest">Estética</span>}
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{clientName}</h2>
          </div>
          <button onClick={onClose} className="w-14 h-14 bg-white border-2 border-slate-100 shadow-xl rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all font-black text-xl group">
             <span className="group-hover:rotate-90 transition-transform">✕</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {fullHistory.length > 0 ? (
            <div className="space-y-8 relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
              {fullHistory.map((item, idx) => (
                <div key={idx} className="flex gap-8 items-start relative z-10">
                  <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md flex-shrink-0 mt-1 ${getBadgeStyle(item.type)}`}></div>
                  <div className="flex-1 bg-slate-50 p-6 rounded-[2.5rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all hover:shadow-2xl group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                      <span className="text-xl font-black text-slate-800 tracking-tight">{item.date.split('-').reverse().join('/')}</span>
                      <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${getBadgeStyle(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed tracking-tight">{item.details}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión Sesión</p>
                       <p className="text-lg font-black text-slate-900">${item.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
              <span className="text-8xl mb-8 animate-bounce opacity-30">📂</span>
              <p className="font-black uppercase tracking-[0.3em] text-sm text-slate-400">Sin historial registrado aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientHistoryModal;
