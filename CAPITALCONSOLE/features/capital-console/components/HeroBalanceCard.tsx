'use client';

import { AppCard } from '@/components/ui/AppCard';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/finance/metrics';
import { useLanguage } from '@/providers/LanguageProvider';
import type { FinancialSummary } from '@/types/home-dashboard';

type HeroBalanceCardProps = {
  summary: FinancialSummary;
};

export function HeroBalanceCard({ summary }: HeroBalanceCardProps) {
  const { t } = useLanguage();

  return (
    <AppCard className="relative overflow-hidden border-brand-400/30 shadow-glow">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.13em] text-ds-muted">Resumen financiero</p>
      <p className="mt-2 text-3xl font-semibold text-ds-text">{formatCurrency(summary.balance)}</p>
      <p className="mt-1 text-sm text-ds-muted">{t('summary.balanceGeneral')}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Metric label={t('summary.totalIncome')} value={formatCurrency(summary.income)} tone="text-module-income" />
        <Metric label={t('summary.totalExpenses')} value={formatCurrency(summary.expenses)} tone="text-module-expenses" />
        <Metric label="Neto" value={formatCurrency(summary.net)} tone="text-module-assets" className="col-span-2" />
      </div>
    </AppCard>
  );
}

function Metric({ label, value, tone, className }: { label: string; value: string; tone: string; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.02] p-2.5', className)}>
      <p className="text-[11px] uppercase tracking-[0.11em] text-ds-muted">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold', tone)}>{value}</p>
    </div>
  );
}
