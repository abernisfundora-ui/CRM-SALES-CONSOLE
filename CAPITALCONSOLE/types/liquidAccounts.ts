export type LiquidAccountType = 'cash' | 'checking' | 'savings' | 'bank' | 'wallet' | 'other' | 'reserve';
export type LiquidAccountStatus = 'active' | 'inactive';

export type LiquidAccountItem = {
  id: string;
  nombre: string;
  tipo: LiquidAccountType;
  saldoActual: number;
  moneda: string;
  incluirEnLiquidez: boolean;
  institucion?: string;
  fechaActualizacion?: string;
  estado?: LiquidAccountStatus;
  notas?: string;
};
