
import React, { useState, useMemo } from 'react';
import { LaserClient, LaserAppointment, EstheticAppointment, Sale, ServiceType, WhatsAppConfig } from '../types';
import WhatsAppMenu from './WhatsAppMenu';

interface ClientsViewProps {
  clients: LaserClient[];
  appointments: LaserAppointment[];
  esthApps: EstheticAppointment[];
  sales: Sale[];
  onAddClient: (client: Omit<LaserClient, 'id' | 'registrationDate'>) => void;
  onShowHistory: (id: string, name: string) => void;
  waConfig: WhatsAppConfig;
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, appointments, esthApps, sales, onAddClient, onShowHistory, waConfig }) => {
  const [search, setSearch] = useState('');
  const [newCName, setNewCName] = useState('');
  const [newCPhone, setNewCPhone] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getClientServices = (clientId: string, clientName: string) => {
    const hasLaser = appointments.some(a => a.clientId === clientId && a.status === 'attended');
    const hasEsthetics = esthApps.some(a => a.clientId === clientId && a.status === 'attended');
    const hasWax = sales.some(s => s.serviceType === ServiceType.WAX && s.customerName?.toUpperCase() === clientName.toUpperCase());
    return { hasLaser, hasEsthetics, hasWax };
  };

  const filtered = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  , [clients, search]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      <div className="lg:col-span-4 h-fit">
        <div className="bg-white p-10 rounded-[3rem] border shadow-xl">
          <h3 className="font-black text-slate-900 uppercase text-xs mb-8 tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-lime-600 rounded-full"></span> Alta de Clienta Manual
          </h3>
          <form onSubmit={e => {
            e.preventDefault();
            if (newCName && newCPhone) {
              onAddClient({ name: newCName.toUpperCase(), phone: newCPhone, email: '' });
              setNewCName(''); setNewCPhone(''); alert("Guardada");
            }
          }} className="space-y-6">
            <input placeholder="Nombre Completo" value={newCName} onChange={e => setNewCName(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-lime-500" required />
            <input placeholder="Teléfono / WhatsApp" value={newCPhone} onChange={e => setNewCPhone(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none focus:border-lime-500" required />
            <button type="submit" className="w-full py-5 bg-lime-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg">Registrar</button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border shadow-lg flex items-center gap-4">
          <span className="text-slate-400 ml-2">🔍</span>
          <input 
            placeholder="Buscar por nombre o celular en toda la base..." 
            className="flex-1 bg-transparent border-none font-bold text-sm outline-none" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[8px] font-black uppercase">{filtered.length} Totales</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => {
            const services = getClientServices(c.id, c.name);
            return (
              <div key={c.id} className="bg-white p-8 rounded-[3rem] border shadow-xl flex flex-col justify-between group hover:border-lime-300 transition-all cursor-pointer relative" onClick={() => onShowHistory(c.id, c.name)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-2xl uppercase border border-slate-100 group-hover:bg-lime-600 group-hover:text-white transition-all">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-1 items-end relative">
                    <div className="flex gap-1">
                      {services.hasWax && <span className="px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-[7px] font-black uppercase tracking-widest">Cera</span>}
                      {services.hasLaser && <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[7px] font-black uppercase tracking-widest">Láser</span>}
                      {services.hasEsthetics && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[7px] font-black uppercase tracking-widest">Estética</span>}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === c.id ? null : c.id); }}
                      className={`mt-2 p-2 rounded-xl border transition-all shadow-sm ${activeMenuId === c.id ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
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
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-lg leading-none mb-1">{c.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{c.phone}</p>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center opacity-40 group-hover:opacity-100 transition-all">
                  <span className="text-[9px] font-black text-lime-600 uppercase tracking-widest">Ver Ficha Completa ➔</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center border-4 border-dashed rounded-[3rem] text-slate-300 font-black uppercase text-xs">
              No se encontraron clientas con ese criterio
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsView;
