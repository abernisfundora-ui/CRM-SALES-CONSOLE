import { SummaryMetric, SummaryPanel } from '@/components/ui/SummaryPanel';
import type { ExpenseItem } from '@/types/expenses';

type ExpensesSummaryProps = {
  expenses: ExpenseItem[];
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function ExpensesSummary({ expenses }: ExpensesSummaryProps) {
  const total = expenses.reduce((acc, item) => acc + item.montoMensual, 0);
  const fixed = expenses.filter((item) => item.tipo === 'fijo').reduce((acc, item) => acc + item.montoMensual, 0);
  const variable = expenses.filter((item) => item.tipo === 'variable').reduce((acc, item) => acc + item.montoMensual, 0);
  const monthly = expenses.filter((item) => item.frecuencia === 'mensual').length;

  return (
    <SummaryPanel eyebrow="Resumen gastos" value={money.format(total)} description="Equivalente mensual, recurrencia y presión de salida." tone="expense">
      <SummaryMetric label="Gastos fijos" value={money.format(fixed)} />
      <SummaryMetric label="Variables" value={money.format(variable)} />
      <SummaryMetric label="Mensuales" value={`${monthly} items`} />
      <SummaryMetric label="Registros" value={String(expenses.length)} />
    </SummaryPanel>
  );
}
