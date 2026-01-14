
import React, { useState, useMemo } from 'react';
import { LaserClient, LaserZone, LaserAppointment, Beautician, LaserServiceDay, PaymentMethod, Sale, EstheticAppointment, ServiceType, WhatsAppConfig } from '../types';
import WhatsAppMenu from './WhatsAppMenu';

interface LaserTabProps {
  isMaster: boolean;
  clients: LaserClient[];
  zones: LaserZone[];
  appointments: LaserAppointment[];
  esthApps: EstheticAppointment[];
  sales: Sale[];
  serviceDays: LaserServiceDay[];
  beauticians: Beautician[];
  laserCommEnabled: boolean;
  laserDefaultRate: number;
  onSetLaserCommEnabled: (enabled: boolean) => void;
  onSetLaserDefaultRate: (rate: number) => void;
  onAddClient: (client: Omit<LaserClient, 'id' | 'registrationDate'>) => void;
  onAddAppointment: (app: Omit<LaserAppointment, 'id' | 'status'>) => void;
  onUpdateStatus: (id: string, status: LaserAppointment['status'], paymentMethod?: PaymentMethod) => void;
  onUpdateAppointment: (id: string, updated: Partial<LaserAppointment>) => void;
  onAddServiceDay: (date: string) => void;
  onDeleteServiceDay: (id: string) => void;
  onAddZone: (zone: Omit<LaserZone, 'id'>) => void;
  onDeleteZone: (id: string) => void;
  onUpdateAppointmentZones: (id: string, zonesIds: string[], totalAmount: number) => void;
  onMoveAppointment: (appointmentId: string, newServiceDayId: string) => void;
  onUpdateZone: (id: string, updated: Partial<LaserZone>) => void;
  onShowHistory?: (id: string, name: string) => void;
  waConfig: WhatsAppConfig;
}

const LaserTab: React.FC<LaserTabProps> = ({ 
  isMaster, clients = [], zones = [], appointments = [], esthApps = [], sales = [], serviceDays = [], beauticians = [], 
  laserCommEnabled, laserDefaultRate, onSetLaserCommEnabled, onSetLaserDefaultRate,
  onAddClient, onAddAppointment, onUpdateStatus, onUpdateAppointment, onAddServiceDay, onDeleteServiceDay,
  onAddZone, onDeleteZone, onUpdateAppointmentZones, onMoveAppointment, onUpdateZone, onShowHistory, waConfig
}) => {
  const [subTab, setSubTab] = useState<'agenda' | 'retencion' | 'clientes' | 'catalogo' | 'configuracion'>('agenda');
  const [selectedServiceDayId, setSelectedServiceDayId] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  const [selClientId, setSelClientId] = useState('');
  const [selOperatorId, setSelOperatorId] = useState('');
  const [selZones, setSelZones] = useState<string[]>([]);
  const [usePromo, setUsePromo] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredClientsForSearch = useMemo(() => {
    if (!clientSearch) return [];
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.phone.includes(clientSearch)
    ).slice(0, 5);
  }, [clients, clientSearch]);

  const getClientServices = (clientId: string, clientName: string) => {
    const hasLaser = appointments.some(a => a.clientId === clientId && a.status === 'attended');
    const hasEsthetics = esthApps.some(a => a.clientId === clientId && a.status === 'attended');
    const hasWax = sales.some(s => s.serviceType === ServiceType.WAX && s.customerName?.toUpperCase() === clientName.toUpperCase());
    return { hasLaser, hasEsthetics, hasWax };
  };

  const dayAppointments = appointments.filter(a => a.serviceDayId === selectedServiceDayId);
  const currentDayDate = serviceDays.find(d => d.id === selectedServiceDayId)?.date || '';

  const getSessionCount = (clientId: string, zoneId: string, currentDate: string) => {
    return appointments.filter(a => 
      a.clientId === clientId && 
      a.status === 'attended' && 
      a.zonesIds.includes(zoneId) &&
      (serviceDays.find(d => d.id === a.serviceDayId)?.date || '') < currentDate
    ).length + 1;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          {id: 'agenda', label: 'Agenda', icon: '📅'},
          {id: 'retencion', label: 'Recupero', icon: '🚨'},
          {id: 'clientes', label: 'Base Clientas', icon: '👥'},
          {id: 'catalogo', label: 'Zonas y Precios', icon: '🏷️'},
          {id: 'configuracion', label: 'Configuración', icon: '⚙️'}
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${subTab === t.id ? 'border-b-4 border-lime-600 text-lime-600' : 'text-slate-400 hover:text-lime-400'}`}>
            <span className="mr-2">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {subTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl">
              <h3 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-widest">1. Seleccionar Jornada</h3>
              <select className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-indigo-600 outline-none" value={selectedServiceDayId} onChange={(e) => setSelectedServiceDayId(e.target.value)}>
                <option value="">Elegir fecha...</option>
                {serviceDays.sort((a,b) => b.date.localeCompare(a.date)).map(day => (
                  <option key={day.id} value={day.id}>{day.date.split('-').reverse().join('/')}</option>
                ))}
              </select>
            </div>

            {selectedServiceDayId && (
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl animate-slideUp">
                <h3 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-widest">2. Nuevo Turno</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <input type="text" placeholder="Buscar clienta..." className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none" value={clientSearch} onChange={(e) => { setClientSearch(e.target.value); setSelClientId(''); }} />
                    {filteredClientsForSearch.length > 0 && !selClientId && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden">
                        {filteredClientsForSearch.map(c => (
                          <button key={c.id} onClick={() => { setSelClientId(c.id); setClientSearch(c.name); }} className="w-full p-4 text-left hover:bg-lime-600 hover:text-white border-b group">
                            <p className="text-xs font-black uppercase">{c.name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl text-sm font-black uppercase outline-none" value={selOperatorId} onChange={(e) => setSelOperatorId(e.target.value)}>
                    <option value="">Profesional...</option>
                    {beauticians.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <button type="button" disabled={!selClientId || !selOperatorId || selZones.length === 0} onClick={() => {
                    const client = clients.find(c => c.id === selClientId);
                    const totalAmount = selZones.reduce((acc, zid) => {
                      const zone = zones.find(z => z.id === zid);
                      return acc + (usePromo ? (zone?.promoPrice || 0) : (zone?.listPrice || 0));
                    }, 0);
                    onAddAppointment({ clientId: selClientId, clientName: client?.name || 'Clienta', serviceDayId: selectedServiceDayId, zonesIds: selZones, totalAmount, operatorId: selOperatorId });
                    setSelZones([]); setSelClientId(''); setClientSearch('');
                    alert("Agendado");
                  }} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] shadow-xl">Agendar</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            {selectedServiceDayId ? (
              <div className="bg-white rounded-[3rem] shadow-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b">
                    <tr><th className="px-10 py-5">Clienta</th><th className="px-10 py-5">Zonas y Sesión</th><th className="px-10 py-5 text-right">Importe</th><th className="px-10 py-5 text-center">Gestión</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dayAppointments.map(app => {
                      const client = clients.find(c => c.id === app.clientId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-10 py-6">
                            <button onClick={() => onShowHistory?.(app.clientId, app.clientName)} className="font-black text-slate-800 uppercase text-sm hover:text-lime-600">
                              {app.clientName}
                            </button>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-1">
                              {app.zonesIds.map(zid => (
                                <span key={zid} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[8px] font-black uppercase flex items-center gap-1.5">
                                  {zones.find(z => z.id === zid)?.name}
                                  <span className="bg-indigo-700 text-white px-1.5 py-0.5 rounded-sm">S#{getSessionCount(app.clientId, zid, currentDayDate)}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right font-black text-lg text-slate-900">${app.totalAmount.toLocaleString()}</td>
                          <td className="px-10 py-6">
                             <div className="flex gap-2 relative">
                               <select value={app.status} onChange={e => onUpdateStatus(app.id, e.target.value as any)} className={`p-2 rounded-xl text-[9px] font-black uppercase border outline-none ${app.status === 'attended' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                                 <option value="scheduled">Pendiente</option>
                                 <option value="attended">Cobrado</option>
                                 <option value="no-show">Faltó</option>
                               </select>
                               <button 
                                  onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                                  className={`p-2 rounded-xl border transition-all shadow-sm ${activeMenuId === app.id ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
                               >
                                 📲
                               </button>
                               {activeMenuId === app.id && client && (
                                 <WhatsAppMenu 
                                   phone={client.phone}
                                   name={client.name}
                                   service="Depilación Láser"
                                   date={currentDayDate.split('-').reverse().join('/')}
                                   waConfig={waConfig}
                                   preferredType="reminder"
                                   onClose={() => setActiveMenuId(null)}
                                 />
                               )}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[400px] border-4 border-dashed rounded-[3rem] border-slate-100 flex items-center justify-center text-slate-300 font-black uppercase">Selecciona una Jornada</div>
            )}
          </div>
        </div>
      )}

      {subTab === 'clientes' && (
        <div className="space-y-6">
          <input placeholder="Filtrar base de clientas..." className="w-full p-6 bg-white border rounded-[2rem] shadow-xl text-sm font-bold" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => {
              const services = getClientServices(c.id, c.name);
              return (
                <div key={c.id} className="bg-white p-8 rounded-[3rem] border shadow-xl flex flex-col justify-between group hover:border-lime-300 transition-all cursor-pointer relative" onClick={() => onShowHistory?.(c.id, c.name)}>
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-2xl uppercase border border-slate-100 group-hover:bg-lime-600 group-hover:text-white transition-all">{c.name.charAt(0)}</div>
                     <div className="flex flex-col gap-1 items-end">
                       {services.hasWax && <span className="px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-[7px] font-black uppercase tracking-widest">Cera</span>}
                       {services.hasLaser && <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[7px] font-black uppercase tracking-widest">Láser</span>}
                       {services.hasEsthetics && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[7px] font-black uppercase tracking-widest">Estética</span>}
                       <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === c.id ? null : c.id); }}
                        className="mt-2 p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                       >
                         📲
                       </button>
                       {activeMenuId === c.id && (
                         <div onClick={e => e.stopPropagation()}>
                           <WhatsAppMenu 
                             phone={c.phone}
                             name={c.name}
                             waConfig={waConfig}
                             preferredType="promo"
                             onClose={() => setActiveMenuId(null)}
                           />
                         </div>
                       )}
                     </div>
                  </div>
                  <h4 className="font-black text-slate-800 uppercase text-lg leading-none mb-1">{c.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{c.phone || "Sin Teléfono"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LaserTab;
