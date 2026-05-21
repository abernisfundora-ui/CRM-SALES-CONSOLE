'use client';

import { useMemo, useState } from 'react';
import { Area, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from 'recharts';
import { getIncomeNetMonthly, getWealthMetrics } from '@/lib/finance/metrics';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import type { GoalItem } from '@/types/goals';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD', maximumFractionDigits: 1 });
const horizons = [6, 12, 24] as const;
const chartViews = ['patrimonio', 'cashFlow', 'deuda', 'libertad'] as const;

type Horizon = (typeof horizons)[number];
type ChartView = (typeof chartViews)[number];
type ScenarioId = 'actual' | 'optimista' | 'conservador';
type Tone = 'good' | 'watch' | 'risk' | 'neutral';

type Scenario = {
  id: ScenarioId;
  label: string;
  description: string;
  incomeFactor: number;
  expenseFactor: number;
  debtFactor: number;
  growthBonus: number;
  passiveBonus: number;
};

type ProjectionBase = {
  netIncome: number;
  passiveIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  totalDebt: number;
  monthlyDebtPayment: number;
  liquid: number;
  cashFlow: number;
  wealth: ReturnType<typeof getWealthMetrics>;
};

type ScenarioControls = {
  incomeIncrease: number;
  expenseReduction: number;
  extraDebtPayment: number;
  reinvestRate: number;
  assetGrowthAnnual: number;
  passiveGrowthAnnual: number;
};

type ProjectionMonth = {
  month: number;
  label: string;
  patrimonio: number;
  cashFlow: number;
  deuda: number;
  libertad: number;
  ingreso: number;
  gasto: number;
  pasivo: number;
};

type ProjectionResult = {
  scenario: Scenario;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  passiveIncome: number;
  projectedDebt: number;
  projectedAssets: number;
  projectedNetWorth: number;
  freedom: number;
  goalCoverage: Array<{ name: string; months: number | null; target: number; current: number }>;
  points: ProjectionMonth[];
};

const scenarios: Scenario[] = [
  { id: 'actual', label: 'Escenario actual', incomeFactor: 1, expenseFactor: 1, debtFactor: 1, growthBonus: 0, passiveBonus: 0, description: 'Mantiene ingresos, gastos, pagos y apreciación estimada base.' },
  { id: 'optimista', label: 'Escenario optimista', incomeFactor: 1.08, expenseFactor: 0.92, debtFactor: 1.18, growthBonus: 2, passiveBonus: 2, description: 'Más ingresos, menos gasto, mayor pago a deuda y mejor crecimiento patrimonial.' },
  { id: 'conservador', label: 'Escenario conservador', incomeFactor: 0.96, expenseFactor: 1.06, debtFactor: 0.88, growthBonus: -1, passiveBonus: -1, description: 'Menor ingreso, más gasto y crecimiento patrimonial limitado.' }
];

const viewLabels: Record<ChartView, string> = {
  patrimonio: 'Patrimonio',
  cashFlow: 'Cash Flow',
  deuda: 'Deuda',
  libertad: 'Libertad financiera'
};

export function ProjectionScreen() {
  const assets = useCapitalStore(capitalSelectors.assets);
  const liabilities = useCapitalStore(capitalSelectors.liabilities);
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const goals = useCapitalStore(capitalSelectors.goals);
  const liquidAccounts = useCapitalStore(capitalSelectors.liquidAccounts);
  const [horizon, setHorizon] = useState<Horizon>(12);
  const [chartView, setChartView] = useState<ChartView>('patrimonio');
  const [controls, setControls] = useState<ScenarioControls>(defaultControls);

  const base = useMemo<ProjectionBase>(() => {
    const netIncome = incomes.reduce((total, income) => total + getIncomeNetMonthly(income), 0);
    const passiveIncome = incomes.filter((income) => income.sourceType === 'derived_asset' || income.incomeKind === 'ingreso_pasivo').reduce((total, income) => total + getIncomeNetMonthly(income), 0);
    const monthlyDebtPayment = liabilities.reduce((total, liability) => total + (liability.pagoMensual || 0), 0);
    const nonDebtExpenses = expenses.filter((expense) => expense.originType !== 'liability-derived').reduce((total, expense) => total + (expense.montoMensual || 0), 0);
    const totalExpenses = nonDebtExpenses + monthlyDebtPayment;
    const fixedExpenses = expenses.filter((expense) => expense.tipo === 'fijo' && expense.originType !== 'liability-derived').reduce((total, expense) => total + (expense.montoMensual || 0), 0) + monthlyDebtPayment;
    const totalDebt = liabilities.reduce((total, liability) => total + (liability.saldoActual || 0), 0);
    const liquid = liquidAccounts.filter((account) => (account.estado ?? (account.incluirEnLiquidez ? 'active' : 'inactive')) === 'active' && account.incluirEnLiquidez !== false).reduce((total, account) => total + (account.saldoActual || 0), 0);
    const wealth = getWealthMetrics({ assets, liabilities });
    return { netIncome, passiveIncome, totalExpenses, fixedExpenses, totalDebt, monthlyDebtPayment, liquid, wealth, cashFlow: netIncome - totalExpenses };
  }, [assets, expenses, incomes, liabilities, liquidAccounts]);

  const hasProjectionInputs = incomes.length > 0 && expenses.length > 0;
  const projections = useMemo(() => scenarios.map((scenario) => simulateScenario({ scenario, horizon, base, controls, goals })), [base, controls, goals, horizon]);
  const actualProjection = projections.find((item) => item.scenario.id === 'actual') ?? projections[0];
  const optimisticProjection = projections.find((item) => item.scenario.id === 'optimista') ?? projections[0];
  const bestGoalProjection = findBestGoalProjection(projections);
  const primaryGoal = goals.find((goal) => Math.max(0, (goal.objetivo || 0) - (goal.actual || 0)) > 0) ?? goals[0];
  const chartData = useMemo(() => buildChartData(projections, chartView), [chartView, projections]);
  const timeline = useMemo(() => buildFreedomTimeline(actualProjection, horizon), [actualProjection, horizon]);
  const insights = useMemo(() => buildInsights({ base, controls, actualProjection, optimisticProjection, goals }), [actualProjection, base, controls, goals, optimisticProjection]);
  const currentNetWorth = base.wealth.netWorth + base.liquid;
  const projectedDelta = currentNetWorth !== 0 ? ((actualProjection.projectedNetWorth - currentNetWorth) / Math.abs(currentNetWorth)) * 100 : actualProjection.projectedNetWorth > 0 ? 100 : 0;
  const goalMonths = primaryGoal ? monthsToGoal(primaryGoal, actualProjection.monthlyCashFlow) : null;

  return (
    <div className="cc-integrated space-y-4 pb-4 text-[#071827] lg:space-y-5">
      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.94),rgba(9,15,22,0.88))] p-4 shadow-[0_24px_70px_rgba(2,8,15,0.20),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D6B25E]/72">Centro de simulación</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.065em] text-white md:text-4xl">Proyección Financiera</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/58">Simula escenarios futuros usando tus datos reales de ingresos, gastos, activos, pasivos y metas.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.055] p-1">
              {horizons.map((value) => <button key={value} type="button" onClick={() => setHorizon(value)} className={`rounded-full px-4 py-2 text-xs font-black transition ${horizon === value ? 'bg-[#DDE9C7] text-[#10170D] shadow-[0_12px_28px_rgba(221,233,199,0.14)]' : 'text-white/54 hover:bg-white/8 hover:text-white'}`}>{value}m</button>)}
            </div>
            <button type="button" onClick={() => setControls(defaultControls())} className="rounded-full border border-[#D6B25E]/18 bg-[linear-gradient(180deg,#168E4F_0%,#0B7438_100%)] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(11,116,56,0.22)] transition hover:-translate-y-px">Nuevo escenario</button>
            <button type="button" disabled={!hasProjectionInputs} className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-2.5 text-sm font-black text-white/66 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45">Guardar simulación</button>
          </div>
        </div>
      </section>

      {!hasProjectionInputs ? (
        <ProjectionEmptyState />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeroMetric title="Patrimonio proyectado" value={currency.format(actualProjection.projectedNetWorth)} detail={`${projectedDelta >= 0 ? '+' : ''}${projectedDelta.toFixed(1)}% vs patrimonio actual`} tone={projectedDelta >= 0 ? 'good' : 'risk'} icon="◈" />
            <HeroMetric title="Libertad financiera" value={`${actualProjection.freedom.toFixed(1)}%`} detail={`Ingresos pasivos cubren ${actualProjection.freedom.toFixed(1)}% de tus gastos`} tone={actualProjection.freedom >= 50 ? 'good' : actualProjection.freedom >= 20 ? 'watch' : 'risk'} icon="◎" />
            <HeroMetric title="Cash Flow proyectado" value={currency.format(actualProjection.monthlyCashFlow)} detail="Después de gastos y pagos de deuda" tone={actualProjection.monthlyCashFlow >= 0 ? 'good' : 'risk'} icon="↗" />
            <HeroMetric title="Tiempo estimado a la meta" value={goalMonths === null ? 'Sin fecha' : `${goalMonths} meses`} detail="Basado en tu ritmo actual" tone={goalMonths === null ? 'risk' : goalMonths <= horizon ? 'good' : 'watch'} icon="⌁" />
          </section>

          <section className="grid gap-4 xl:grid-cols-12">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.92),rgba(12,20,30,0.84))] p-4 shadow-[0_22px_60px_rgba(2,8,15,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] xl:col-span-8 md:p-5">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Gráfica central</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Evolución proyectada</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chartViews.map((view) => <button key={view} type="button" onClick={() => setChartView(view)} className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${chartView === view ? 'border-[#DDE9C7]/30 bg-[#DDE9C7] text-[#10170D]' : 'border-white/10 bg-white/[0.045] text-white/56 hover:bg-white/10 hover:text-white'}`}>{viewLabels[view]}</button>)}
                </div>
              </div>
              <div className="mt-4 h-[340px] md:h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 16, right: 14, left: 4, bottom: 6 }}>
                    <defs>
                      <linearGradient id="projectionActual" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.24} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" strokeDasharray="2 10" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 11, fontWeight: 800 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 11, fontWeight: 800 }} width={68} tickFormatter={(value) => formatChartValue(Number(value), chartView, true)} />
                    <Tooltip content={<ProjectionTooltip chartView={chartView} />} cursor={{ stroke: 'rgba(255,255,255,0.16)', strokeDasharray: '4 6' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 14, color: 'rgba(255,255,255,0.62)', fontSize: 12, fontWeight: 800 }} />
                    <Area type="monotone" dataKey="actual" name="Actual" stroke="#14B8A6" strokeWidth={3.4} fill="url(#projectionActual)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#0A121C' }} animationDuration={850} />
                    <Line type="monotone" dataKey="optimista" name="Optimista" stroke="#22C55E" strokeWidth={3.2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#0A121C' }} animationDuration={850} />
                    <Line type="monotone" dataKey="conservador" name="Conservador" stroke={chartView === 'deuda' ? '#F87171' : '#F59E0B'} strokeWidth={3.2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#0A121C' }} animationDuration={850} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ScenarioEngine controls={controls} onChange={setControls} />
          </section>

          <FreedomTimeline points={timeline} />

          <section className="grid gap-3 xl:grid-cols-3">
            {projections.map((projection) => <ScenarioCard key={projection.scenario.id} projection={projection} />)}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <InsightsPanel insights={insights} />
            <ConnectedGoal goal={primaryGoal} projection={actualProjection} bestProjection={bestGoalProjection} />
          </section>
        </>
      )}
    </div>
  );
}

function defaultControls(): ScenarioControls {
  return { incomeIncrease: 0, expenseReduction: 0, extraDebtPayment: 0, reinvestRate: 0, assetGrowthAnnual: 0, passiveGrowthAnnual: 0 };
}

function simulateScenario({ scenario, horizon, base, controls, goals }: { scenario: Scenario; horizon: Horizon; base: ProjectionBase; controls: ScenarioControls; goals: GoalItem[] }): ProjectionResult {
  const points: ProjectionMonth[] = [];
  let debt = base.totalDebt;
  let assets = base.wealth.totalAssets;
  let passiveIncome = base.passiveIncome;
  const monthlyIncome = Math.max(0, (base.netIncome + controls.incomeIncrease) * scenario.incomeFactor);
  const monthlyExpenses = Math.max(0, (base.totalExpenses - controls.expenseReduction) * scenario.expenseFactor);
  const monthlyDebtPaydown = Math.max(0, (base.monthlyDebtPayment + controls.extraDebtPayment) * scenario.debtFactor);
  const monthlyAssetGrowth = Math.max(-0.95, (controls.assetGrowthAnnual + scenario.growthBonus) / 100) / 12;
  const monthlyPassiveGrowth = Math.max(-0.95, (controls.passiveGrowthAnnual + scenario.passiveBonus) / 100) / 12;

  for (let month = 1; month <= horizon; month += 1) {
    passiveIncome = Math.max(0, passiveIncome * (1 + monthlyPassiveGrowth));
    const incomeWithPassiveGrowth = Math.max(0, monthlyIncome - base.passiveIncome + passiveIncome);
    const monthlyCashFlow = incomeWithPassiveGrowth - monthlyExpenses;
    const reinvested = Math.max(0, monthlyCashFlow) * (controls.reinvestRate / 100);
    debt = Math.max(0, debt - monthlyDebtPaydown);
    assets = Math.max(0, assets * (1 + monthlyAssetGrowth) + reinvested);
    const freedom = monthlyExpenses > 0 ? (passiveIncome / monthlyExpenses) * 100 : 100;
    points.push({ month, label: `Mes ${month}`, patrimonio: assets + base.liquid - debt, cashFlow: monthlyCashFlow, deuda: debt, libertad: freedom, ingreso: incomeWithPassiveGrowth, gasto: monthlyExpenses, pasivo: passiveIncome });
  }

  const last = points.at(-1) ?? { patrimonio: base.wealth.netWorth + base.liquid, cashFlow: base.cashFlow, deuda: base.totalDebt, libertad: base.totalExpenses > 0 ? base.passiveIncome / base.totalExpenses * 100 : 100, ingreso: base.netIncome, gasto: base.totalExpenses, pasivo: base.passiveIncome };
  const goalCoverage = goals.map((goal) => ({ name: goal.nombre, months: monthsToGoal(goal, last.cashFlow), target: goal.objetivo, current: goal.actual || 0 }));
  return { scenario, monthlyIncome: last.ingreso, monthlyExpenses: last.gasto, monthlyCashFlow: last.cashFlow, passiveIncome: last.pasivo, projectedDebt: last.deuda, projectedAssets: Math.max(0, last.patrimonio - base.liquid + last.deuda), projectedNetWorth: last.patrimonio, freedom: last.libertad, goalCoverage, points };
}

function monthsToGoal(goal: GoalItem, monthlyCashFlow: number) {
  const remaining = Math.max(0, (goal.objetivo || 0) - (goal.actual || 0));
  if (remaining === 0) return 0;
  if (monthlyCashFlow <= 0) return null;
  return Math.ceil(remaining / monthlyCashFlow);
}

function buildChartData(projections: ProjectionResult[], chartView: ChartView) {
  const actual = projections.find((item) => item.scenario.id === 'actual');
  return actual?.points.map((point, index) => ({ label: point.label, actual: actual.points[index]?.[chartView] ?? 0, optimista: projections.find((item) => item.scenario.id === 'optimista')?.points[index]?.[chartView] ?? 0, conservador: projections.find((item) => item.scenario.id === 'conservador')?.points[index]?.[chartView] ?? 0 })) ?? [];
}

function buildFreedomTimeline(projection: ProjectionResult, horizon: Horizon) {
  const checkpoints = [0, 3, 6, 12, horizon].filter((value, index, array) => value <= horizon && array.indexOf(value) === index);
  return checkpoints.map((month) => {
    const point = month === 0 ? null : projection.points[Math.max(0, month - 1)];
    const freedom = point?.libertad ?? (projection.points[0]?.libertad ?? 0);
    return { label: month === 0 ? 'Hoy' : month === horizon ? 'Meta' : `${month} meses`, freedom, state: freedom >= 100 ? 'Independencia' : freedom >= 50 ? 'Tracción fuerte' : freedom >= 25 ? 'En progreso' : 'Construcción inicial' };
  });
}

function buildInsights({ base, controls, actualProjection, optimisticProjection, goals }: { base: ProjectionBase; controls: ScenarioControls; actualProjection: ProjectionResult; optimisticProjection: ProjectionResult; goals: GoalItem[] }) {
  const expenseImpact = controls.expenseReduction * 12;
  const incomeImpact = (actualProjection.projectedNetWorth - (base.wealth.netWorth + base.liquid));
  const firstGoal = goals[0];
  const currentGoalMonths = firstGoal ? monthsToGoal(firstGoal, base.cashFlow) : null;
  const projectedGoalMonths = firstGoal ? monthsToGoal(firstGoal, actualProjection.monthlyCashFlow) : null;
  const debtRatio = base.netIncome > 0 ? (base.monthlyDebtPayment / base.netIncome) * 100 : 0;
  const freedom = base.totalExpenses > 0 ? (base.passiveIncome / base.totalExpenses) * 100 : 0;
  return [
    { title: 'Control de gasto', icon: '↓', value: currency.format(expenseImpact), detail: controls.expenseReduction > 0 ? `Reducir gastos mejora tu Cash Flow anual en ${currency.format(expenseImpact)}.` : 'Aún no has simulado reducción de gastos; puede liberar Cash Flow sin aumentar riesgo.', tone: controls.expenseReduction > 0 ? 'good' : 'watch' },
    { title: 'Crecimiento patrimonial', icon: '↗', value: currency.format(incomeImpact), detail: `Con los controles actuales, el patrimonio cambia contra la base real al cierre del período.`, tone: incomeImpact >= 0 ? 'good' : 'risk' },
    { title: 'Meta acelerada', icon: '⌁', value: projectedGoalMonths === null ? 'Sin fecha' : `${projectedGoalMonths} meses`, detail: currentGoalMonths && projectedGoalMonths ? `La simulación puede adelantar ${Math.max(0, currentGoalMonths - projectedGoalMonths)} meses frente al ritmo actual.` : 'Necesitas Cash Flow positivo y una meta activa para estimar aceleración.', tone: projectedGoalMonths === null ? 'risk' : 'good' },
    { title: 'Margen de deuda', icon: '◆', value: `${debtRatio.toFixed(1)}%`, detail: debtRatio < 20 ? 'La carga de deuda deja margen potencial para reinversión o prepago.' : 'La deuda consume una parte relevante del ingreso neto mensual.', tone: debtRatio < 20 ? 'good' : debtRatio < 35 ? 'watch' : 'risk' },
    { title: 'Libertad financiera', icon: '◎', value: `${freedom.toFixed(1)}%`, detail: freedom >= 25 ? 'Tu ingreso pasivo ya cubre una parte relevante de tus gastos.' : 'Objetivo inicial: llevar ingreso pasivo al 25% de tus gastos mensuales.', tone: freedom >= 25 ? 'good' : 'watch' },
    { title: 'Mejor escenario', icon: '◈', value: currency.format(optimisticProjection.projectedNetWorth), detail: 'El escenario optimista muestra el techo de la simulación con tus datos y controles actuales.', tone: 'good' }
  ] as Array<{ title: string; icon: string; value: string; detail: string; tone: Tone }>;
}

function findBestGoalProjection(projections: ProjectionResult[]) {
  return [...projections].sort((a, b) => {
    const am = a.goalCoverage[0]?.months ?? Number.POSITIVE_INFINITY;
    const bm = b.goalCoverage[0]?.months ?? Number.POSITIVE_INFINITY;
    return am - bm;
  })[0];
}

function formatChartValue(value: number, chartView: ChartView, compact = false) {
  if (chartView === 'libertad') return `${value.toFixed(0)}%`;
  return compact ? compactCurrency.format(value) : currency.format(value);
}

function ProjectionTooltip({ active, payload, label, chartView }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; chartView: ChartView }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-[22px] border border-white/10 bg-[#08111B]/95 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.30)] backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">{label}</p><div className="mt-2 space-y-2">{payload.map((item) => <div key={item.name} className="flex min-w-[210px] items-center justify-between gap-5 text-sm"><span className="flex items-center gap-2 font-bold text-white/64"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><span className="font-black text-white">{formatChartValue(Number(item.value), chartView)}</span></div>)}</div></div>;
}

function HeroMetric({ title, value, detail, tone, icon }: { title: string; value: string; detail: string; tone: Tone; icon: string }) {
  const toneClass = tone === 'good' ? 'text-emerald-300' : tone === 'risk' ? 'text-rose-300' : 'text-amber-300';
  return <article className="rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.88),rgba(16,26,38,0.72))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.16),inset_0_1px_0_rgba(255,255,255,0.06)]"><div className="flex items-start justify-between gap-3"><p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/44">{title}</p><span className="text-lg text-white/34">{icon}</span></div><p className={`mt-3 truncate text-[1.65rem] font-black tracking-[-0.06em] ${toneClass}`}>{value}</p><p className="mt-2 text-xs font-semibold leading-5 text-white/52">{detail}</p></article>;
}

function ScenarioEngine({ controls, onChange }: { controls: ScenarioControls; onChange: (controls: ScenarioControls) => void }) {
  const update = (key: keyof ScenarioControls, value: number) => onChange({ ...controls, [key]: Math.max(0, value) });
  return <aside className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.92),rgba(12,20,30,0.82))] p-4 shadow-[0_22px_60px_rgba(2,8,15,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] xl:col-span-4 md:p-5"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#D6B25E]/70">Motor de escenarios</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Ajustes vivos</h2><div className="mt-4 space-y-3"><Control label="Aumentar ingresos mensuales" value={controls.incomeIncrease} min={0} max={20000} step={100} prefix="$" onChange={(value) => update('incomeIncrease', value)} /><Control label="Reducir gastos mensuales" value={controls.expenseReduction} min={0} max={20000} step={100} prefix="$" onChange={(value) => update('expenseReduction', value)} /><Control label="Aporte extra a deuda" value={controls.extraDebtPayment} min={0} max={20000} step={100} prefix="$" onChange={(value) => update('extraDebtPayment', value)} /><Control label="Reinvertir Cash Flow" value={controls.reinvestRate} min={0} max={100} step={5} suffix="%" onChange={(value) => update('reinvestRate', value)} /><Control label="Crecimiento anual de activos" value={controls.assetGrowthAnnual} min={0} max={30} step={0.5} suffix="%" onChange={(value) => update('assetGrowthAnnual', value)} /><Control label="Crecimiento anual de ingresos pasivos" value={controls.passiveGrowthAnnual} min={0} max={30} step={0.5} suffix="%" onChange={(value) => update('passiveGrowthAnnual', value)} /></div></aside>;
}

function Control({ label, value, min, max, step, prefix = '', suffix = '', onChange }: { label: string; value: number; min: number; max: number; step: number; prefix?: string; suffix?: string; onChange: (value: number) => void }) {
  return <label className="block rounded-[20px] border border-white/10 bg-white/[0.045] p-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-black text-white/62">{label}</span><span className="text-xs font-black text-white">{prefix}{value.toLocaleString('en-US')}{suffix}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#8FA85A]" /><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 h-9 w-full rounded-full border border-white/10 bg-[#07111B] px-3 text-sm font-black text-white outline-none focus:border-[#8FA85A]/50" /></label>;
}

function FreedomTimeline({ points }: { points: ReturnType<typeof buildFreedomTimeline> }) {
  const final = points.at(-1)?.freedom ?? 0;
  return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.78))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Timeline</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Camino a la libertad financiera</h2></div><span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-black text-white/62">{final.toFixed(1)}% meta</span></div><div className="relative mt-6"><div className="absolute left-0 right-0 top-5 h-2 rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-[#DDE9C7]" style={{ width: `${Math.min(100, final)}%` }} /></div><div className="relative grid grid-cols-2 gap-3 md:grid-cols-5">{points.map((point) => <div key={point.label} className="rounded-[20px] border border-white/10 bg-[#07111B]/82 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"><span className={`block h-4 w-4 rounded-full ${point.freedom >= 50 ? 'bg-emerald-400' : point.freedom >= 25 ? 'bg-amber-400' : 'bg-white/28'}`} /><p className="mt-4 text-xs font-black text-white">{point.label}</p><p className="mt-1 text-lg font-black text-[#DDE9C7]">{point.freedom.toFixed(1)}%</p><p className="mt-1 text-[11px] font-semibold text-white/46">{point.state}</p></div>)}</div></div></section>;
}

function ScenarioCard({ projection }: { projection: ProjectionResult }) {
  const tone = projection.scenario.id === 'optimista' ? 'emerald' : projection.scenario.id === 'conservador' ? 'amber' : 'teal';
  const border = tone === 'emerald' ? 'border-emerald-400/18' : tone === 'amber' ? 'border-amber-400/18' : 'border-cyan-400/18';
  return <article className={`rounded-[28px] border ${border} bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.78))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]`}><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Comparativo</p><h3 className="mt-1 text-xl font-black tracking-[-0.045em] text-white">{projection.scenario.label}</h3><p className="mt-2 min-h-[40px] text-xs font-semibold leading-5 text-white/50">{projection.scenario.description}</p><div className="mt-4 grid grid-cols-2 gap-2"><Metric label="Patrimonio proyectado" value={currency.format(projection.projectedNetWorth)} /><Metric label="Cash Flow anualizado" value={currency.format(projection.monthlyCashFlow * 12)} tone={projection.monthlyCashFlow >= 0 ? 'good' : 'risk'} /><Metric label="Deuda proyectada" value={currency.format(projection.projectedDebt)} tone="risk" /><Metric label="Libertad financiera" value={`${projection.freedom.toFixed(1)}%`} /><Metric label="Ingreso neto" value={currency.format(projection.monthlyIncome)} /><Metric label="Gastos" value={currency.format(projection.monthlyExpenses)} tone="risk" /><Metric label="Ingreso pasivo" value={currency.format(projection.passiveIncome)} /><Metric label="Cash Flow mensual" value={currency.format(projection.monthlyCashFlow)} tone={projection.monthlyCashFlow >= 0 ? 'good' : 'risk'} /></div></article>;
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: Tone }) {
  return <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/36">{label}</p><p className={`mt-1 truncate text-sm font-black ${tone === 'good' ? 'text-emerald-300' : tone === 'risk' ? 'text-rose-300' : tone === 'watch' ? 'text-amber-300' : 'text-white'}`}>{value}</p></div>;
}

function InsightsPanel({ insights }: { insights: ReturnType<typeof buildInsights> }) {
  return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.78))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Insights automáticos</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Decisiones que mueven tu futuro</h2><div className="mt-4 grid gap-2 md:grid-cols-2">{insights.map((insight) => <article key={insight.title} className="rounded-[20px] border border-white/10 bg-white/[0.045] p-3"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/62">{insight.icon}</span><div><p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/38">{insight.title}</p><p className={`mt-1 text-lg font-black ${insight.tone === 'good' ? 'text-emerald-300' : insight.tone === 'risk' ? 'text-rose-300' : 'text-amber-300'}`}>{insight.value}</p><p className="mt-1 text-xs font-semibold leading-5 text-white/50">{insight.detail}</p></div></div></article>)}</div></section>;
}

function ConnectedGoal({ goal, projection, bestProjection }: { goal?: GoalItem; projection: ProjectionResult; bestProjection?: ProjectionResult }) {
  if (!goal) return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.78))] p-5 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Meta principal conectada</p><h2 className="mt-2 text-xl font-black text-white">Crea una meta para que Capital Console pueda proyectar tu camino financiero.</h2><a href="/create/goal" className="mt-5 inline-flex rounded-full bg-[#DDE9C7] px-5 py-3 text-sm font-black text-[#10170D]">Crear meta</a></section>;
  const remaining = Math.max(0, goal.objetivo - (goal.actual || 0));
  const pct = goal.objetivo > 0 ? Math.min(100, ((goal.actual || 0) / goal.objetivo) * 100) : 0;
  const months = monthsToGoal(goal, projection.monthlyCashFlow);
  return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.78))] p-5 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Meta principal conectada</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">{goal.nombre}</h2><div className="mt-4 grid grid-cols-2 gap-2"><Metric label="Objetivo" value={currency.format(goal.objetivo)} /><Metric label="Progreso actual" value={currency.format(goal.actual || 0)} /><Metric label="Faltante" value={currency.format(remaining)} tone={remaining > 0 ? 'watch' : 'good'} /><Metric label="Tiempo estimado" value={months === null ? 'Sin fecha' : `${months} meses`} tone={months === null ? 'risk' : 'good'} /></div><div className="mt-4"><div className="flex items-center justify-between text-xs font-black text-white/54"><span>Progreso</span><span>{pct.toFixed(0)}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#8FA85A] to-[#DDE9C7]" style={{ width: `${pct}%` }} /></div></div><p className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.045] p-3 text-xs font-semibold leading-5 text-white/54">Escenario que más acelera la meta: <span className="font-black text-[#DDE9C7]">{bestProjection?.scenario.label ?? 'Sin escenario'}</span>.</p></section>;
}

function ProjectionEmptyState() {
  return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.92),rgba(12,20,30,0.78))] p-6 text-center shadow-[0_22px_60px_rgba(2,8,15,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]"><div className="mx-auto max-w-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.055] text-white/58">⌁</div><h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-white">Aún no hay datos suficientes para proyectar.</h2><p className="mt-2 text-sm font-semibold leading-6 text-white/54">Necesitas al menos un ingreso y un gasto. Los activos, pasivos y metas son opcionales, pero enriquecen la simulación.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><a href="/create/income" className="rounded-full bg-[#DDE9C7] px-5 py-3 text-sm font-black text-[#10170D]">Agregar ingreso</a><a href="/create/expense" className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-black text-white/70">Agregar gasto</a><a href="/create/asset" className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-black text-white/70">Agregar activo</a></div></div></section>;
}
