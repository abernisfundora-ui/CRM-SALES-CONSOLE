'use client';

import { useId, useMemo, useState } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { useLanguage } from '@/providers/LanguageProvider';

const COLORS = {
  assets: '#25529B',
  liabilities: '#B46A34',
  income: '#17814D',
  expenses: '#B64A4A'
} as const;

type DistributionId = keyof typeof COLORS;

type DistributionRow = {
  id: DistributionId;
  name: string;
  value: number;
  color: string;
  description: string;
};

function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function PremiumDistributionDonut({ rows, total, netWorth, activeId, onActiveChange, locale, title }: {
  rows: DistributionRow[];
  total: number;
  netWorth: number;
  activeId: DistributionId | null;
  onActiveChange: (id: DistributionId | null) => void;
  locale: string;
  title: string;
}) {
  const radius = 70;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * radius;
  const visibleRows = rows.filter((row) => row.value > 0);
  const glowId = `financial-distribution-glow-${useId().replace(/:/g, '')}`;
  const centerRow = activeId ? rows.find((row) => row.id === activeId) ?? null : null;
  const centerPct = centerRow && total > 0 ? (centerRow.value / total) * 100 : 0;
  let offset = 0;

  return (
    <div className="relative mx-auto flex h-[286px] w-full max-w-[318px] items-center justify-center sm:h-[300px] md:h-[322px] md:max-w-[338px]">
      <div className="absolute h-[73%] w-[73%] rounded-full bg-[radial-gradient(circle,rgba(255,255,252,0.98)_0%,rgba(255,255,252,0.82)_50%,rgba(255,255,252,0)_69%)] shadow-[0_34px_90px_rgba(2,21,38,0.10)]" />
      <svg className="relative h-full w-full -rotate-90 overflow-visible drop-shadow-[0_24px_36px_rgba(2,21,38,0.12)]" viewBox="0 0 200 200" role="img" aria-label={title} onMouseLeave={() => onActiveChange(null)}>
        <defs>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06 0 0 0 0 0.14 0 0 0 0 0.22 0 0 0 0.15 0" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(2,21,38,0.05)" strokeWidth={strokeWidth} />
        {visibleRows.map((row, index) => {
          const segmentLength = total > 0 ? (row.value / total) * circumference : 0;
          const dashLength = segmentLength;
          const gapLength = Math.max(0, circumference - segmentLength);
          const dashOffset = -offset;
          const isActive = activeId === row.id;
          const isDimmed = activeId !== null && !isActive;
          offset += segmentLength;

          return (
            <circle
              key={row.id}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={row.color}
              strokeWidth={isActive ? strokeWidth + 5 : strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${dashLength} ${gapLength}`}
              strokeDashoffset={dashOffset}
              filter={`url(#${glowId})`}
              opacity={isDimmed ? 0.24 : 0.98}
              className="cursor-pointer transition-all duration-300 ease-out"
              onMouseEnter={() => onActiveChange(row.id)}
              onFocus={() => onActiveChange(row.id)}
              tabIndex={0}
            >
              <title>{`${row.name}: ${money(row.value, locale)}`}</title>
              <animate attributeName="stroke-dashoffset" from={circumference + dashOffset} to={dashOffset} dur="820ms" begin={`${index * 90}ms`} calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze" />
            </circle>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute flex h-[42%] w-[42%] flex-col items-center justify-center rounded-full border border-[rgba(2,21,38,0.06)] bg-[rgba(255,255,252,0.86)] px-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_40px_rgba(2,21,38,0.08)] backdrop-blur-md transition duration-300">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#79838B]">{centerRow ? centerRow.name : title}</p>
        <p className="mt-1 max-w-full truncate text-[1.35rem] font-black leading-none tracking-[-0.06em] text-[#071827] md:text-[1.55rem]">
          {centerRow ? `${centerPct.toFixed(0)}%` : money(netWorth, locale)}
        </p>
      </div>
    </div>
  );
}

export function FinancialDistributionPanel({ assets, liabilities, income, expenses }: { assets: number; liabilities: number; income: number; expenses: number }) {
  const { language, t } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const [activeId, setActiveId] = useState<DistributionId | null>(null);
  const rows = useMemo<DistributionRow[]>(() => [
    { id: 'assets', name: t('chart.distribution.assets'), value: Math.max(0, assets), color: COLORS.assets, description: t('chart.distribution.assets.description') },
    { id: 'liabilities', name: t('chart.distribution.liabilities'), value: Math.max(0, liabilities), color: COLORS.liabilities, description: t('chart.distribution.liabilities.description') },
    { id: 'income', name: t('chart.distribution.income'), value: Math.max(0, income), color: COLORS.income, description: t('chart.distribution.income.description') },
    { id: 'expenses', name: t('chart.distribution.expenses'), value: Math.max(0, expenses), color: COLORS.expenses, description: t('chart.distribution.expenses.description') }
  ], [assets, liabilities, income, expenses, t]);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const netWorth = Math.max(0, assets - liabilities);
  const activeRow = activeId ? rows.find((row) => row.id === activeId) ?? null : null;

  return (
    <AppCard className="h-full overflow-hidden p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black normal-case tracking-[-0.04em] text-[#071827]">{t('chart.distribution.title')}</h2>
        </div>
      </div>

      {total === 0 ? (
        <div className="relative flex min-h-[292px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[rgba(2,21,38,0.10)] bg-[linear-gradient(145deg,#F7F7F4,rgba(255,255,252,0.82))] py-16 text-center text-sm text-[#66717A] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
          <span className="text-4xl opacity-35">◌</span>
          <p className="mt-2 font-black text-[#071827]">{t('chart.distribution.emptyTitle')}</p>
          <p className="mt-1 max-w-[19rem] text-xs font-medium leading-relaxed text-[#66717A]">{t('chart.distribution.emptyBody')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.06fr)_minmax(220px,0.94fr)] md:items-center xl:gap-4">
          <PremiumDistributionDonut rows={rows} total={total} netWorth={netWorth} activeId={activeId} onActiveChange={setActiveId} locale={locale} title={t('chart.distribution.centerDefault')} />
          <div className="space-y-2.5 md:pl-1">
            {rows.map((row) => {
              const pct = total ? (row.value / total) * 100 : 0;
              const isActive = activeId === row.id;
              const isDimmed = activeId !== null && !isActive;
              return (
                <button
                  key={row.id}
                  type="button"
                  onMouseEnter={() => setActiveId(row.id)}
                  onFocus={() => setActiveId(row.id)}
                  onMouseLeave={() => setActiveId(null)}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border px-3.5 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] transition duration-300 ${isActive ? 'border-[rgba(37,82,155,0.20)] bg-white shadow-[0_18px_34px_rgba(2,21,38,0.10)]' : 'border-[rgba(2,21,38,0.06)] bg-[rgba(247,247,244,0.74)] hover:bg-white/88'} ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,252,0.92),0_8px_18px_rgba(2,21,38,0.12)]" style={{ background: row.color }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black tracking-[-0.02em] text-[#071827]">{row.name}</p>
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#79838B]">{pct.toFixed(1)}% • {money(row.value, locale)}</p>
                  </div>
                  <span className="text-right text-lg font-black leading-none text-[#A4ADB3] transition group-hover:text-[#071827]">›</span>
                </button>
              );
            })}
            <div className="min-h-[82px] rounded-[22px] border border-[rgba(2,21,38,0.06)] bg-[linear-gradient(145deg,rgba(255,255,252,0.86),rgba(247,247,244,0.72))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#79838B]">{activeRow ? activeRow.name : t('chart.distribution.insightTitle')}</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[#51606D]">
                {activeRow ? `${((activeRow.value / total) * 100).toFixed(0)}% • ${money(activeRow.value, locale)}. ${activeRow.description}` : t('chart.distribution.insightBody')}
              </p>
            </div>
          </div>
        </div>
      )}
    </AppCard>
  );
}
