import { SummaryMetric, SummaryPanel } from '@/components/ui/SummaryPanel';
import type { IncomeItem } from '@/types/incomes';

type IncomeSummaryProps = {
  incomes: IncomeItem[];
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function IncomeSummary({ incomes }: IncomeSummaryProps) {
  const gross = incomes.reduce((acc, income) => acc + (income.grossMonthlyAmount ?? income.incomeAmount ?? income.montoMensual), 0);
  const net = incomes.reduce((acc, income) => acc + (income.netMonthlyAmount ?? income.montoMensual), 0);
  const retained = incomes.reduce((acc, income) => acc + (income.totalDeductionsMonthly ?? Math.max(0, (income.grossMonthlyAmount ?? income.montoMensual) - (income.netMonthlyAmount ?? income.montoMensual))), 0);
  const recurring = incomes.filter((income) => income.isRecurring !== false).length;

  return (
    <SummaryPanel eyebrow="Sistema de ingresos" value={money.format(net)} description="Cash flow real basado en neto mensual, origen y recurrencia." tone="income">
      <SummaryMetric label="Bruto" value={money.format(gross)} />
      <SummaryMetric label="Neto" value={money.format(net)} />
      <SummaryMetric label="Retenido" value={money.format(retained)} />
      <SummaryMetric label="Recurrentes" value={String(recurring)} />
    </SummaryPanel>
  );
}
