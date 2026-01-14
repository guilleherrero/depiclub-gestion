
import React, { useState, useEffect } from 'react';
import { Sale, Beautician, Shift, ServiceType, PaymentMethod, LaserClient, LaserZone, LaserAppointment, LaserServiceDay, EstheticTreatment, EstheticAppointment, WaxZone, Expense, WhatsAppConfig, TreatmentPackage } from './types';
import { INITIAL_BEAUTICIANS, INITIAL_ZONES, INITIAL_ESTHETIC_TREATMENTS, INITIAL_WAX_ZONES } from './constants';
import { APP_CONFIG } from './appConfig';
import SaleForm from './components/SaleForm';
import ReportsView from './components/ReportsView';
import LaserTab from './components/LaserTab';
import EstheticsTab from './components/EstheticsTab';
import FinanceView from './components/FinanceView';
import ClientHistoryModal from './components/ClientHistoryModal';
import ClientsView from './components/ClientsView';
import AbsenteesView from './components/AbsenteesView';
import WhatsAppTab from './components/WhatsAppTab';

const INITIAL_WA_CONFIG: WhatsAppConfig = {
  accessToken: '',
  phoneNumberId: '',
  remindersTemplate: 'Hola {{nombre}}, te recordamos tu turno de {{servicio}} para el día {{fecha}} a las {{hora}} hs. ¡Te esperamos!',
  absenteesTemplate: 'Hola {{nombre}}, vimos que no pudiste asistir a tu turno hoy. ¿Te gustaría que lo reprogramemos?',
  promotionsTemplate: 'Hola {{nombre}}, ¡tenemos una promoción especial para vos este mes! Consultanos.',
  masterPin: '1234'
};

const DynamicLogo = () => (
  <div className="flex flex-col items-center select-none">
    <div className="relative flex items-end">
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 5 L61 35 L95 35 L68 55 L78 85 L50 65 L22 85 L32 55 L5 35 L39 35 Z" fill="none" stroke={APP_CONFIG.brand.secondaryColor} strokeWidth="4" strokeLinejoin="round"/>
          <path d="M35 55 Q50 45 75 15" fill="none" stroke={APP_CONFIG.brand.primaryColor} strokeWidth="10" strokeLinecap="round" className="drop-shadow-sm"/>
        </svg>
      </div>
      <div className="flex font-sans font-bold text-4xl tracking-tighter mt-4">
        <span style={{ color: APP_CONFIG.brand.primaryColor }}>{APP_CONFIG.brand.nameFirst}</span>
        <span style={{ color: APP_CONFIG.brand.secondaryColor }}>{APP_CONFIG.brand.nameSecond}</span>
      </div>
    </div>
    <div className="text-[8px] font-bold tracking-[0.2em] uppercase mt-0.5" style={{ color: APP_CONFIG.brand.secondaryColor }}>
      {APP_CONFIG.brand.subText}
    </div>
  </div>
);

const App: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [beauticians, setBeauticians] = useState<Beautician[]>(INITIAL_BEAUTICIANS);
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMaster, setIsMaster] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(INITIAL_WA_CONFIG);

  const [laserCommissionEnabled, setLaserCommissionEnabled] = useState(true);
  const [laserDefaultRate, setLaserDefaultRate] = useState(20);
  const [laserClients, setLaserClients] = useState<LaserClient[]>([]);
  const [laserZones, setLaserZones] = useState<LaserZone[]>(INITIAL_ZONES);
  const [laserAppointments, setLaserAppointments] = useState<LaserAppointment[]>([]);
  const [laserServiceDays, setLaserServiceDays] = useState<LaserServiceDay[]>([]);
  const [waxZones, setWaxZones] = useState<WaxZone[]>(INITIAL_WAX_ZONES);
  const [estheticTreatments, setEstheticTreatments] = useState<EstheticTreatment[]>(INITIAL_ESTHETIC_TREATMENTS);
  const [estheticAppointments, setEstheticAppointments] = useState<EstheticAppointment[]>([]);
  const [treatmentPackages, setTreatmentPackages] = useState<TreatmentPackage[]>([]);
  const [historyModalData, setHistoryModalData] = useState<{ id?: string; name: string } | null>(null);

  const STORAGE_KEY_PREFIX = `depiclub_${APP_CONFIG.brand.nameFirst}_v1_`;

  // Definir pestañas disponibles según configuración
  const navTabs = [
    { id: 'sales', label: 'Cera', icon: '🕯️', visible: APP_CONFIG.features.showWaxing },
    { id: 'laser', label: 'Láser', icon: '⚡', visible: APP_CONFIG.features.showLaser },
    { id: 'astics', label: 'Estética', icon: '✨', visible: APP_CONFIG.features.showEsthetics },
    { id: 'clients', label: 'Clientas', icon: '👥', visible: APP_CONFIG.features.showClients },
    { id: 'absentees', label: 'Ausentes', icon: '🚨', visible: APP_CONFIG.features.showClients },
    { id: 'whatsapp', label: 'Config', icon: '⚙️', visible: APP_CONFIG.features.showWhatsApp },
    { id: 'finance', label: 'Gastos', icon: '💰', visible: APP_CONFIG.features.showFinance },
    { id: 'reports', label: 'Reportes', icon: '📊', visible: APP_CONFIG.features.showReports }
  ].filter(t => t.visible);

  useEffect(() => {
    // Seleccionar la primera pestaña disponible al cargar
    if (navTabs.length > 0 && !activeTab) {
      setActiveTab(navTabs[0].id);
    }

    const load = (key: string) => localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (load('sales')) setSales(JSON.parse(load('sales')!));
    if (load('expenses')) setExpenses(JSON.parse(load('expenses')!));
    if (load('beauticians')) setBeauticians(JSON.parse(load('beauticians')!));
    if (load('clients')) setLaserClients(JSON.parse(load('clients')!));
    if (load('apps')) setLaserAppointments(JSON.parse(load('apps')!));
    if (load('days')) setLaserServiceDays(JSON.parse(load('days')!));
    if (load('zones')) setLaserZones(JSON.parse(load('zones')!));
    if (load('wax_zones')) setWaxZones(JSON.parse(load('wax_zones')!));
    if (load('esth_treats')) setEstheticTreatments(JSON.parse(load('esth_treats')!));
    if (load('esth_apps')) setEstheticAppointments(JSON.parse(load('esth_apps')!));
    if (load('esth_packs')) setTreatmentPackages(JSON.parse(load('esth_packs')!));
    if (load('wa_config')) setWaConfig(JSON.parse(load('wa_config')!));
  }, []);

  useEffect(() => {
    const save = (key: string, val: any) => localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
    if (sales.length > 0) save('sales', sales);
    save('expenses', expenses);
    save('beauticians', beauticians);
    save('clients', laserClients);
    save('apps', laserAppointments);
    save('days', laserServiceDays);
    save('zones', laserZones);
    save('wax_zones', waxZones);
    save('esth_treats', estheticTreatments);
    save('esth_apps', estheticAppointments);
    save('esth_packs', treatmentPackages);
    save('wa_config', waConfig);
  }, [sales, expenses, beauticians, laserClients, laserAppointments, laserServiceDays, laserZones, waxZones, estheticTreatments, estheticAppointments, treatmentPackages, waConfig]);

  const handleAddSale = (newSaleData: any, customDate?: string) => {
    const now = new Date();
    const beautician = beauticians.find(b => b.id === newSaleData.beauticianId);
    if (!beautician) return;
    let finalComm = 0;
    if (newSaleData.serviceType === ServiceType.WAX) finalComm = (newSaleData.amount * beautician.commissionRate) / 100;
    else if (newSaleData.serviceType === ServiceType.LASER) finalComm = (newSaleData.amount * laserDefaultRate) / 100;
    else if (newSaleData.serviceType === ServiceType.ESTHETICS) finalComm = newSaleData.calculatedCommission || 0;

    const sale: Sale = {
      ...newSaleData, id: crypto.randomUUID(),
      date: customDate || now.toISOString().split('T')[0],
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shift: now.getHours() < 14 ? Shift.MORNING : Shift.AFTERNOON,
      beauticianName: beautician.name, commissionAmount: finalComm
    };
    setSales(prev => [sale, ...prev]);
  };

  const handleUpdateLaserStatus = (id: string, status: any, method?: PaymentMethod) => {
    setLaserAppointments(prev => prev.map(a => a.id === id ? { ...a, status, paymentMethod: method } : a));
    const app = laserAppointments.find(a => a.id === id);
    if (status === 'attended' && app) {
      handleAddSale({
        ticketNumber: `L-${app.id.slice(0,4).toUpperCase()}`, amount: app.totalAmount, beauticianId: app.operatorId,
        serviceType: ServiceType.LASER, paymentMethod: method || PaymentMethod.CASH, customerName: app.clientName, laserAppointmentId: app.id
      }, laserServiceDays.find(d => d.id === app.serviceDayId)?.date);
    }
  };

  const handleUpdateEstheticStatus = (id: string, status: any, method?: PaymentMethod) => {
    setEstheticAppointments(prev => prev.map(a => a.id === id ? { ...a, status, paymentMethod: method } : a));
    const app = estheticAppointments.find(a => a.id === id);
    if (status === 'attended' && app) {
      if (app.packageId) {
        setTreatmentPackages(prev => prev.map(p => 
          p.id === app.packageId ? { ...p, usedSessions: p.usedSessions + 1, status: p.usedSessions + 1 >= p.totalSessions ? 'completed' : 'active' } : p
        ));
      }
      const comm = app.treatmentIds.reduce((acc, tid) => acc + ((estheticTreatments.find(t => t.id === tid)?.price || 0) * (estheticTreatments.find(t => t.id === tid)?.commissionRate || 0) / 100), 0);
      const saleAmount = app.packageId ? 0 : app.totalAmount;
      handleAddSale({
        ticketNumber: `E-${app.id.slice(0,4).toUpperCase()}`, amount: saleAmount, beauticianId: app.specialistId,
        serviceType: ServiceType.ESTHETICS, paymentMethod: method || PaymentMethod.CASH, customerName: app.clientName, estheticAppointmentId: app.id, calculatedCommission: comm,
        note: app.packageId ? 'Sesión de Pack' : ''
      }, app.date);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <DynamicLogo />
        <div className="flex items-center gap-4">
          <button onClick={() => isMaster ? setIsMaster(false) : setShowLogin(true)} className={`px-5 py-2.5 rounded-2xl border transition-all ${isMaster ? 'bg-lime-50 border-lime-200 text-lime-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{isMaster ? "Maestro" : "Acceso Staff"}</span>
          </button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 bg-slate-50 border rounded-xl text-xs font-black text-lime-600 outline-none" />
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-sm rounded-[2.5rem] p-10 shadow-2xl animate-slideUp">
             <h2 className="text-xl font-black text-center text-slate-900 uppercase tracking-tighter mb-8">PIN Maestro</h2>
             <form onSubmit={e => { e.preventDefault(); if(pin === (waConfig.masterPin || '1234')) { setIsMaster(true); setShowLogin(false); setPin(''); } else alert("PIN Incorrecto"); }} className="space-y-6">
                <input autoFocus type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl text-center font-black text-2xl tracking-[1em] outline-none" placeholder="PIN" />
                <button type="submit" className="w-full py-4 bg-lime-600 text-white rounded-2xl font-black uppercase text-[10px]">Entrar</button>
                <button type="button" onClick={() => setShowLogin(false)} className="w-full text-[9px] font-black text-slate-300 uppercase">Cancelar</button>
             </form>
          </div>
        </div>
      )}

      {historyModalData && (
        <ClientHistoryModal 
          clientId={historyModalData.id} clientName={historyModalData.name} sales={sales} laserApps={laserAppointments} 
          esthApps={estheticAppointments} serviceDays={laserServiceDays} laserZones={laserZones} waxZones={waxZones} 
          esthTreatments={estheticTreatments} onClose={() => setHistoryModalData(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-10 bg-white p-2 rounded-[2rem] shadow-lg border w-full md:w-fit overflow-x-auto whitespace-nowrap scrollbar-hide">
          {navTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-lime-600 text-white shadow-md' : 'text-slate-400 hover:bg-lime-50'}`}>
              <span className="text-sm">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'sales' && (
          <SaleForm sales={sales} selectedDate={selectedDate} beauticians={beauticians} waxZones={waxZones} clients={laserClients} onAddSale={handleAddSale} onAddClient={c => setLaserClients(prev => [...prev, {...c, id: crypto.randomUUID(), registrationDate: new Date().toISOString()}])} onShowHistory={(id, name) => setHistoryModalData({ id, name })} />
        )}
        
        {activeTab === 'laser' && (
          <LaserTab 
            isMaster={isMaster} clients={laserClients} zones={laserZones} appointments={laserAppointments} esthApps={estheticAppointments} sales={sales} serviceDays={laserServiceDays} beauticians={beauticians}
            laserCommEnabled={laserCommissionEnabled} laserDefaultRate={laserDefaultRate} onSetLaserCommEnabled={setLaserCommissionEnabled} onSetLaserDefaultRate={setLaserDefaultRate}
            onAddClient={c => setLaserClients(prev => [...prev, {...c, id: crypto.randomUUID(), registrationDate: new Date().toISOString()}])}
            onAddAppointment={a => setLaserAppointments(prev => [...prev, {...a, id: crypto.randomUUID(), status: 'scheduled'}])}
            onUpdateStatus={handleUpdateLaserStatus} onUpdateAppointment={(id, u) => setLaserAppointments(prev => prev.map(a => a.id === id ? { ...a, ...u } : a))}
            onAddServiceDay={d => setLaserServiceDays(prev => [...prev, {id: crypto.randomUUID(), date: d}])} onDeleteServiceDay={id => setLaserServiceDays(prev => prev.filter(d => d.id !== id))}
            onAddZone={z => setLaserZones(prev => [...prev, {...z, id: crypto.randomUUID()}])} onDeleteZone={id => setLaserZones(prev => prev.filter(z => z.id !== id))}
            onUpdateAppointmentZones={(id, zs, amt) => setLaserAppointments(prev => prev.map(a => a.id === id ? {...a, zonesIds: zs, totalAmount: amt} : a))}
            onMoveAppointment={(id, did) => setLaserAppointments(prev => prev.map(a => a.id === id ? {...a, serviceDayId: did} : a))}
            onUpdateZone={(id, u) => setLaserZones(prev => prev.map(z => z.id === id ? { ...z, ...u } : z))}
            onShowHistory={(id, name) => setHistoryModalData({ id, name })}
            waConfig={waConfig}
          />
        )}

        {activeTab === 'astics' && (
          <EstheticsTab 
            isMaster={isMaster} clients={laserClients} treatments={estheticTreatments} appointments={estheticAppointments} 
            beauticians={beauticians} selectedDate={selectedDate} packages={treatmentPackages}
            onAddAppointment={a => setEstheticAppointments(prev => [...prev, {...a, id: crypto.randomUUID(), status: 'scheduled'}])} 
            onUpdateStatus={handleUpdateEstheticStatus} onUpdateAppointment={(id, u) => setEstheticAppointments(prev => prev.map(a => a.id === id ? { ...a, ...u } : a))}
            onUpdateTreatment={(id, u) => setEstheticTreatments(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} 
            onAddTreatment={t => setEstheticTreatments(prev => [...prev, {...t, id: crypto.randomUUID()}])} 
            onAddClient={c => setLaserClients(prev => [...prev, {...c, id: crypto.randomUUID(), registrationDate: new Date().toISOString()}])}
            onShowHistory={(id, name) => setHistoryModalData({ id, name })}
            onAddPackage={p => {
              const pack: TreatmentPackage = { ...p, id: crypto.randomUUID(), usedSessions: 0, status: 'active' };
              setTreatmentPackages(prev => [...prev, pack]);
              if (p.paidAmount > 0) {
                handleAddSale({
                  ticketNumber: `PACK-${pack.id.slice(0,4).toUpperCase()}`, amount: p.paidAmount, beauticianId: beauticians[0].id,
                  serviceType: ServiceType.ESTHETICS, paymentMethod: PaymentMethod.CASH, customerName: pack.clientName, note: 'Venta/Pago de Pack'
                });
              }
            }}
            onUpdatePackage={(id, u) => setTreatmentPackages(prev => prev.map(p => p.id === id ? { ...p, ...u } : p))}
            onAddPackagePayment={(packId, amount, method) => {
              const pack = treatmentPackages.find(p => p.id === packId);
              if (pack) {
                setTreatmentPackages(prev => prev.map(p => p.id === packId ? { ...p, paidAmount: p.paidAmount + amount } : p));
                handleAddSale({
                   ticketNumber: `PAGO-${pack.id.slice(0,4).toUpperCase()}`, amount: amount, beauticianId: beauticians[0].id,
                   serviceType: ServiceType.ESTHETICS, paymentMethod: method, customerName: pack.clientName, note: 'Pago parcial de Pack'
                });
              }
            }}
            waConfig={waConfig}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView 
            clients={laserClients} appointments={laserAppointments} esthApps={estheticAppointments} sales={sales} 
            onAddClient={c => setLaserClients(prev => [...prev, {...c, id: crypto.randomUUID(), registrationDate: new Date().toISOString()}])}
            onShowHistory={(id, name) => setHistoryModalData({ id, name })}
            waConfig={waConfig}
          />
        )}

        {activeTab === 'absentees' && (
          <AbsenteesView 
            laserApps={laserAppointments} esthApps={estheticAppointments} clients={laserClients} serviceDays={laserServiceDays}
            onUpdateLaserStatus={(id, u) => setLaserAppointments(prev => prev.map(a => a.id === id ? { ...a, ...u } : a))}
            onUpdateEsthStatus={(id, u) => setEstheticAppointments(prev => prev.map(a => a.id === id ? { ...a, ...u } : a))}
            onRescheduleLaser={(app, dayId) => setLaserAppointments(prev => [...prev, {...app, id: crypto.randomUUID(), status: 'scheduled', serviceDayId: dayId}])}
            onRescheduleEsth={(app, date) => setEstheticAppointments(prev => [...prev, {...app, id: crypto.randomUUID(), status: 'scheduled', date: date}])}
            waConfig={waConfig}
          />
        )}

        {activeTab === 'whatsapp' && (
           <WhatsAppTab config={waConfig} onUpdateConfig={setWaConfig} />
        )}

        {activeTab === 'finance' && <FinanceView expenses={expenses} sales={sales} selectedDate={selectedDate} isMaster={isMaster} onAddExpense={e => setExpenses(prev => [...prev, {...e, id: crypto.randomUUID()}])} onDeleteExpense={id => setExpenses(prev => prev.filter(e => e.id !== id))} />}
        {activeTab === 'reports' && <ReportsView sales={sales} expenses={expenses} beauticians={beauticians} selectedDate={selectedDate} isMaster={isMaster} onUpdateBeauticians={setBeauticians} />}
      </main>
    </div>
  );
};

export default App;
