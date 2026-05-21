import { FinancialEntityCard } from '@/components/ui/FinancialEntityCard';
import type { ExpenseItem, ExpenseOriginType } from '@/types/expenses';

type ExpenseCardProps = {
  expense: ExpenseItem;
  onEdit?: (expense: ExpenseItem) => void;
  onDelete?: (expenseId: string) => void;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-MX', { month: 'short', day: '2-digit', year: 'numeric' });
const frequencyLabel = {
  una_vez: 'Una vez',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual'
} as const;

const originLabel: Record<ExpenseOriginType, string> = {
  manual: 'Manual',
  'liability-derived': 'Derivado de pasivo',
  'asset-derived': 'Derivado de activo'
};

function originName(expense: ExpenseItem) {
  if (expense.originType === 'asset-derived') return expense.assetOriginName;
  if (expense.originType === 'liability-derived') return expense.liabilityOriginName;
  return null;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const relatedOrigin = originName(expense);
  const canMutate = expense.originType === 'manual';
  const isRecurring = expense.frecuencia !== 'una_vez';

  return (
    <FinancialEntityCard
      tone="expense"
      title={expense.nombre}
      subtitle={expense.descripcion ?? `${expense.tipo} · ${originLabel[expense.originType]}`}
      badges={[
        { label: expense.tipo, tone: 'expense' },
        { label: isRecurring ? 'Recurrente' : 'Único', tone: isRecurring ? 'negative' : 'neutral' }
      ]}
      kpiLabel="Gasto mensual"
      kpiValue={money.format(expense.montoMensual)}
      kpiTone="negative"
      meta={[
        { label: 'Monto base', value: money.format(expense.monto), tone: 'negative' },
        { label: 'Frecuencia', value: frequencyLabel[expense.frecuencia] },
        { label: 'Origen', value: relatedOrigin ?? originLabel[expense.originType] },
        { label: 'Fecha', value: date.format(new Date(expense.fecha)) }
      ]}
      tags={[
        { label: originLabel[expense.originType] },
        { label: isRecurring ? 'Recurrente' : 'No recurrente', tone: isRecurring ? 'negative' : 'neutral' },
        ...(relatedOrigin ? [{ label: relatedOrigin }] : [])
      ]}
      actions={canMutate ? [
        { label: 'Editar', onClick: () => onEdit?.(expense) },
        { label: 'Eliminar', onClick: () => onDelete?.(expense.id), destructive: true }
      ] : []}
    />
  );
}
