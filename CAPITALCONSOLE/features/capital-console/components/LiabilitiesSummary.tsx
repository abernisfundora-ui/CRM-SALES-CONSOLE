import { SummaryMetric, SummaryPanel } from '@/components/ui/SummaryPanel';
import type { LiabilityItem } from '@/types/liabilities';

type LiabilitiesSummaryProps = { liabilities: LiabilityItem[] };
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function LiabilitiesSummary({ liabilities }: LiabilitiesSummaryProps) {
  const totalBalance = liabilities.reduce((acc, item) => acc + item.saldoActual, 0);
  const monthlyCommitment = liabilities.reduce((acc, item) => acc + item.pagoMensual, 0);
  const good = liabilities.filter((item) => item.debtClass === 'deuda_buena' || item.linkedAssetId).length;
  const bad = liabilities.filter((item) => item.debtClass === 'deuda_mala' || (!item.linkedAssetId && item.tipo === 'Tarjeta de crédito')).length;

  return (
    <SummaryPanel eyebrow="Resumen pasivos" value={money.format(totalBalance)} description="Saldo actual, pago mensual y calidad patrimonial de deuda." tone="liability">
      <SummaryMetric label="Registros" value={String(liabilities.length)} />
      <SummaryMetric label="Pago mensual" value={money.format(monthlyCommitment)} />
      <SummaryMetric label="Deuda buena" value={String(good)} />
      <SummaryMetric label="Deuda mala" value={String(bad)} />
    </SummaryPanel>
  );
}
