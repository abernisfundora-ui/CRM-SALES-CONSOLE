export type ExpenseType = 'fijo' | 'variable';
export type ExpenseFrequency = 'una_vez' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'anual';
export type ExpenseOriginType = 'manual' | 'liability-derived' | 'asset-derived';

export type ExpenseItem = {
  id: string;
  nombre: string;
  monto: number;
  montoMensual: number;
  fecha: string;
  frecuencia: ExpenseFrequency;
  tipo: ExpenseType;
  descripcion?: string;
  originType: ExpenseOriginType;
  liabilityOriginId?: string;
  liabilityOriginName?: string;
  assetOriginId?: string;
  assetOriginName?: string;
};
