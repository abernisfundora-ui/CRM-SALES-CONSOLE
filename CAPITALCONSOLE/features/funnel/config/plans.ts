import type { PlanConfig } from '@/features/funnel/types';

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: 'texas-power-saver',
    name: 'Texas Power Saver',
    description: 'Plan simple para estimación estándar',
    type: 'flat',
    energyRate: 0.102,
    oncorRate: 0.056,
    baseCharge: 9.95,
    taxRate: 0.0233
  },
  {
    id: 'days-free',
    name: 'Days Free',
    description: 'Ideal si concentras consumo durante el día gratis',
    type: 'free-hours',
    paidEnergyRate: 0.155,
    oncorRate: 0.056,
    baseCharge: 9.95,
    taxRate: 0.0233,
    freePeriodLabel: 'día'
  },
  {
    id: 'free-nights',
    name: 'Free Nights',
    description: 'Crédito por consumo en horario nocturno',
    type: 'free-hours',
    paidEnergyRate: 0.31,
    oncorRate: 0.00495,
    baseCharge: 4.95,
    taxRate: 0.0125,
    freePeriodLabel: 'noche'
  }
];

export const DEFAULT_PLAN_ID = PLAN_CONFIGS[0]?.id ?? 'texas-power-saver';
