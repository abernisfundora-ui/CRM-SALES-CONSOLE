import { SummaryMetric, SummaryPanel } from '@/components/ui/SummaryPanel';
import { getAssetMonthlyIncome } from '@/lib/finance/metrics';
import type { AssetItem } from '@/types/assets';
import type { LiquidAccountItem } from '@/types/liquidAccounts';

type AssetsSummaryProps = {
  assets: AssetItem[];
  liquidAccounts?: LiquidAccountItem[];
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function isLiquidAccountActive(account: LiquidAccountItem) {
  return (account.estado ?? (account.incluirEnLiquidez ? 'active' : 'inactive')) === 'active' && account.incluirEnLiquidez !== false;
}

export function AssetsSummary({ assets, liquidAccounts = [] }: AssetsSummaryProps) {
  const activeLiquidAccounts = liquidAccounts.filter(isLiquidAccountActive);
  const totalAssetValue = assets.reduce((acc, item) => acc + (item.valorActual || 0), 0);
  const activeLiquidity = activeLiquidAccounts.reduce((acc, account) => acc + (account.saldoActual || 0), 0);
  const totalValue = totalAssetValue + activeLiquidity;
  const totalIncome = assets.reduce((acc, item) => acc + getAssetMonthlyIncome(item), 0);
  const productive = assets.filter((item) => item.generaIngreso || item.wealthClass === 'productivo').length;
  const nonProductive = assets.length + activeLiquidAccounts.length - productive;

  return (
    <SummaryPanel eyebrow="Resumen activos" value={money.format(totalValue)} description="Valor registrado, productividad e ingreso mensual generado." tone="asset">
      <SummaryMetric label="Registros" value={String(assets.length + liquidAccounts.length)} />
      <SummaryMetric label="Productivos" value={String(productive)} />
      <SummaryMetric label="No productivos" value={String(Math.max(nonProductive, 0))} />
      <SummaryMetric label="Ingreso mensual" value={money.format(totalIncome)} />
    </SummaryPanel>
  );
}
