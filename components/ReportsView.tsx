
import React, { useMemo, useState } from 'react';
import { Sale, Beautician, PaymentMethod, ServiceType, Expense } from '../types';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getDailyInsights } from '../services/geminiService';

interface ReportsViewProps {
  sales: Sale[];
  expenses: Expense[];
  beauticians: Beautician[];
  selectedDate: string;
  isMaster: boolean;
  onUpdateBeauticians?: (beauticians: Beautician[]) => void;
}

type ReportMode = 'daily' | 'monthly' | 'staff';

const ReportsView: React.FC<ReportsViewProps> = ({ sales, expenses, beauticians, selectedDate, isMaster, onUpdateBeauticians }) => {
  const [reportMode, setReportMode] = useState<ReportMode>('daily');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffComm, setNewStaffComm] = useState('30');

  const currentMonth = selectedDate.substring(0, 7);
  
  const filteredSales = useMemo(() => {
    if (reportMode === 'staff') return [];
    const mode = isMaster ? reportMode : 'daily';
    return mode === 'daily' 
      ? sales.filter(s => s.date === selectedDate)
      : sales.filter(s => s.date.startsWith(currentMonth));
  }, [sales, selectedDate, currentMonth, reportMode, isMaster]);

  const filteredExpenses = useMemo(() => {
    if (reportMode === 'staff') return [];
    const mode = isMaster ? reportMode : 'daily';
    return mode === 'daily'
      ? expenses.filter(e => e.date === selectedDate)
      : expenses.filter(e => e.date.startsWith(currentMonth));
  }, [expenses, selectedDate, currentMonth, reportMode, isMaster]);

  const stats = useMemo(() => {
    const report = { 
      totalSales: 0, 
      cash: 0, 
      mp: 0, 
      commissions: 0, 
      expensesTotal: 0,
      expensesCash: 0,
      profit: 0,
      cashEnvelope: 0,
      count: filteredSales.length, 
      avgTicket: 0,
      byService: [
        { name: 'Cera', value: 0, color: '#a3c639', icon: '🕯️' },
        { name: 'Láser', value: 0, color: '#707070', icon: '⚡' },
        { name: 'Estética', value: 0, color: '#c0c0c0', icon: '✨' }
      ],
      staffRank: [] as any[]
    };

    const staffMap: { [id: string]: any } = {};

    filteredSales.forEach(s => {
      report.totalSales += s.amount;
      report.commissions += s.commissionAmount;
      if (s.paymentMethod === PaymentMethod.CASH) report.cash += s.amount;
      else report.mp += s.amount;

      if (s.serviceType === ServiceType.WAX) report.byService[0].value += s.amount;
      else if (s.serviceType === ServiceType.LASER) report.byService[1].value += s.amount;
      else if (s.serviceType === ServiceType.ESTHETICS) report.byService[2].value += s.amount;

      if (!staffMap[s.beauticianId]) {
        staffMap[s.beauticianId] = { 
          id: s.beauticianId,
          name: s.beauticianName, 
          ventas: 0, 
          comision: 0,
          tickets: [] as Sale[]
        };
      }
      staffMap[s.beauticianId].ventas += s.amount;
      staffMap[s.beauticianId].comision += s.commissionAmount;
      staffMap[s.beauticianId].tickets.push(s);
    });

    report.expensesTotal = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    report.expensesCash = filteredExpenses
      .filter(e => e.paymentMethod === PaymentMethod.CASH)
      .reduce((acc, exp) => acc + exp.amount, 0);

    report.profit = report.totalSales - report.commissions - report.expensesTotal;
    report.cashEnvelope = report.cash - report.commissions - report.expensesCash;
    report.avgTicket = report.count > 0 ? report.totalSales / report.count : 0;
    report.staffRank = Object.values(staffMap).sort((a, b) => b.ventas - a.ventas);

    return report;
  }, [filteredSales, filteredExpenses]);

  const handleExportExcel = () => {
    const data = filteredSales.map(s => ({
      Fecha: s.date,
      Ticket: s.ticketNumber,
      Clienta: s.customerName || 'S/D',
      Servicio: s.serviceType,
      Importe: s.amount,
      Pago: s.paymentMethod,
      Personal: s.beauticianName,
      Comision: s.commissionAmount
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, `Depiclub_Reporte_${selectedDate}.xlsx`);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !onUpdateBeauticians) return;
    const newBeautician: Beautician = {
      id: crypto.randomUUID(),
      name: newStaffName.toUpperCase(),
      commissionRate: parseFloat(newStaffComm)
    };
    onUpdateBeauticians([...beauticians, newBeautician]);
    setNewStaffName('');
    alert("Personal agregado correctamente.");
  };

  const handleUpdateStaff = (id: string, field: 'name' | 'commissionRate', value: any) => {
    if (!onUpdateBeauticians) return;
    const updated = beauticians.map(b => b.id === id ? { ...b, [field]: field === 'name' ? value.toUpperCase() : parseFloat(value) } : b);
    onUpdateBeauticians(updated);
  };

  const handleRemoveStaff = (id: string) => {
    if (!onUpdateBeauticians || !confirm("¿Eliminar este integrante del staff?")) return;
    onUpdateBeauticians(beauticians.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Panel de Inteligencia</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
            {isMaster ? "Control integral de rentabilidad operativa" : "Resumen de ventas y cierre de caja"}
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleExportExcel} className="bg-emerald-600 text-white px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
             <span>📥</span> Excel
           </button>
          {isMaster && (
            <div className="flex gap-2 p-1.5 bg-white border rounded-[2rem] shadow-sm">
              <button onClick={() => setReportMode('daily')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'daily' ? 'bg-lime-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Diario</button>
              <button onClick={() => setReportMode('monthly')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'monthly' ? 'bg-lime-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Mensual</button>
              <button onClick={() => setReportMode('staff')} className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${reportMode === 'staff' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Staff</button>
            </div>
          )}
        </div>
      </div>

      {reportMode !== 'staff' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full">
                <div>
                  <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cierre de Caja (Efectivo en Sobre)</p>
                  <p className="text-5xl font-black tracking-tighter">${stats.cashEnvelope.toLocaleString()}</p>
                  <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mt-3">Dinero físico real a entregar</p>
                </div>
                <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 text-[10px] font-bold uppercase tracking-tight min-w-[180px]">
                  <div className="flex justify-between mb-2"><span>(+) Ventas Cash</span><span>${stats.cash.toLocaleString()}</span></div>
                  <div className="flex justify-between mb-2 text-rose-300"><span>(-) Comisiones</span><span>-${stats.commissions.toLocaleString()}</span></div>
                  <div className="flex justify-between text-rose-300"><span>(-) Gastos Cash</span><span>-${stats.expensesCash.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border flex flex-col justify-center">
              <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-1">Mercado Pago</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">${stats.mp.toLocaleString()}</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border flex flex-col justify-center">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Total Bruto</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">${stats.totalSales.toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{stats.count} Tickets</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Liquidación por Profesional</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {stats.staffRank.map((staff) => (
                <div key={staff.id} className="bg-white rounded-[3rem] shadow-xl border overflow-hidden animate-slideUp">
                  <div className="p-8 border-b bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-lime-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg uppercase">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{staff.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Liquidación de servicios</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="bg-white border p-4 rounded-2xl text-center min-w-[120px]">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Bruto</p>
                          <p className="text-lg font-black text-slate-900">${staff.ventas.toLocaleString()}</p>
                       </div>
                       <div className="bg-slate-900 text-white p-4 rounded-2xl text-center min-w-[120px] shadow-lg">
                          <p className="text-[8px] font-black text-lime-400 uppercase mb-1">Comisión</p>
                          <p className="text-lg font-black text-lime-400">${staff.comision.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                        <tr>
                          <th className="px-10 py-5">Ticket</th>
                          <th className="px-10 py-5">Horario</th>
                          <th className="px-10 py-5">Servicio</th>
                          <th className="px-10 py-5 text-right">Bruto</th>
                          <th className="px-10 py-5 text-right text-lime-600">Comisión ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staff.tickets.map((ticket: Sale) => (
                          <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-10 py-5 font-black text-slate-700 uppercase">#{ticket.ticketNumber}</td>
                            <td className="px-10 py-5 text-xs font-bold text-slate-400">{ticket.timestamp}</td>
                            <td className="px-10 py-5">
                              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                                {ticket.serviceType}
                              </span>
                            </td>
                            <td className="px-10 py-5 text-right font-bold text-slate-600">${ticket.amount.toLocaleString()}</td>
                            <td className="px-10 py-5 text-right font-black text-lime-600">
                              {ticket.isJornal ? <span className="text-slate-300">JORNAL</span> : `$${ticket.commissionAmount.toLocaleString()}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {reportMode === 'staff' && isMaster && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-4 h-fit">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Nuevo Integrante</h3>
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre y Apellido</label>
                  <input 
                    type="text" 
                    value={newStaffName} 
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border rounded-2xl font-black uppercase text-sm outline-none focus:border-indigo-500 transition-all" 
                    placeholder="Ej: MARISA PEREZ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisión Cera (%)</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-indigo-400">%</span>
                    <input 
                      type="number" 
                      value={newStaffComm} 
                      onChange={e => setNewStaffComm(e.target.value)}
                      className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-lg outline-none focus:border-indigo-500 transition-all" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:-translate-y-0.5 transition-all">
                  Registrar Staff
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nómina y Comisiones</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {beauticians.map(b => (
                  <div key={b.id} className="p-8 flex flex-col md:flex-row items-center gap-8 group hover:bg-slate-50/50 transition-colors">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center font-black text-2xl uppercase shadow-sm">
                      {b.name.charAt(0)}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                        <input 
                          type="text" 
                          value={b.name} 
                          onChange={e => handleUpdateStaff(b.id, 'name', e.target.value)}
                          className="w-full p-3 bg-white border border-slate-100 rounded-xl font-black uppercase text-sm outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comisión Cera</label>
                        <div className="relative">
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-indigo-300 text-xs">%</span>
                          <input 
                            type="number" 
                            value={b.commissionRate} 
                            onChange={e => handleUpdateStaff(b.id, 'commissionRate', e.target.value)}
                            className="w-full p-3 bg-white border border-slate-100 rounded-xl font-black text-sm outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveStaff(b.id)}
                      className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Eliminar del sistema"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
