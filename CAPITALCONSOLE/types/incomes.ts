import type { AssetIncomeFrequency } from '@/types/assets';

export type IncomeSourceType = 'manual' | 'derived_asset';
export type IncomeFrequency = 'una_vez' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'anual';
export type IncomeKind =
  | 'empleo'
  | 'negocio'
  | 'freelance'
  | 'comision'
  | 'renta'
  | 'dividendos'
  | 'intereses'
  | 'trading'
  | 'cripto'
  | 'ingreso_pasivo'
  | 'ingreso_manual'
  | 'otros';
export type IncomeStatus = 'activo' | 'pausado' | 'proyectado' | 'cerrado';
export type IncomeTaxProfile = 'w2' | '1099' | 'informal' | 'corporativo' | 'inversion' | 'otro';
export type IncomeDeductionMode = 'porcentaje' | 'monto_fijo';

export type IncomeDeduction = {
  id: string;
  label: string;
  mode: IncomeDeductionMode;
  value: number;
};

export type IncomeItem = {
  id: string;
  nombre: string;
  montoMensual: number;
  fecha: string;
  descripcion?: string;
  sourceType: IncomeSourceType;
  assetOriginId?: string;
  assetOriginName?: string;
  incomeFrequency?: AssetIncomeFrequency;
  incomeAmount?: number;
  incomeStartDate?: string;
  incomeDayOfWeek?: number;
  incomeDayOfMonth?: number;
  frequency?: IncomeFrequency;
  linkedAssetId?: string;
  origin?: string;
  incomeKind?: IncomeKind;
  grossAmount?: number;
  grossMonthlyAmount?: number;
  netAmount?: number;
  netMonthlyAmount?: number;
  deductions?: IncomeDeduction[];
  totalDeductionsPerPayment?: number;
  totalDeductionsMonthly?: number;
  nextDate?: string;
  startDate?: string;
  status?: IncomeStatus;
  taxCategory?: string;
  taxProfile?: IncomeTaxProfile;
  notes?: string;
  isRecurring?: boolean;
  employer?: string;
};
