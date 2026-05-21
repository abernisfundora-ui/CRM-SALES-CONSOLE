'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppCard } from '@/components/ui/AppCard';
import { Pill } from '@/components/ui/Pill';
import { CashFlowChartPanel } from '@/components/dashboard/CashFlowChartPanel';
import { FinancialDistributionPanel } from '@/components/dashboard/FinancialDistributionPanel';
import { FinancialFreedomBar } from '@/components/dashboard/FinancialFreedomBar';
import { useLanguage } from '@/providers/LanguageProvider';
import { getIncomeGrossMonthly, getIncomeNetMonthly, getWealthMetrics } from '@/lib/finance/metrics';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import type { CalendarItem } from '@/types/calendar';
import type { IncomeItem } from '@/types/incomes';

export function HomeDashboardScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const assets = useCapitalStore(capitalSelectors.assets);
  const liabilities = useCapitalStore(capitalSelectors.liabilities);
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const liquidAccounts = useCapitalStore(capitalSelectors.liquidAccounts);
  const manualEvents = useCapitalStore(capitalSelectors.manualEvents);
  const goals = useCapitalStore(capitalSelectors.goals);

  const dashboard = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();
    const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
    const previousMonth = previousMonthDate.getUTCMonth();
    const previousYear = previousMonthDate.getUTCFullYear();

    const sumByMonth = (items: Array<{ fecha: string; montoMensual: number }>, month: number, year: number) =>
      items.reduce((acc, item) => {
        const date = safeDate(item.fecha);
        if (!date) return acc;
        if (date.getUTCMonth() === month && date.getUTCFullYear() === year) return acc + item.montoMensual;
        return acc;
      }, 0);

    const grossIncome = incomes.reduce((acc, income) => acc + getIncomeGrossMonthly(income), 0);
    const netIncome = incomes.reduce((acc, income) => acc + getIncomeNetMonthly(income), 0);
    const totalIncome = grossIncome;
    const passiveIncome = incomes.filter((income) => income.sourceType === 'derived_asset' || income.incomeKind === 'ingreso_pasivo').reduce((acc, income) => acc + getIncomeNetMonthly(income), 0);
    const totalExpenses = expenses.reduce((acc, expense) => acc + (expense.montoMensual || 0), 0);
    const cashFlow = netIncome - totalExpenses;

    const incomeCurrent = incomes.reduce((acc, income) => {
      const incomeDate = safeDate(income.fecha);
      return incomeDate && incomeDate.getUTCMonth() === currentMonth && incomeDate.getUTCFullYear() === currentYear ? acc + getIncomeNetMonthly(income) : acc;
    }, 0);
    const incomePrevious = incomes.reduce((acc, income) => {
      const incomeDate = safeDate(income.fecha);
      return incomeDate && incomeDate.getUTCMonth() === previousMonth && incomeDate.getUTCFullYear() === previousYear ? acc + getIncomeNetMonthly(income) : acc;
    }, 0);
    const expenseCurrent = sumByMonth(expenses, currentMonth, currentYear);
    const expensePrevious = sumByMonth(expenses, previousMonth, previousYear);

    const deltaIncome = getDeltaPercent(incomeCurrent, incomePrevious);
    const deltaExpense = getDeltaPercent(expenseCurrent, expensePrevious);
    const deltaCashFlow = getDeltaPercent(cashFlow, incomePrevious - expensePrevious);

    const wealth = getWealthMetrics({ assets, liabilities });
    const totalAssets = wealth.totalAssets;
    const totalLiabilities = wealth.totalLiabilities;
    const activeLiquidAccounts = liquidAccounts.filter((account) => (account.estado ?? (account.incluirEnLiquidez ? 'active' : 'inactive')) === 'active' && account.incluirEnLiquidez !== false);
    const totalLiquidAccounts = activeLiquidAccounts.reduce((acc, account) => acc + (account.saldoActual || 0), 0);
    const netWorth = totalAssets + totalLiquidAccounts - totalLiabilities;

    const immediateCash = totalLiquidAccounts;

    const monthlyExpenses = totalExpenses;
    const lifeCoverageMonths = monthlyExpenses > 0 ? immediateCash / monthlyExpenses : null;
    const liquidityStatus = getLiquidityStatus(liquidAccounts.length, immediateCash);
    const liquidityProgress = getLiquidityProgress(liquidityStatus);

    const chartByMonth = buildMonthlyChartData(incomes, expenses, netWorth, language);

    const upcoming = buildUpcomingMovements(incomes, expenses, manualEvents);

    const hasRecords = assets.length + liabilities.length + incomes.length + expenses.length + liquidAccounts.length + manualEvents.length > 0;

    return {
      hasRecords,
      totalIncome,
      grossIncome,
      netIncome,
      passiveIncome,
      totalExpenses,
      cashFlow,
      deltaIncome,
      deltaExpense,
      deltaCashFlow,
      netWorth,
      totalAssets,
      totalLiabilities,
      immediateCash,
      lifeCoverageMonths,
      liquidityStatus,
      liquidityProgress,
      chartByMonth,
      upcoming
    };
  }, [assets, liabilities, incomes, expenses, liquidAccounts, manualEvents, language]);

  const goalsProgress = goals.slice(0, 4).map((goal) => {
    const current = goal.actual || 0;
    const target = goal.objetivo || 0;
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return { id: goal.id, nombre: goal.nombre, current, target, pct };
  });

  const metricCards: Array<{
    title: string;
    value: string;
    delta: string;
    type: 'cashFlow' | 'income' | 'expense' | 'netWorth' | 'cashAvailable' | 'lifeCoverage';
    actionLabel: string;
    href: string;
  }> = [
    { title: language === 'es' ? 'Flujo neto real' : 'Real net flow', value: formatCurrency(dashboard.cashFlow), delta: `${dashboard.deltaCashFlow >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaCashFlow))}`, type: 'cashFlow', actionLabel: language === 'es' ? 'Ver detalle de flujo neto' : 'View net flow details', href: '/' },
    { title: 'Ingreso bruto mensual', value: formatCurrency(dashboard.grossIncome), delta: `${dashboard.deltaIncome >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaIncome))}`, type: 'income', actionLabel: 'Ver historial de ingresos', href: '/income' },
    { title: 'Ingreso neto mensual', value: formatCurrency(dashboard.netIncome), delta: language === 'es' ? 'Base real de flujo neto' : 'Real net flow base', type: 'income', actionLabel: 'Ver ingresos netos', href: '/income' },
    { title: 'Gasto Total', value: formatCurrency(dashboard.totalExpenses), delta: `${dashboard.deltaExpense >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaExpense))}`, type: 'expense', actionLabel: 'Ver historial de gastos', href: '/expenses' },
    { title: 'Patrimonio Neto', value: formatCurrency(dashboard.netWorth), delta: `${dashboard.deltaCashFlow >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaCashFlow))}`, type: 'netWorth', actionLabel: 'Ver detalle patrimonial', href: '/assets' },
    { title: 'Efectivo Inmediato', value: formatCurrency(dashboard.immediateCash), delta: `${dashboard.liquidityStatus.label}`, type: 'cashAvailable', actionLabel: 'Ver liquidez', href: '/assets' },

  ];

  return (
    <div className="space-y-3.5 pb-0.5 lg:space-y-4">
      <section className="hidden xl:grid xl:grid-cols-12 xl:gap-3.5">
        <div className="col-span-12 grid min-w-0 grid-cols-6 gap-3">
          {metricCards.map((card) => (
            <MetricStatCard key={card.title} title={card.title} value={card.value} delta={card.delta} type={card.type} actionLabel={card.actionLabel} onAction={() => router.push(card.href)} />
          ))}
        </div>

        <div className="col-span-12">
          <FinancialFreedomBar passiveIncome={dashboard.passiveIncome} monthlyExpenses={dashboard.totalExpenses} />
        </div>
        <div className="col-span-7">
          <CashFlowChartPanel data={dashboard.chartByMonth.labels.map((month, index) => ({ month, income: dashboard.chartByMonth.income[index] ?? 0, expenses: dashboard.chartByMonth.expenses[index] ?? 0, cashFlow: dashboard.chartByMonth.cashFlow[index] ?? 0 }))} />
        </div>

        <div className="col-span-5">
          <FinancialDistributionPanel assets={dashboard.totalAssets} liabilities={dashboard.totalLiabilities} income={dashboard.netIncome} expenses={dashboard.totalExpenses} />
        </div>

        <div className="col-span-6">
          <section className="surface space-y-2 p-4">
            <div className="flex items-center justify-between border-b border-[rgba(47,61,31,0.12)] pb-2">
              <p className="subtle-label text-[#10170D]">Próximos Movimientos</p>
              <button type="button" onClick={() => router.push('/calendar')} className="text-xs font-semibold text-[#4A5D32]">Ver calendario</button>
            </div>
            {dashboard.upcoming.length === 0 ? <AppCard className="p-3 text-center text-xs text-ds-muted">No hay movimientos próximos.</AppCard> : dashboard.upcoming.map((item) => (
              <AppCard key={item.id} className="flex items-center justify-between p-2.5">
                <div><p className="text-sm font-semibold text-ds-text">{item.title}</p><p className="text-xs text-ds-muted">{item.due}</p></div><Pill module={item.type === 'in' ? 'income' : 'expenses'}>{item.amount}</Pill>
              </AppCard>
            ))}
          </section>
        </div>

        <div className="col-span-6">
          <section className="surface space-y-2 p-4">
            <div className="flex items-center justify-between border-b border-[rgba(47,61,31,0.12)] pb-2">
              <p className="subtle-label text-[#10170D]">Metas</p>
              <button type="button" onClick={() => router.push('/goals')} className="text-xs font-semibold text-[#4A5D32]">Ver todas</button>
            </div>
            {goalsProgress.length === 0 ? <AppCard className="p-3 text-center text-xs text-ds-muted">No tienes metas todavía. Crear primera meta.</AppCard> : goalsProgress.map((goal) => (
              <AppCard key={goal.id} className="p-3">
                <div className="flex items-center justify-between text-sm"><p className="font-semibold text-ds-text">{goal.nombre}</p><p className="text-ds-muted">{goal.pct.toFixed(0)}%</p></div>
                <div className="mt-2 h-2 rounded-full bg-[rgba(31,42,23,0.12)]"><div className="h-2 rounded-full bg-gradient-to-r from-[#8FA85A] via-[#5F7D32] to-[#2B3A1F]" style={{ width: `${goal.pct}%` }} /></div>
              </AppCard>
            ))}
          </section>
        </div>
      </section>

      <div className="space-y-3.5 xl:hidden">
        <FinancialFreedomBar passiveIncome={dashboard.passiveIncome} monthlyExpenses={dashboard.totalExpenses} />

        <section className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
          <MetricStatCard title={language === 'es' ? 'Flujo neto real' : 'Real net flow'} value={formatCurrency(dashboard.cashFlow)} delta={`${dashboard.deltaCashFlow >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaCashFlow))}`} type="cashFlow" actionLabel={language === 'es' ? 'Ver detalle de flujo neto' : 'View net flow details'} onAction={() => router.push('/')} />
          <MetricStatCard title="Ingreso bruto mensual" value={formatCurrency(dashboard.grossIncome)} delta={`${dashboard.deltaIncome >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaIncome))}`} type="income" actionLabel="Ver historial de ingresos" onAction={() => router.push('/income')} />
          <MetricStatCard title="Ingreso neto mensual" value={formatCurrency(dashboard.netIncome)} delta={language === 'es' ? 'Base real' : 'Real base'} type="income" actionLabel="Ver ingresos" onAction={() => router.push('/income')} />
          <MetricStatCard title="Gasto total" value={formatCurrency(dashboard.totalExpenses)} delta={`${dashboard.deltaExpense >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaExpense))}`} type="expense" actionLabel="Ver historial de gastos" onAction={() => router.push('/expenses')} />
          <MetricStatCard title="Patrimonio neto" value={formatCurrency(dashboard.netWorth)} delta={`${dashboard.deltaCashFlow >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(dashboard.deltaCashFlow))}`} type="netWorth" actionLabel="Ver detalle patrimonial" onAction={() => router.push('/assets')} />
          <MetricStatCard title="Efectivo inmediato" value={formatCurrency(dashboard.immediateCash)} delta={`${dashboard.liquidityStatus.label}`} type="cashAvailable" actionLabel="Ver liquidez" onAction={() => router.push('/assets')} />
        </section>

        <CashFlowChartPanel data={dashboard.chartByMonth.labels.map((month, index) => ({ month, income: dashboard.chartByMonth.income[index] ?? 0, expenses: dashboard.chartByMonth.expenses[index] ?? 0, cashFlow: dashboard.chartByMonth.cashFlow[index] ?? 0 }))} />

        <FinancialDistributionPanel assets={dashboard.totalAssets} liabilities={dashboard.totalLiabilities} income={dashboard.netIncome} expenses={dashboard.totalExpenses} />

      <section className="surface space-y-2 p-3 xl:col-span-6 lg:space-y-3 lg:p-4">
        <div className="flex items-center justify-between border-b border-[rgba(47,61,31,0.12)] pb-2">
          <p className="subtle-label text-[#10170D]">Próximos movimientos</p>
          <button type="button" onClick={() => router.push('/calendar')} className="text-xs font-semibold text-[#4A5D32]">
            Ver todos →
          </button>
        </div>

        {dashboard.upcoming.length === 0 ? (
          <AppCard className="p-3 text-center text-xs text-ds-muted lg:p-6 lg:text-sm">No hay movimientos próximos.</AppCard>
        ) : (
          <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">
              {dashboard.upcoming.map((item) => (
          <AppCard key={item.id} className="flex items-center justify-between gap-2 p-2.5 lg:p-3.5">
            <div className="flex min-w-0 items-start gap-2">
              <span className="mt-1 text-xs text-ds-text/80 lg:text-sm">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ds-text lg:text-[15px]">{item.title}</p>
                <p className="text-xs text-ds-muted lg:text-[13px]">{item.date}</p>
                <p className="text-[10px] font-medium text-[rgba(31,42,23,0.65)] lg:text-[11px]">{item.due}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Pill module={item.type === 'in' ? 'income' : 'expenses'}>{item.amount}</Pill>
              <span className="text-xs text-ds-inactive">→</span>
            </div>
          </AppCard>
        ))}
          </div>
        )}
      </section>

      <section className="surface space-y-2 p-3 xl:col-span-6 lg:space-y-3 lg:p-4">
        <div className="flex items-center justify-between border-b border-[rgba(47,61,31,0.12)] pb-2">
          <p className="subtle-label text-[#10170D]">Metas</p>
          <button type="button" onClick={() => router.push('/goals')} className="text-xs font-semibold text-[#4A5D32]">Ver todas</button>
        </div>
        {goalsProgress.length === 0 ? (
          <AppCard className="p-4 text-center text-xs text-ds-muted">No hay registros todavía. Crea tu primera meta.</AppCard>
        ) : (
          <div className="space-y-2">
            {goalsProgress.map((goal) => (
              <AppCard key={goal.id} className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-ds-text">{goal.nombre}</p>
                  <p className="text-ds-muted">{goal.pct.toFixed(0)}%</p>
                </div>
                <p className="mt-1 text-xs text-ds-muted">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
                <div className="mt-2 h-2 rounded-full bg-[rgba(31,42,23,0.12)]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#8FA85A] via-[#5F7D32] to-[#2B3A1F]" style={{ width: `${goal.pct}%` }} />
                </div>
              </AppCard>
            ))}
          </div>
        )}
      </section>
      </div>
      <footer className="mt-4 whitespace-nowrap border-t border-[rgba(47,61,31,0.08)] pt-4 text-center text-[clamp(8px,2.55vw,11px)] font-semibold tracking-[0.01em] text-[#66717A]/70 lg:mt-5">
        © 2026 Todos los derechos reservados · Desarrollado por Ruben D Hernandez
      </footer>
    </div>
  );
}


function safeDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDeltaPercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function formatCurrencyOrPlaceholder(value: number, hasData: boolean, placeholder: string) {
  if (!hasData) return `— ${placeholder}`;
  return formatCurrency(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatOneDecimal(value: number) {
  return value.toFixed(1);
}

function getLiquidityStatus(accountCount: number, immediateCash: number) {
  if (accountCount === 0) return { label: 'Sin referencia', level: 0 };
  if (immediateCash <= 0) return { label: 'Crítico', level: 0 };
  return { label: 'Disponible', level: 3 };
}

function getLiquidityProgress(status: { level: number }) {
  return status.level + 1;
}

function buildMonthlyChartData(
  incomes: IncomeItem[],
  expenses: Array<{ fecha: string; montoMensual: number }>,
  netWorth: number,
  language: 'es' | 'en'
) {
  const months = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() - (6 - idx));
    return { month: date.getUTCMonth(), year: date.getUTCFullYear() };
  });

  const income = months.map(({ month, year }) =>
    incomes.reduce((acc, item) => {
      const date = safeDate(item.fecha);
      return date && date.getUTCMonth() === month && date.getUTCFullYear() === year ? acc + getIncomeNetMonthly(item) : acc;
    }, 0)
  );
  const expense = months.map(({ month, year }) =>
    expenses.reduce((acc, item) => {
      const date = safeDate(item.fecha);
      return date && date.getUTCMonth() === month && date.getUTCFullYear() === year ? acc + item.montoMensual : acc;
    }, 0)
  );
  const cashFlow = income.map((value, idx) => value - expense[idx]);

  const netWorthTrend = cashFlow.reduce<number[]>((acc, value, idx) => {
    if (idx === 0) return [netWorth - cashFlow.slice(idx).reduce((sum, v) => sum + v, 0) + value];
    return [...acc, acc[idx - 1] + value];
  }, []);

  const labels = months.map(({ month, year }) => {
    const date = new Date(Date.UTC(year, month, 1));
    return new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', { month: 'short', timeZone: 'UTC' }).format(date).replace('.', '');
  });

  return { labels, income, expenses: expense, cashFlow, netWorth: netWorthTrend };
}

function buildUpcomingMovements(
  incomes: IncomeItem[],
  expenses: Array<{ id: string; nombre: string; fecha: string; montoMensual: number }>,
  events: CalendarItem[]
) {
  const today = new Date();
  const movementFromIncome = incomes.map((income) => ({
    id: `inc-${income.id}`,
    title: income.nombre,
    date: income.fecha,
    due: getDueLabel(income.fecha),
    amount: `+${formatCurrency(getIncomeNetMonthly(income))}`,
    type: 'in' as const,
    icon: '◎'
  }));
  const movementFromExpense = expenses.map((expense) => ({
    id: `exp-${expense.id}`,
    title: expense.nombre,
    date: expense.fecha,
    due: getDueLabel(expense.fecha),
    amount: `-${formatCurrency(expense.montoMensual)}`,
    type: 'out' as const,
    icon: '◌'
  }));
  const movementFromEvents = events
    .filter((event) => event.date)
    .map((event) => ({
      id: `evt-${event.id}`,
      title: event.title,
      date: event.date,
      due: getDueLabel(event.date),
      amount: event.amount ? `${event.type === 'ingreso' ? '+' : '-'}${formatCurrency(event.amount)}` : '—',
      type: event.type === 'ingreso' ? ('in' as const) : ('out' as const),
      icon: '⟡'
    }));

  return [...movementFromIncome, ...movementFromExpense, ...movementFromEvents]
    .filter((item) => {
      const date = safeDate(item.date);
      return date ? date >= today : false;
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 5);
}

function getDueLabel(date: string) {
  const target = safeDate(date);
  if (!target) return 'Sin fecha';
  const now = new Date();
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Vence en 1 día';
  return `Vence en ${diffDays} días`;
}


type MetricStatCardProps = {
  title: string;
  value: string;
  delta: string;
  type: 'cashFlow' | 'income' | 'expense' | 'netWorth' | 'cashAvailable' | 'lifeCoverage';
  actionLabel: string;
  onAction: () => void;
};

function MetricStatCard({ title, value, delta, type, actionLabel, onAction }: MetricStatCardProps) {
  const kpiVisualConfig = {
    cashFlow: { card: 'kpi-glass-card cash-flow', icon: 'border-teal-500/[0.32] bg-white/[0.68] text-teal-950', delta: 'text-emerald-700', value: 'text-teal-900' },
    income: { card: 'kpi-glass-card income', icon: 'border-emerald-500/[0.32] bg-white/[0.68] text-emerald-950', delta: 'text-emerald-700', value: 'text-emerald-900' },
    expense: { card: 'kpi-glass-card expense', icon: 'border-red-500/[0.30] bg-white/[0.68] text-red-950', delta: 'text-red-700', value: 'text-red-900' },
    netWorth: { card: 'kpi-glass-card net-worth', icon: 'border-violet-500/[0.32] bg-white/[0.68] text-violet-950', delta: 'text-violet-700', value: 'text-violet-900' },
    cashAvailable: { card: 'kpi-glass-card liquidity', icon: 'border-cyan-500/[0.32] bg-white/[0.68] text-cyan-950', delta: 'text-cyan-700', value: 'text-cyan-900' },
    lifeCoverage: { card: 'kpi-glass-card coverage', icon: 'border-purple-500/[0.32] bg-white/[0.68] text-purple-950', delta: 'text-purple-700', value: 'text-purple-900' }
  } as const;
  const visual = kpiVisualConfig[type];
  const visualGlow = {
    cashFlow: 'bg-teal-400/[0.18]',
    income: 'bg-green-400/[0.18]',
    expense: 'bg-rose-400/[0.16]',
    netWorth: 'bg-violet-400/[0.18]',
    cashAvailable: 'bg-sky-400/[0.18]',
    lifeCoverage: 'bg-indigo-500/[0.16]'
  } as const;
  const isTrendDelta = delta.startsWith('▲') || delta.startsWith('▼');
  const [deltaDirection, deltaValue] = delta.split(' ');
  const deltaAmount = Number.parseFloat(deltaValue ?? '0');
  const isNeutralDelta = isTrendDelta && Math.abs(deltaAmount) < 0.05;
  const isImprovement = isTrendDelta ? (type === 'expense' ? deltaDirection === '▼' : deltaDirection === '▲') : null;
  const trendTone = isNeutralDelta ? 'text-[#7A858C]' : isImprovement === true ? 'text-emerald-700' : isImprovement === false ? 'text-red-700' : visual.delta;
  const valueTone = type === 'cashFlow' && value.includes('-') ? 'text-red-800' : visual.value;

  return (
    <AppCard className={`kpi-card-hover flex h-[146px] min-w-0 flex-col justify-between overflow-hidden !px-4 !py-3.5 lg:h-[150px] xl:h-[152px] ${visual.card}`}>
      <div className={`pointer-events-none absolute -right-8 -top-8 z-0 h-28 w-28 rounded-full blur-2xl ${visualGlow[type]}`} />

      <div className="relative z-10 flex min-h-[48px] items-start gap-3 pr-8">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
            `${visual.icon} shadow-[0_12px_24px_rgba(47,61,31,0.12),inset_0_1px_0_rgba(255,255,255,0.70)]`
          }`}
        >
          {type === 'expense' ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden><rect x="3.5" y="6.5" width="17" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.8"/><circle cx="8" cy="14" r="1.1" fill="currentColor"/></svg>
          ) : type === 'netWorth' ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden><path d="M4 18h16M6 18V9l6-3 6 3v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : type === 'cashAvailable' ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden><rect x="3.5" y="7" width="17" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.55"/></svg>
          ) : type === 'lifeCoverage' ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden><path d="M12 4.2 18 6.8V12c0 3.2-2 5.8-6 7.8-4-2-6-4.6-6-7.8V6.8l6-2.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
              <path d="M4.5 14.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="m7 12 3.4-3.2 2.8 2.4 3.8-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 7.5h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <p className="kpi-title min-w-0 pt-1.5 text-[11.5px] font-semibold uppercase leading-[1.12] tracking-[0.14em] text-[#24311D]/82">{title}</p>

        <button type="button" aria-label={actionLabel} onClick={onAction} className="absolute right-0 top-0 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[rgba(2,21,38,0.06)] bg-white/44 text-[#66717A] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] transition hover:bg-white hover:text-[#071827]">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
            <circle cx="8" cy="4" r="1.15" fill="currentColor" />
            <circle cx="8" cy="8" r="1.15" fill="currentColor" />
            <circle cx="8" cy="12" r="1.15" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-1 items-center py-1">
        <p className={`kpi-value truncate text-[1.85rem] font-black leading-none tracking-[-0.06em] lg:text-[2rem] ${valueTone}`}>{value}</p>
      </div>

      <p className="relative z-10 min-h-[18px] text-[11.5px] font-extrabold leading-tight">
        {isTrendDelta ? (
          <>
            <span className={trendTone}>{deltaDirection} {deltaValue}</span>{' '}
            <span className="kpi-subtitle">vs mes anterior</span>
          </>
        ) : (
          <span className={visual.delta}>{delta}</span>
        )}
      </p>
    </AppCard>
  );
}
