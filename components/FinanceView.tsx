
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, PaymentMethod, Sale } from '../types';
import { getBusinessStrategy } from '../services/geminiService';

interface FinanceViewProps {
  expenses: Expense[];
  sales: Sale[];
  selectedDate: string;
  isMaster: boolean;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ expenses, sales, selectedDate, isMaster, onAddExpense, onDeleteExpense }) => {
  const [activeSubTab, setActiveSubTab] = useState<'egresos' | 'estrategia'>('egresos');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.SUPPLIES);
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const currentMonth = selectedDate.substring(0, 7);
  
  const filteredSales = sales.filter(s => s.date.startsWith(currentMonth));
  const filteredExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

  const financialSummary = useMemo(() => {
    const income = filteredSales.reduce((acc, s) => acc + s.amount, 0);
    const commissions = filteredSales.reduce((acc, s) => acc + s.commissionAmount, 0);
    const directExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = income - commissions - directExpenses;
    
    return { income, commissions, directExpenses, netProfit };
  }, [filteredSales, filteredExpenses]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    onAddExpense({
      date: selectedDate,
      category,
      description: desc,
      amount: parseFloat(amount),
      paymentMethod: payMethod
    });
    setDesc(''); setAmount('');
    alert("Gasto registrado correctamente.");
  };

  const handleStrategyAnalysis = async () => {
    setLoadingAi(true);
    const result = await getBusinessStrategy(filteredSales, filteredExpenses);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Resumen de Rentabilidad Mensual - SOLO PARA MAESTRO */}
      {isMaster && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-emerald-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos (Mes)</p>
            <p className="text-2xl font-black text-slate-900">${financialSummary.income.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-rose-400">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Comisiones</p>
            <p className="text-2xl font-black text-slate-900">-${financialSummary.commissions.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-orange-400">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos Operativos</p>
            <p className="text-2xl font-black text-slate-900">-${financialSummary.directExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Ganancia Real</p>
            <p className="text-2xl font-black">${financialSummary.netProfit.toLocaleString()}</p>
          </div>
        </div>
      )}

      <nav className="flex gap-4 border-b">
        <button onClick={() => setActiveSubTab('egresos')} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] ${activeSubTab === 'egresos' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Libro de Gastos</button>
        {isMaster && (
          <button onClick={() => setActiveSubTab('estrategia')} className={`pb-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] ${activeSubTab === 'estrategia' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Asesoría de Crecimiento ✨</button>
        )}
      </nav>

      {activeSubTab === 'egresos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-fit">
            <h3 className="font-black text-slate-800 uppercase text-xs mb-6 flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">💸</span> Cargar Nuevo Egreso
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input placeholder="Descripción del gasto..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" required />
              <input type="number" placeholder="Monto $" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-black text-lg text-rose-600 outline-none" required />
              <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none">
                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                <button type="button" onClick={() => setPayMethod(PaymentMethod.CASH)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${payMethod === PaymentMethod.CASH ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Efectivo</button>
                <button type="button" onClick={() => setPayMethod(PaymentMethod.MERCADO_PAGO)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${payMethod === PaymentMethod.MERCADO_PAGO ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>M. Pago</button>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Registrar Gasto</button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Gastos de {currentMonth}</h3>
              {isMaster && (
                <span className="bg-rose-100 text-rose-700 px-4 py-1 rounded-full text-[10px] font-black uppercase">Total: ${financialSummary.directExpenses.toLocaleString()}</span>
              )}
            </div>
            <table className="w-full">
              <thead className="bg-white border-b text-[9px] font-black uppercase text-slate-400">
                <tr>
                  <th className="px-8 py-4 text-left">Fecha</th>
                  <th className="px-8 py-4 text-left">Descripción / Categoría</th>
                  <th className="px-8 py-4 text-right">Monto</th>
                  {isMaster && <th className="px-8 py-4 text-center">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-slate-400">{exp.date}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 uppercase text-xs">{exp.description}</p>
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{exp.category}</p>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-rose-500">-${exp.amount.toLocaleString()}</td>
                    {isMaster && (
                      <td className="px-8 py-6 text-center">
                        <button onClick={() => onDeleteExpense(exp.id)} className="p-2 text-slate-300 hover:text-rose-500">✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'estrategia' && isMaster && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex-1">
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Plan Estratégico AI</h2>
                  <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Análisis financiero basado en Gemini para Depiclub</p>
                  <button 
                    onClick={handleStrategyAnalysis} 
                    disabled={loadingAi}
                    className="bg-indigo-600 hover:bg-white hover:text-indigo-900 text-white px-12 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl disabled:opacity-50"
                  >
                    {loadingAi ? 'Analizando tu Negocio...' : 'Generar Reporte de Crecimiento Pro'}
                  </button>
                </div>
                <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                  <h4 className="font-black uppercase text-[10px] text-indigo-400 mb-4">¿Qué analiza la IA?</h4>
                  <ul className="space-y-3 text-[10px] font-bold uppercase text-slate-300">
                    <li className="flex items-center gap-2">✅ Márgenes por tratamiento</li>
                    <li className="flex items-center gap-2">✅ Impacto de egresos en utilidad</li>
                    <li className="flex items-center gap-2">✅ Propuesta de packs y promos</li>
                    <li className="flex items-center gap-2">✅ Consejos de Marketing</li>
                  </ul>
                </div>
              </div>

              {aiAnalysis && (
                <div className="mt-12 bg-white/10 backdrop-blur-lg p-10 rounded-[3rem] border border-white/20">
                  <div className="prose prose-invert max-w-none text-indigo-50 font-medium text-sm leading-relaxed whitespace-pre-line">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
