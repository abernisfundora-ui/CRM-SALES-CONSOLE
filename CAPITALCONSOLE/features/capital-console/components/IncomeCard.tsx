import { FinancialEntityCard } from '@/components/ui/FinancialEntityCard';
import type { IncomeFrequency, IncomeItem, IncomeKind } from '@/types/incomes';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-MX', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
const frequencyLabel: Record<IncomeFrequency, string> = {
  una_vez: 'Una vez',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual'
};
const kindLabel: Record<IncomeKind, string> = {
  empleo: 'Empleo',
  negocio: 'Negocio',
  freelance: 'Freelance',
  comision: 'Comisión',
  renta: 'Renta',
  dividendos: 'Dividendos',
  intereses: 'Intereses',
  trading: 'Trading',
  cripto: 'Cripto',
  ingreso_pasivo: 'Ingreso pasivo',
  ingreso_manual: 'Ingreso manual',
  otros: 'Otros'
};

type IncomeCardProps = {
  income: IncomeItem;
  onEdit?: (income: IncomeItem) => void;
  onDelete?: (incomeId: string) => void;
};

function incomeFrequency(income: IncomeItem): IncomeFrequency {
  return income.frequency ?? income.incomeFrequency ?? 'mensual';
}

function originLabel(income: IncomeItem) {
  if (income.sourceType === 'derived_asset') return income.assetOriginName ?? 'Activo';
  if (income.origin) return income.origin;
  if (income.linkedAssetId) return 'Activo vinculado';
  return income.descripcion?.trim() || 'Manual';
}

function incomeType(income: IncomeItem) {
  if (income.incomeKind) return kindLabel[income.incomeKind];
  if (income.sourceType === 'derived_asset') return 'Ingreso pasivo';
  if (income.linkedAssetId) return 'Ingreso pasivo';
  return 'Ingreso manual';
}

function formatDate(value: string) {
  return value ? date.format(new Date(`${value}T00:00:00.000Z`)) : '—';
}

export function IncomeCard({ income, onEdit, onDelete }: IncomeCardProps) {
  const frequency = incomeFrequency(income);
  const origin = originLabel(income);
  const isDerived = income.sourceType === 'derived_asset';
  const grossMonthly = income.grossMonthlyAmount ?? income.incomeAmount ?? income.montoMensual;
  const netMonthly = income.netMonthlyAmount ?? income.montoMensual;
  const deductionsMonthly = income.totalDeductionsMonthly ?? Math.max(0, grossMonthly - netMonthly);
  const nextDate = income.nextDate ?? income.fecha;
  const status = income.status ?? 'activo';

  return (
    <FinancialEntityCard
      tone="income"
      title={income.nombre}
      subtitle={`${incomeType(income)} · ${isDerived ? `Activo · ${origin}` : origin}`}
      badges={[
        { label: incomeType(income), tone: 'income' },
        { label: status, tone: status === 'activo' ? 'positive' : 'neutral' }
      ]}
      kpiLabel="Ingreso neto mensual"
      kpiValue={money.format(netMonthly)}
      kpiTone="positive"
      meta={[
        { label: 'Bruto mensual', value: money.format(grossMonthly) },
        { label: 'Retenciones', value: money.format(deductionsMonthly), tone: deductionsMonthly > 0 ? 'warning' : 'default' },
        { label: 'Frecuencia', value: frequencyLabel[frequency] },
        { label: 'Próxima fecha', value: formatDate(nextDate) }
      ]}
      tags={[
        { label: income.isRecurring === false ? 'Único' : 'Recurrente', tone: 'positive' },
        { label: isDerived ? 'Derivado de activo' : 'Manual' },
        ...(income.taxProfile ? [{ label: income.taxProfile.toUpperCase() }] : []),
        { label: origin }
      ]}
      actions={[
        ...(isDerived && income.assetOriginId ? [{ label: 'Ver origen', href: `/create/asset?id=${income.assetOriginId}` }] : []),
        ...(income.sourceType === 'manual' ? [
          { label: 'Editar', onClick: () => onEdit?.(income) },
          { label: 'Eliminar', onClick: () => onDelete?.(income.id), destructive: true }
        ] : [])
      ]}
    />
  );
}
