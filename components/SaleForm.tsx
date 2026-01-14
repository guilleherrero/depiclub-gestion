
import React, { useState, useEffect, useMemo } from 'react';
import { Beautician, ServiceType, PaymentMethod, WaxZone, Sale, LaserClient } from '../types';

interface SaleFormProps {
  sales: Sale[];
  selectedDate: string;
  beauticians: Beautician[];
  waxZones: WaxZone[];
  clients: LaserClient[];
  onAddSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'date' | 'shift' | 'beauticianName' | 'commissionAmount'>) => void;
  onAddClient?: (client: Omit<LaserClient, 'id' | 'registrationDate'>) => void;
  onShowHistory?: (id: string, name: string) => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ sales, selectedDate, beauticians, waxZones, clients, onAddSale, onAddClient, onShowHistory }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [beauticianId, setBeauticianId] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.WAX);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selClientId, setSelClientId] = useState('');
  const [selectedWaxZones, setSelectedWaxZones] = useState<string[]>([]);

  const dailyWaxSales = useMemo(() => 
    sales.filter(s => s.date === selectedDate && s.serviceType === ServiceType.WAX)
  , [sales, selectedDate]);

  const summary = useMemo(() => {
    const report = { totalBill: 0, cash: 0, mp: 0, totalCommissions: 0, staffStats: [] as any[] };
    const staffMap: Record<string, any> = {};
    dailyWaxSales.forEach(s => {
      report.totalBill += s.amount;
      report.totalCommissions += s.commissionAmount;
      if (s.paymentMethod === PaymentMethod.CASH) report.cash += s.amount;
      else report.mp += s.amount;
      if (!staffMap[s.beauticianName]) staffMap[s.beauticianName] = { total: 0, commission: 0 };
      staffMap[s.beauticianName].total += s.amount;
      staffMap[s.beauticianName].commission += s.commissionAmount;
    });
    report.staffStats = Object.entries(staffMap).map(([name, data]) => ({ name, ...data }));
    return report;
  }, [dailyWaxSales]);

  const filteredClients = useMemo(() => {
    if (!clientName || selClientId) return [];
    return clients.filter(c => c.name.toLowerCase().includes(clientName.toLowerCase())).slice(0, 5);
  }, [clients, clientName, selClientId]);

  const getWaxSessionCount = (name: string, zoneId: string) => {
    if (!name) return 1;
    return sales.filter(s => s.customerName?.toUpperCase() === name.toUpperCase() && s.waxZonesIds?.includes(zoneId)).length + 1;
  };

  useEffect(() => {
    if (selectedWaxZones.length > 0) {
      const total = selectedWaxZones.reduce((acc, id) => acc + (waxZones.find(w => w.id === id)?.price || 0), 0);
      setAmount(total.toString());
    }
  }, [selectedWaxZones, waxZones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber || !amount || !beauticianId) return alert("Completa Ticket, Importe y Staff");

    // Si es una clienta nueva (no seleccionada de la lista pero con nombre y teléfono)
    if (clientName && clientPhone && !selClientId && onAddClient) {
      const exists = clients.find(c => c.phone === clientPhone);
      if (!exists) {
        onAddClient({ name: clientName.toUpperCase(), phone: clientPhone, email: '' });
      }
    }

    onAddSale({
      ticketNumber,
      amount: parseFloat(amount),
      beauticianId,
      serviceType: ServiceType.WAX,
      paymentMethod,
      customerName: clientName.toUpperCase(),
      customerPhone: clientPhone,
      waxZonesIds: selectedWaxZones
    });

    setTicketNumber(''); setAmount(''); setClientName(''); setClientPhone(''); setSelClientId(''); setSelectedWaxZones([]);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-500 via-emerald-500 to-slate-400"></div>
        <h2 className="text-2xl font-black mb-10 text-slate-900 uppercase tracking-tighter flex items-center gap-4">
          <span className="p-3 bg-lime-600 text-white rounded-[1.5rem] shadow-xl">🕯️</span> Nuevo Registro Cera
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Ticket *</label>
              <input type="text" value={ticketNumber} onChange={e => setTicketNumber(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-black text-lg outline-none" placeholder="000" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clienta (Nombre)</label>
              <div className="relative">
                <input type="text" value={clientName} onChange={e => { setClientName(e.target.value); if(selClientId) setSelClientId(''); }} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none" placeholder="Buscador predictivo..." />
                {filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden border-lime-200">
                    {filteredClients.map(c => (
                      <button key={c.id} type="button" onClick={() => { setSelClientId(c.id); setClientName(c.name); setClientPhone(c.phone); }} className="w-full p-4 text-left hover:bg-lime-600 hover:text-white border-b group flex justify-between">
                        <span className="text-[10px] font-black uppercase">{c.name}</span>
                        <span className="text-[8px] font-bold opacity-50">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none" placeholder="Opcional" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff / Pago</label>
              <div className="flex gap-2">
                <select value={beauticianId} onChange={e => setBeauticianId(e.target.value)} className="flex-1 p-4 bg-slate-50 border-2 rounded-2xl font-black text-xs outline-none appearance-none">
                  <option value="">Depiladora...</option>
                  {beauticians.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button type="button" onClick={() => setPaymentMethod(prev => prev === PaymentMethod.CASH ? PaymentMethod.MERCADO_PAGO : PaymentMethod.CASH)} className={`px-4 rounded-2xl border-2 font-black text-[8px] uppercase tracking-widest transition-all ${paymentMethod === PaymentMethod.CASH ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {paymentMethod === PaymentMethod.CASH ? 'Cash' : 'MP'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selección de Zonas {clientName && <span className="text-lime-600">- Rastreo Activo</span>}</label>
              <button type="button" onClick={() => setSelectedWaxZones([])} className="text-[9px] font-black text-slate-300 uppercase hover:text-rose-500">Limpiar</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {waxZones.map(zone => {
                const isSelected = selectedWaxZones.includes(zone.id);
                const sessionNum = getWaxSessionCount(clientName, zone.id);
                return (
                  <button key={zone.id} type="button" onClick={() => isSelected ? setSelectedWaxZones(selectedWaxZones.filter(id => id !== zone.id)) : setSelectedWaxZones([...selectedWaxZones, zone.id])} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${isSelected ? 'bg-lime-600 border-lime-700 text-white shadow-lg scale-105' : 'bg-white border-slate-50 text-slate-600 hover:border-lime-100'}`}>
                    {clientName && <span className={`absolute top-2 left-2 text-[7px] font-black ${isSelected ? 'text-white/50' : 'text-slate-300'}`}>S#{sessionNum}</span>}
                    <span className="text-[9px] font-black uppercase text-center leading-tight mb-1">{zone.name}</span>
                    <span className="text-[10px] font-bold opacity-70">${zone.price.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 gap-6">
            <div className="flex items-center gap-4">
               <span className="text-3xl font-black text-lime-600">$</span>
               <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-transparent border-none text-4xl font-black text-slate-900 focus:outline-none w-32" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-4">Importe<br/>Final</p>
            </div>
            <button type="submit" className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-lime-600 transition-all">Registrar Visita</button>
          </div>
        </form>
      </div>

      {/* Stats e Historial Diario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border shadow-md"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Hoy</p><p className="text-xl font-black text-slate-900">${summary.totalBill.toLocaleString()}</p></div>
          <div className="bg-white p-6 rounded-3xl border shadow-md"><p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Efectivo</p><p className="text-xl font-black text-slate-900">${summary.cash.toLocaleString()}</p></div>
          <div className="bg-white p-6 rounded-3xl border shadow-md"><p className="text-[8px] font-black text-blue-500 uppercase mb-1">M. Pago</p><p className="text-xl font-black text-slate-900">${summary.mp.toLocaleString()}</p></div>
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl"><p className="text-[8px] font-black text-lime-400 uppercase mb-1">Comisiones</p><p className="text-xl font-black text-white">${summary.totalCommissions.toLocaleString()}</p></div>
        </div>

        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border shadow-xl">
           <h3 className="font-black text-slate-900 uppercase text-[10px] mb-6 border-b pb-4">Liquidación Staff</h3>
           <div className="space-y-3">
             {summary.staffStats.map(s => (
               <div key={s.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                 <span className="text-[10px] font-black uppercase text-slate-600">{s.name}</span>
                 <span className="text-xs font-black text-indigo-600">${s.commission.toLocaleString()}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[8px] font-black uppercase text-slate-400 border-b">
              <tr><th className="px-8 py-4">Ticket / Clienta</th><th className="px-8 py-4">Servicio</th><th className="px-8 py-4 text-right">Importe</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyWaxSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <p className="font-black text-slate-800 uppercase text-[10px]">#{sale.ticketNumber} - {sale.customerName || 'S/D'}</p>
                    <p className="text-[8px] font-bold text-slate-400">{sale.beauticianName}</p>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {sale.waxZonesIds?.map(zid => (
                        <span key={zid} className="px-2 py-0.5 bg-lime-50 text-lime-700 text-[7px] font-black uppercase rounded">
                          {waxZones.find(w => w.id === zid)?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right font-black text-slate-900">
                    ${sale.amount.toLocaleString()}
                    <span className={`block text-[7px] uppercase ${sale.paymentMethod === PaymentMethod.CASH ? 'text-emerald-500' : 'text-blue-500'}`}>{sale.paymentMethod}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SaleForm;
