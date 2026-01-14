
export enum ServiceType {
  WAX = 'CERA',
  LASER = 'LASER',
  ESTHETICS = 'ESTETICA'
}

export enum PaymentMethod {
  CASH = 'EFECTIVO',
  MERCADO_PAGO = 'MERCADO PAGO'
}

export enum Shift {
  MORNING = 'M',
  AFTERNOON = 'T'
}

export enum ExpenseCategory {
  SUPPLIES = 'INSUMOS',
  RENT_SERVICES = 'ALQUILER/SERVICIOS',
  SALARIES = 'SUELDOS/EXTRAS',
  MARKETING = 'MARKETING/PUBLICIDAD',
  OTHERS = 'OTROS'
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  remindersTemplate: string;
  absenteesTemplate: string;
  promotionsTemplate: string;
  geminiApiKey?: string;
  masterPin?: string; // Pin configurable
}

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface Beautician {
  id: string;
  name: string;
  commissionRate: number;
}

export interface Sale {
  id: string;
  date: string;
  timestamp: string;
  ticketNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  serviceType: ServiceType;
  shift: Shift;
  beauticianId: string;
  beauticianName: string;
  commissionAmount: number;
  isJornal?: boolean;
  customerName?: string;
  customerPhone?: string;
  laserAppointmentId?: string;
  estheticAppointmentId?: string;
  waxZonesIds?: string[];
  note?: string;
}

export interface TreatmentPackage {
  id: string;
  clientId: string;
  clientName: string;
  treatmentId: string;
  treatmentName: string;
  totalSessions: number;
  usedSessions: number;
  totalPrice: number;
  paidAmount: number;
  date: string;
  status: 'active' | 'completed';
}

export interface LaserZone {
  id: string;
  name: string;
  listPrice: number;
  promoPrice: number;
}

export interface WaxZone {
  id: string;
  name: string;
  price: number;
}

export interface LaserClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string;
}

export interface LaserServiceDay {
  id: string;
  date: string;
  notes?: string;
}

export interface LaserAppointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceDayId: string;
  zonesIds: string[];
  totalAmount: number;
  operatorId: string;
  status: 'scheduled' | 'attended' | 'no-show';
  paymentMethod?: PaymentMethod;
  notes?: string;
  recoveryStatus?: 'pending' | 'recovered' | 'lost'; 
}

export interface EstheticTreatment {
  id: string;
  name: string;
  price: number;
  commissionRate: number;
}

export interface EstheticAppointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  treatmentIds: string[];
  totalAmount: number;
  specialistId: string;
  status: 'scheduled' | 'attended' | 'no-show';
  paymentMethod?: PaymentMethod;
  recoveryStatus?: 'pending' | 'recovered' | 'lost';
  notes?: string;
  packageId?: string; // Si la sesión pertenece a un pack
}
