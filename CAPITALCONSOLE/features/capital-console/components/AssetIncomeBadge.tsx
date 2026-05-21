import { Pill } from '@/components/ui/Pill';
import type { AssetIncomeFrequency } from '@/types/assets';

type AssetIncomeBadgeProps = {
  generaIngreso: boolean;
  ingresoMensual?: number;
  ingresoFrecuencia?: AssetIncomeFrequency;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const frequencyLabel: Record<AssetIncomeFrequency, string> = {
  semanal: 'sem',
  quincenal: '15d',
  mensual: 'mes',
  trimestral: 'trim',
  anual: 'año',
  una_vez: 'único'
};

export function AssetIncomeBadge({ generaIngreso, ingresoMensual, ingresoFrecuencia }: AssetIncomeBadgeProps) {
  if (!generaIngreso) {
    return <Pill module="calendar" state="inactive">Sin ingreso</Pill>;
  }

  const frequency = ingresoFrecuencia ?? 'mensual';
  return <Pill module="income">{`+ ${money.format(ingresoMensual ?? 0)} / ${frequencyLabel[frequency]}`}</Pill>;
}
