'use client';

import { useMemo, useState } from 'react';
import { Area, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from 'recharts';
import { AppCard } from '@/components/ui/AppCard';
import { useLanguage } from '@/providers/LanguageProvider';

type CashFlowPoint = { month: string; income: number; expenses: number; cashFlow: number };
type Timeframe = 'day' | 'week' | 'month' | 'year';
type ChartPoint = CashFlowPoint & {
  label: string;
  displayCashFlow: number;
  isDeficit: boolean;
};

type ActiveDotProps = {
  cx?: number;
  cy?: number;
};

const timeframeKeys: Array<{ value: Timeframe; labelKey: 'chart.timeframe.day' | 'chart.timeframe.week' | 'chart.timeframe.month' | 'chart.timeframe.year' }> = [
  { value: 'day', labelKey: 'chart.timeframe.day' },
  { value: 'week', labelKey: 'chart.timeframe.week' },
  { value: 'month', labelKey: 'chart.timeframe.month' },
  { value: 'year', labelKey: 'chart.timeframe.year' }
];

const dailyFactors = [0.82, 0.94, 1.08, 0.9, 1.18, 1.04, 1.02];
const weeklyFactors = [0.92, 1.05, 0.96, 1.07];

function compactMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { notation: 'compact', style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(Math.max(0, value || 0));
}

function money(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function renderPremiumActiveDot(color: string, radius: number) {
  return function PremiumActiveDot({ cx, cy }: ActiveDotProps) {
    if (typeof cx !== 'number' || typeof cy !== 'number') return <g />;

    return (
      <g pointerEvents="none">
        <line x1={-1000} x2={2000} y1={cy} y2={cy} stroke="rgba(7,24,39,0.16)" strokeWidth={1.2} strokeDasharray="3 9" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={radius + 8} fill={color} opacity={0.10}>
          <animate attributeName="r" from={radius + 3} to={radius + 8} dur="260ms" fill="freeze" />
          <animate attributeName="opacity" from="0.18" to="0.10" dur="260ms" fill="freeze" />
        </circle>
        <circle cx={cx} cy={cy} r={radius} fill={color} stroke="#FFFFFC" strokeWidth={3} filter="url(#cashFlowPointGlow)" />
      </g>
    );
  };
}

function buildDerivedData(data: CashFlowPoint[], timeframe: Timeframe, language: 'es' | 'en'): ChartPoint[] {
  const last = data.at(-1) ?? { month: '', income: 0, expenses: 0, cashFlow: 0 };

  if (timeframe === 'day') {
    const labels = language === 'es' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, index) => {
      const factor = dailyFactors[index] ?? 1;
      const income = (last.income / 30) * factor;
      const expenses = (last.expenses / 30) * (1.04 - (factor - 1) * 0.34);
      const cashFlow = income - expenses;
      return { month: label, label, income, expenses, cashFlow, displayCashFlow: Math.max(0, cashFlow), isDeficit: cashFlow < 0 };
    });
  }

  if (timeframe === 'week') {
    const recent = data.slice(-2).length ? data.slice(-2) : [last];
    return Array.from({ length: 8 }, (_, index) => {
      const source = recent[Math.floor(index / 4)] ?? last;
      const factor = weeklyFactors[index % weeklyFactors.length] ?? 1;
      const income = (source.income / 4.345) * factor;
      const expenses = (source.expenses / 4.345) * (1.03 - (factor - 1) * 0.25);
      const cashFlow = income - expenses;
      const label = language === 'es' ? `Sem ${index + 1}` : `W${index + 1}`;
      return { month: label, label, income, expenses, cashFlow, displayCashFlow: Math.max(0, cashFlow), isDeficit: cashFlow < 0 };
    });
  }

  if (timeframe === 'year') {
    const quarters = language === 'es' ? ['T1', 'T2', 'T3', 'T4'] : ['Q1', 'Q2', 'Q3', 'Q4'];
    const chunkSize = Math.max(1, Math.ceil(data.length / 4));
    return quarters.map((label, index) => {
      const chunk = data.slice(index * chunkSize, (index + 1) * chunkSize);
      const source = chunk.length ? chunk : [last];
      const income = source.reduce((sum, point) => sum + point.income, 0);
      const expenses = source.reduce((sum, point) => sum + point.expenses, 0);
      const cashFlow = income - expenses;
      return { month: label, label, income, expenses, cashFlow, displayCashFlow: Math.max(0, cashFlow), isDeficit: cashFlow < 0 };
    });
  }

  return data.map((point) => ({ ...point, label: point.month, displayCashFlow: Math.max(0, point.cashFlow), isDeficit: point.cashFlow < 0 }));
}

function CustomTooltip({ active, payload, label, locale, t }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string; payload: ChartPoint }>; label?: string; locale: string; t: ReturnType<typeof useLanguage>['t'] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  return (
    <div className="min-w-[218px] rounded-[20px] border border-[rgba(2,21,38,0.08)] bg-[rgba(255,255,252,0.98)] p-3 shadow-[0_20px_52px_rgba(2,21,38,0.14)] backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#66717A]">{label}</p>
        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${point?.isDeficit ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {point?.isDeficit ? t('chart.cashFlow.deficit') : t('chart.cashFlow.surplus')}
        </span>
      </div>
      <div className="space-y-2">
        {payload
          .filter((item) => ['income', 'expenses', 'displayCashFlow'].includes(item.dataKey))
          .map((item) => {
            const isNet = item.dataKey === 'displayCashFlow';
            const rawValue = isNet ? point?.cashFlow ?? item.value : item.value;
            const labelText = item.dataKey === 'income' ? t('chart.cashFlow.income') : item.dataKey === 'expenses' ? t('chart.cashFlow.expenses') : t('chart.cashFlow.netFlow');
            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 font-bold text-[#51606D]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{labelText}</span>
                <span className="font-black tabular-nums text-[#071827]">{money(rawValue, locale)}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function CashFlowChartPanel({ data }: { data: CashFlowPoint[] }) {
  const { language, t } = useLanguage();
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const hasData = data.some((d) => d.income !== 0 || d.expenses !== 0 || d.cashFlow !== 0);
  const chartData = useMemo(() => buildDerivedData(data, timeframe, language), [data, timeframe, language]);
  const maxValue = Math.max(...chartData.flatMap((point) => [point.income, point.expenses, point.displayCashFlow]), 1000);

  return (
    <AppCard className="h-full overflow-hidden p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-black normal-case tracking-[-0.04em] text-[#071827] md:text-xl">{language === 'es' ? 'Inteligencia de Flujo' : 'Flow Intelligence'}</h2>
        <div className="flex shrink-0 rounded-full border border-[rgba(2,21,38,0.07)] bg-[#F7F7F4]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
          {timeframeKeys.map((item) => {
            const active = timeframe === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTimeframe(item.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black transition duration-300 ${active ? 'bg-[#071827] text-white shadow-[0_10px_24px_rgba(2,21,38,0.18)]' : 'text-[#66717A] hover:bg-white/80 hover:text-[#071827]'}`}
              >
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {!hasData ? (
        <div className="relative flex h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[rgba(2,21,38,0.10)] bg-[linear-gradient(145deg,#F7F7F4,rgba(255,255,252,0.82))] text-center text-sm text-[#66717A] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
          <span className="text-4xl opacity-35">⌁</span>
          <p className="mt-2 font-black text-[#071827]">{t('chart.cashFlow.emptyTitle')}</p>
          <p className="mt-1 max-w-[18rem] text-xs font-medium leading-relaxed text-[#66717A]">{t('chart.cashFlow.emptyBody')}</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#66717A]">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{t('chart.cashFlow.income')}</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">{t('chart.cashFlow.expenses')}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{t('chart.cashFlow.netFlow')}</span>
          </div>
          <div className="h-[285px] md:h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: 0, right: 10, top: 14, bottom: 6 }}>
                <defs>
                  <linearGradient id="cashFlowPremiumFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                    <stop offset="56%" stopColor="#3B82F6" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                  <filter id="cashFlowSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="cashFlowPointGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="3" result="pointBlur" />
                    <feMerge><feMergeNode in="pointBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(2,21,38,0.075)" vertical={false} strokeDasharray="2 10" />
                <XAxis dataKey="label" stroke="#7A858C" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#66717A' }} dy={10} interval="preserveStartEnd" />
                <YAxis domain={[0, Math.ceil(maxValue * 1.16)]} tickFormatter={(value) => compactMoney(Number(value), locale)} stroke="#7A858C" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#66717A' }} width={64} />
                <Tooltip content={<CustomTooltip locale={locale} t={t} />} cursor={{ stroke: 'rgba(7,24,39,0.18)', strokeWidth: 1.2, strokeDasharray: '3 9' }} />
                <Area isAnimationActive animationDuration={850} animationEasing="ease-out" type="monotone" dataKey="displayCashFlow" name={t('chart.cashFlow.netFlow')} stroke="#2563EB" strokeWidth={4.2} fill="url(#cashFlowPremiumFill)" dot={false} activeDot={renderPremiumActiveDot('#2563EB', 6)} filter="url(#cashFlowSoftGlow)" />
                <Line isAnimationActive animationDuration={780} animationEasing="ease-out" type="monotone" dataKey="income" name={t('chart.cashFlow.income')} stroke="#128447" strokeWidth={3.4} dot={false} activeDot={renderPremiumActiveDot('#128447', 5)} />
                <Line isAnimationActive animationDuration={780} animationEasing="ease-out" type="monotone" dataKey="expenses" name={t('chart.cashFlow.expenses')} stroke="#C2413D" strokeWidth={3.4} dot={false} activeDot={renderPremiumActiveDot('#C2413D', 5)} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </AppCard>
  );
}
