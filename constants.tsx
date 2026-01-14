
import { Beautician, LaserZone, EstheticTreatment, WaxZone } from './types';

export const INITIAL_BEAUTICIANS: Beautician[] = [
  { id: '1', name: 'VERONICA', commissionRate: 40 },
  { id: '2', name: 'STELLA', commissionRate: 35 },
  { id: '3', name: 'CLARA', commissionRate: 30 },
  { id: '7', name: 'DEFINITIVA VERO', commissionRate: 20 },
];

export const INITIAL_ZONES: LaserZone[] = [
  { id: 'z1', name: 'Axilas', listPrice: 5000, promoPrice: 3500 },
  { id: 'z2', name: 'Cavado Completo', listPrice: 12000, promoPrice: 8500 },
  { id: 'z3', name: 'Pierna Entera', listPrice: 18000, promoPrice: 14000 },
  { id: 'z4', name: 'Rostro', listPrice: 6000, promoPrice: 4000 },
];

export const INITIAL_ESTHETIC_TREATMENTS: EstheticTreatment[] = [
  { id: 'e1', name: 'Limpieza Facial Profunda', price: 8500, commissionRate: 30 },
  { id: 'e2', name: 'Peeling Químico', price: 10000, commissionRate: 25 },
  { id: 'e3', name: 'Dermapen', price: 15000, commissionRate: 20 },
  { id: 'e4', name: 'Masaje Relajante (60 min)', price: 12000, commissionRate: 35 },
  { id: 'e5', name: 'Radiofrecuencia Facial', price: 9000, commissionRate: 25 },
];

export const INITIAL_WAX_ZONES: WaxZone[] = [
  { id: 'w1', name: 'Pierna Entera', price: 6500 },
  { id: 'w2', name: 'Cavado Completo', price: 4500 },
  { id: 'w3', name: 'Axilas', price: 2500 },
  { id: 'w4', name: 'Tira de Cola', price: 1800 },
  { id: 'w5', name: 'Rostro Completo', price: 3500 },
  { id: 'w6', name: 'COMBO 1: P. Entera + Cavado + Axila', price: 11000 },
  { id: 'w7', name: 'COMBO 2: Media P. + Cavado + Axila', price: 9000 },
];

export const APP_NAME = "Depiclub San Martin";

export const APP_THEME = {
  primary: 'lime-600',
  secondary: 'slate-600',
  accent: 'lime-500',
  bg: 'slate-50',
};
