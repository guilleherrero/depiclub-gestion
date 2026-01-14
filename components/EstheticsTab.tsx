
import React, { useState, useMemo } from 'react';
import { LaserClient, EstheticTreatment, EstheticAppointment, Beautician, PaymentMethod, WhatsAppConfig, TreatmentPackage } from '../types';

interface EstheticsTabProps {
  isMaster: boolean;
  clients: LaserClient[];
  treatments: EstheticTreatment[];
  appointments: EstheticAppointment[];
  beauticians: Beautician[];
  selectedDate: string;
  packages: TreatmentPackage[];
  onAddAppointment: (app: Omit<EstheticAppointment, 'id' | 'status'>) => void;
  onUpdateStatus: (id: string, status: EstheticAppointment['status'], method?: PaymentMethod) => void;
  onUpdateAppointment: (id: string, updated: Partial<EstheticAppointment>) => void;
  onUpdateTreatment: (id: string, updated: Partial<EstheticTreatment>) => void;
  onAddTreatment: (treatment: Omit<EstheticTreatment, 'id'>) => void;
  onAddClient?: (client: Omit<LaserClient, 'id' | 'registrationDate'>) => void;
  onShowHistory?: (id: string, name: string) => void;
  onAddPackage: (pack: Omit<TreatmentPackage, 'id' | 'usedSessions' | 'status'>) => void;
  onUpdatePackage: (id: string, updated: Partial<TreatmentPackage>) => void;
  onAddPackagePayment: (packId: string, amount: number, method: PaymentMethod) => void;
  waConfig: WhatsAppConfig;
}

const EstheticsTab: React.FC<EstheticsTabProps> = ({ 
  isMaster, clients = [], treatments = [], appointments = [], beauticians = [], selectedDate, packages = [],
  onAddAppointment, onUpdateStatus, onUpdateAppointment, onUpdateTreatment, onAddTreatment, onAddClient, onShowHistory,
  onAddPackage, onUpdatePackage, onAddPackagePayment,
  waConfig
}) => {
  const [subTab, setSubTab] = useState<'agenda' | 'packs' | 'clientes' | 'retencion' | 'catalogo'>('agenda');
  const [clientSearch, setClientSearch] = useState('');
  const [selClientId, setSelClientId] = useState('');
  const [selTreatments, setSelTreatments] = useState<string[]>([]);
  const [selSpecialistId, setSelSpecialistId] = useState('');
  const [selAppDate, setSelAppDate] = useState(selectedDate);
  const [selPackageId, setSelPackageId] = useState<string>('');

  // Estados para nuevo Pack
  const [showPackForm, setShowPackForm] = useState(false);
  const [packTreatmentId, setPackTreatmentId] = useState('');
  const [packSessions, setPackSessions] = useState('6');
  const [packTotal, setPackTotal] = useState('');
  const [packInitialPay, setPackInitialPay] = useState('');

  // Estados para nuevo Pago
  const [payPackId, setPayPackId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const filteredClientsSearch = useMemo(() => 
    clientSearch ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)).slice(0, 5) : []
  , [clients, clientSearch]);

  const activePackagesForClient = useMemo(() => {
    if (!selClientId) return [];
    return packages.filter(p => p.clientId === selClientId && p.status === 'active');
  }, [packages, selClientId]);

  const debtorPackages = useMemo(() => {
    return packages.filter(p => p.totalPrice > p.paidAmount);
  }, [packages]);

  const handleCreatePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selClientId || !packTreatmentId || !packTotal) return alert("Faltan datos");
    const client = clients.find(c => c.id === selClientId);
    const treatment = treatments.find(t => t.id === packTreatmentId);
    
    onAddPackage({
      clientId: selClientId,
      clientName: client?.name || 'Cliente',
      treatmentId: packTreatmentId,
      treatmentName: treatment?.name || 'Varios',
      totalSessions: parseInt(packSessions),
      totalPrice: parseFloat(packTotal),
      paidAmount: parseFloat(packInitialPay || '0'),
      date: selectedDate
    });

    setShowPackForm(false);
    setPackInitialPay('');
    setPackTotal('');
    alert("Pack creado exitosamente");
  };

  const handleAddPayment = () => {
    if (!payPackId || !payAmount) return;
    onAddPackagePayment(payPackId, parseFloat(payAmount), PaymentMethod.CASH);
    setPayPackId(null);
    setPayAmount('');
    alert("Pago registrado");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-wrap gap-2 border-b">
        {[
          {id: 'agenda', label: 'Citas Hoy', icon: '📝'},
          {id: 'packs', label: 'Packs y Saldos', icon: '💎'},
          {id: 'clientes', label: 'Clientas', icon: '👥'},
          {id: 'retencion', label: 'Recupero', icon: '🚨'},
          {id: 'catalogo', label: 'Configuración', icon: '🏷️'}
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id as any)} className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${subTab === t.id ? 'border-b-4 border-lime-600 text-lime-600' : 'text-slate-400 hover:text-lime-400'}`}>
            <span className="mr-2">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {subTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-lime-500 rounded-full"></span> Agendar Nuevo Turno
              </h3>
              <form onSubmit={e => {
                e.preventDefault();
                if (!selClientId || !selSpecialistId || (selTreatments.length === 0 && !selPackageId) || !selAppDate) return alert("Completa los datos.");
                const client = clients.find(c => c.id === selClientId);
                
                let finalTreatments = [...selTreatments];
                let amount = 0;

                if (selPackageId) {
                  const pack = packages.find(p => p.id === selPackageId);
                  if (pack) {
                    finalTreatments = [pack.treatmentId];
                    amount = 0; // Sesión ya pagada o a cuenta de pack
                  }
                } else {
                  amount = selTreatments.reduce((acc, tid) => acc + (treatments.find(t => t.id === tid)?.price || 0), 0);
                }

                onAddAppointment({ 
                  clientId: selClientId, 
                  clientName: client?.name || 'Cliente', 
                  date: selAppDate, 
                  treatmentIds: finalTreatments, 
                  totalAmount: amount, 
                  specialistId: selSpecialistId,
                  packageId: selPackageId || undefined
                });

                setSelTreatments([]); setSelClientId(''); setClientSearch(''); setSelPackageId('');
                alert("Turno agendado");
              }} className="space-y-4">
                <div className="relative">
                  <input type="text" placeholder="Buscar clienta..." value={clientSearch} onChange={e => {setClientSearch(e.target.value); setSelClientId('');}} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" />
                  {filteredClientsSearch.length > 0 && !selClientId && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {filteredClientsSearch.map(c => <button key={c.id} type="button" onClick={() => {setSelClientId(c.id); setClientSearch(c.name);}} className="w-full p-4 text-left hover:bg-lime-600 hover:text-white text-[10px] font-black uppercase border-b">{c.name}</button>)}
                    </div>
                  )}
                </div>

                {selClientId && activePackagesForClient.length > 0 && (
                  <div className="p-4 bg-lime-50 border border-lime-200 rounded-2xl">
                    <label className="text-[9px] font-black text-lime-600 uppercase block mb-2">Tiene Packs Activos:</label>
                    <select value={selPackageId} onChange={e => setSelPackageId(e.target.value)} className="w-full p-2 bg-white border rounded-xl text-xs font-black uppercase outline-none">
                      <option value="">¿Usar sesión de un pack?</option>
                      {activePackagesForClient.map(p => (
                        <option key={p.id} value={p.id}>{p.treatmentName} ({p.totalSessions - p.usedSessions} rest.)</option>
                      ))}
                    </select>
                  </div>
                )}

                {!selPackageId && (
                  <div className="max-h-40 overflow-y-auto border-2 border-slate-50 rounded-2xl p-2">
                    {treatments.map(t => (
                      <label key={t.id} className={`flex items-center gap-3 p-2 rounded-xl mb-1 cursor-pointer transition-all ${selTreatments.includes(t.id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                        <input type="checkbox" className="hidden" checked={selTreatments.includes(t.id)} onChange={e => e.target.checked ? setSelTreatments([...selTreatments, t.id]) : setSelTreatments(selTreatments.filter(id => id !== t.id))} />
                        <span className="text-[10px] font-black uppercase flex-1">{t.name}</span>
                        <span className="text-[10px] font-black opacity-60">${t.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                )}

                <input type="date" value={selAppDate} onChange={e => setSelAppDate(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-lime-600 outline-none" />
                <select value={selSpecialistId} onChange={e => setSelSpecialistId(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none">
                  <option value="">Profesional...</option>
                  {beauticians.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl">Agendar Turno</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b bg-slate-50/30 flex justify-between">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xs">Citas: {selAppDate.split('-').reverse().join('/')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white text-[9px] font-black uppercase text-slate-400 border-b">
                    <tr><th className="px-10 py-5 text-left">Clienta</th><th className="px-10 py-5 text-left">Tratamientos / Pack</th><th className="px-10 py-5 text-right">Importe</th><th className="px-10 py-5 text-center">Estado</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.filter(a => a.date === selAppDate).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="font-black text-slate-800 uppercase text-sm">{app.clientName}</p>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-wrap gap-1">
                            {app.packageId ? (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[8px] font-black uppercase">
                                💎 Pack: {app.treatmentIds.map(tid => treatments.find(t => t.id === tid)?.name).join(', ')}
                              </span>
                            ) : (
                              app.treatmentIds.map(tid => (
                                <span key={tid} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[8px] font-black uppercase">
                                  {treatments.find(t => t.id === tid)?.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right font-black text-lg text-slate-900">
                          {app.packageId ? <span className="text-amber-500">PACK</span> : `$${app.totalAmount.toLocaleString()}`}
                        </td>
                        <td className="px-10 py-6">
                          <select value={app.status} onChange={e => { const st = e.target.value as any; if(st === 'attended') { const m = confirm("¿Es Mercado Pago?") ? PaymentMethod.MERCADO_PAGO : PaymentMethod.CASH; onUpdateStatus(app.id, st, m); } else onUpdateStatus(app.id, st); }} className={`p-2 w-full rounded-xl text-[9px] font-black uppercase border outline-none ${app.status === 'attended' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                            <option value="scheduled">Pendiente</option>
                            <option value="attended">✅ Cobrado</option>
                            <option value="no-show">❌ Faltó</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'packs' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Control de Packs y Deudas</h3>
             <button onClick={() => setShowPackForm(true)} className="bg-lime-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:-translate-y-1 transition-all">Vender Nuevo Pack 💎</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {debtorPackages.map(p => (
               <div key={p.id} className="bg-white p-8 rounded-[3rem] border-2 border-rose-100 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[8px] font-black uppercase">Deuda Pendiente</span>
                       <span className="text-[10px] font-bold text-slate-400">{p.date}</span>
                    </div>
                    <h4 className="font-black text-slate-800 uppercase text-lg leading-tight mb-1">{p.clientName}</h4>
                    <p className="text-[11px] font-black text-indigo-600 uppercase mb-4">{p.treatmentName}</p>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-6">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-400">Total Pack</span>
                          <span className="text-slate-800">${p.totalPrice.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-emerald-500">Pagado</span>
                          <span className="text-emerald-600">-${p.paidAmount.toLocaleString()}</span>
                       </div>
                       <div className="pt-2 border-t flex justify-between text-xs font-black uppercase">
                          <span className="text-rose-500">Saldo</span>
                          <span className="text-rose-600">${(p.totalPrice - p.paidAmount).toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => setPayPackId(p.id)} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg">Cobrar Saldo 💵</button>
               </div>
             ))}
             {debtorPackages.length === 0 && <div className="col-span-full py-10 text-center border-2 border-dashed rounded-[3rem] text-slate-300 font-black uppercase text-xs">No hay deudas pendientes</div>}
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl border overflow-hidden">
             <div className="p-8 border-b bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xs">Historial de Packs Activos</h3>
             </div>
             <table className="w-full">
                <thead className="bg-white text-[9px] font-black uppercase text-slate-400 border-b">
                   <tr><th className="px-10 py-5 text-left">Clienta</th><th className="px-10 py-5 text-left">Tratamiento</th><th className="px-10 py-5 text-center">Sesiones</th><th className="px-10 py-5 text-right">Pagado</th><th className="px-10 py-5 text-center">Estado</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {packages.filter(p => p.status === 'active').map(p => (
                     <tr key={p.id}>
                        <td className="px-10 py-5 font-black text-slate-700 uppercase text-xs">{p.clientName}</td>
                        <td className="px-10 py-5 font-black text-indigo-500 uppercase text-xs">{p.treatmentName}</td>
                        <td className="px-10 py-5 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <span className="font-black text-lg">{p.usedSessions}</span>
                              <span className="text-slate-300">/</span>
                              <span className="text-slate-400 text-xs font-bold">{p.totalSessions}</span>
                           </div>
                        </td>
                        <td className="px-10 py-5 text-right font-black text-emerald-600">${p.paidAmount.toLocaleString()}</td>
                        <td className="px-10 py-5 text-center">
                           <span className="px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-[8px] font-black uppercase">En curso</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {showPackForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl animate-slideUp">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center">💎 Venta de Combo</h3>
              <form onSubmit={handleCreatePack} className="space-y-6">
                 <div className="relative">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Clienta</label>
                    <input type="text" placeholder="Buscar..." value={clientSearch} onChange={e => {setClientSearch(e.target.value); setSelClientId('');}} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm outline-none" />
                    {filteredClientsSearch.length > 0 && !selClientId && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden">
                        {filteredClientsSearch.map(c => <button key={c.id} type="button" onClick={() => {setSelClientId(c.id); setClientSearch(c.name);}} className="w-full p-4 text-left hover:bg-lime-600 hover:text-white text-[10px] font-black uppercase border-b">{c.name}</button>)}
                      </div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Tratamiento</label>
                       <select value={packTreatmentId} onChange={e => setPackTreatmentId(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-xs uppercase outline-none">
                          <option value="">Elegir...</option>
                          {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Cant. Sesiones</label>
                       <input type="number" value={packSessions} onChange={e => setPackSessions(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-black outline-none" placeholder="6" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Precio Total $</label>
                       <input type="number" value={packTotal} onChange={e => setPackTotal(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-indigo-600 outline-none" placeholder="0.00" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Primer Pago $</label>
                       <input type="number" value={packInitialPay} onChange={e => setPackInitialPay(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-emerald-600 outline-none" placeholder="Opcional" />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowPackForm(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px]">Cerrar</button>
                    <button type="submit" className="flex-1 py-5 bg-lime-600 text-white rounded-3xl font-black uppercase text-[10px] shadow-xl">Confirmar Venta</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {payPackId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-slideUp">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8 text-center">Registrar Cobro de Saldo</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Importe a Cobrar $</label>
                    <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-emerald-100 rounded-3xl font-black text-3xl text-emerald-600 outline-none text-center" placeholder="0.00" autoFocus />
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setPayPackId(null)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px]">Cancelar</button>
                    <button onClick={handleAddPayment} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] shadow-xl">Cobrar Ahora</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EstheticsTab;
