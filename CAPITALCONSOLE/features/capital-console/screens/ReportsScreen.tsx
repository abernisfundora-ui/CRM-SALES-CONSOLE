'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAssetCashFlow, getIncomeGrossMonthly, getIncomeNetMonthly } from '@/lib/finance/metrics';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import { PrintFinancialReport } from '@/features/capital-console/components/PrintFinancialReport';
import type { AssetItem } from '@/types/assets';
import type { ExpenseItem } from '@/types/expenses';
import type { GoalItem } from '@/types/goals';
import type { IncomeItem } from '@/types/incomes';
import type { LiabilityItem } from '@/types/liabilities';

type MonthOption = { key: string; label: string; year: string };
type Comparison = { income?: number; expenses?: number; cashFlow?: number; netWorth?: number };
type ExpenseBreakdown = { label: string; total: number; percent: number };

type ReportModel = {
  incomeRows: IncomeItem[];
  expenseRows: ExpenseItem[];
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  goals: GoalItem[];
  grossIncome: number;
  netIncome: number;
  taxes: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  passiveIncome: number;
  assetCashFlow: number;
  assetsTotal: number;
  liabilitiesTotal: number;
  netWorth: number;
  cashFlow: number;
  savings: number;
  savingsRate: number;
  freedom: number;
  movementCount: number;
  expenseBreakdown: ExpenseBreakdown[];
};

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function monthKey(dateValue?: string) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = monthFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(dateValue?: string) {
  if (!dateValue) return '—';
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

function compareMonthKeyDesc(a: string, b: string) {
  return a < b ? 1 : a > b ? -1 : 0;
}

function previousMonthKey(key: string) {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getYear(key: string) {
  return key.slice(0, 4);
}

function percentDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function incomeTax(income: IncomeItem) {
  return income.totalDeductionsMonthly ?? Math.max(0, getIncomeGrossMonthly(income) - getIncomeNetMonthly(income));
}

function incomeOrigin(income: IncomeItem) {
  if (income.sourceType === 'derived_asset') return income.assetOriginName ? `Activo · ${income.assetOriginName}` : 'Activo';
  if (income.origin?.trim()) return income.origin;
  if (income.descripcion?.trim()) return income.descripcion;
  return 'Manual';
}

function incomeType(income: IncomeItem) {
  if (income.sourceType === 'derived_asset' || income.incomeKind === 'ingreso_pasivo') return 'Pasivo';
  return 'Activo';
}

function incomeFrequency(income: IncomeItem) {
  return income.frequency ?? income.incomeFrequency ?? 'mensual';
}

function expenseOrigin(expense: ExpenseItem) {
  if (expense.originType === 'liability-derived') return expense.liabilityOriginName ? `Pasivo · ${expense.liabilityOriginName}` : 'Pasivo';
  if (expense.originType === 'asset-derived') return expense.assetOriginName ? `Activo · ${expense.assetOriginName}` : 'Activo';
  if (expense.descripcion?.trim()) return expense.descripcion;
  return 'Manual';
}

function liabilityRisk(liability: LiabilityItem) {
  if (liability.debtClass === 'deuda_buena') return 'Deuda saludable';
  if (liability.debtClass === 'deuda_mala') return 'Deuda alta';
  return liability.linkedAssetId ? 'Deuda saludable' : 'Deuda media';
}

function buildReport(input: { month: string; incomes: IncomeItem[]; expenses: ExpenseItem[]; assets: AssetItem[]; liabilities: LiabilityItem[]; goals: GoalItem[]; liquidTotal: number }): ReportModel {
  const incomeRows = input.incomes.filter((item) => monthKey(item.fecha) === input.month);
  const expenseRows = input.expenses.filter((item) => monthKey(item.fecha) === input.month);
  const grossIncome = incomeRows.reduce((acc, item) => acc + getIncomeGrossMonthly(item), 0);
  const netIncome = incomeRows.reduce((acc, item) => acc + getIncomeNetMonthly(item), 0);
  const taxes = incomeRows.reduce((acc, item) => acc + incomeTax(item), 0);
  const totalExpenses = expenseRows.reduce((acc, item) => acc + (item.montoMensual || 0), 0);
  const fixedExpenses = expenseRows.filter((item) => item.tipo === 'fijo').reduce((acc, item) => acc + (item.montoMensual || 0), 0);
  const variableExpenses = expenseRows.filter((item) => item.tipo === 'variable').reduce((acc, item) => acc + (item.montoMensual || 0), 0);
  const passiveIncome = incomeRows.filter((item) => item.sourceType === 'derived_asset' || item.incomeKind === 'ingreso_pasivo').reduce((acc, item) => acc + getIncomeNetMonthly(item), 0);
  const assetCashFlow = input.assets.reduce((acc, asset) => acc + getAssetCashFlow(asset), 0);
  const assetsTotal = input.assets.reduce((acc, item) => acc + (item.valorActual || 0), 0) + input.liquidTotal;
  const liabilitiesTotal = input.liabilities.reduce((acc, item) => acc + (item.saldoActual || 0), 0);
  const cashFlow = netIncome - totalExpenses;
  const savings = Math.max(0, cashFlow);
  const expenseGroups = expenseRows.reduce<Record<string, number>>((acc, item) => {
    const label = item.tipo === 'fijo' ? 'Gastos fijos' : 'Gastos variables';
    acc[label] = (acc[label] ?? 0) + (item.montoMensual || 0);
    return acc;
  }, {});
  const expenseBreakdown = Object.entries(expenseGroups).map(([label, total]) => ({ label, total, percent: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0 }));

  return {
    incomeRows,
    expenseRows,
    assets: input.assets,
    liabilities: input.liabilities,
    goals: input.goals,
    grossIncome,
    netIncome,
    taxes,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    passiveIncome,
    assetCashFlow,
    assetsTotal,
    liabilitiesTotal,
    netWorth: assetsTotal - liabilitiesTotal,
    cashFlow,
    savings,
    savingsRate: netIncome > 0 ? (savings / netIncome) * 100 : 0,
    freedom: totalExpenses > 0 ? (passiveIncome / totalExpenses) * 100 : 0,
    movementCount: incomeRows.length + expenseRows.length,
    expenseBreakdown
  };
}

function buildExecutiveSummary(month: string, report: ReportModel) {
  if (report.movementCount === 0) return `No hay información suficiente para generar una interpretación completa de ${month}.`;
  if (report.cashFlow >= 0) return `Durante ${month}, se generó un Cash Flow positivo de ${currency.format(report.cashFlow)}, con ingresos netos de ${currency.format(report.netIncome)} y gastos de ${currency.format(report.totalExpenses)}.`;
  return `Durante ${month}, los gastos superaron los ingresos por ${currency.format(Math.abs(report.cashFlow))}, generando un Cash Flow negativo sobre ingresos netos de ${currency.format(report.netIncome)}.`;
}

function buildInsights(report: ReportModel, comparison?: Comparison) {
  const insights: string[] = [];
  if (report.movementCount === 0) insights.push('Agrega más movimientos para obtener una interpretación completa del mes.');
  if (report.cashFlow > 0) insights.push('Tu Cash Flow fue positivo. Existe capacidad de ahorro o reinversión.');
  if (report.cashFlow < 0) insights.push('Tus gastos superaron tus ingresos este mes. Revisa categorías de mayor impacto.');
  if (report.passiveIncome > 0) insights.push(`Tus ingresos pasivos cubrieron ${report.freedom.toFixed(1)}% de tus gastos.`);
  if (report.totalExpenses > 0 && report.fixedExpenses / report.totalExpenses > 0.65) insights.push(`Tus gastos fijos representan ${((report.fixedExpenses / report.totalExpenses) * 100).toFixed(1)}% del gasto total.`);
  if (report.liabilitiesTotal > report.assetsTotal * 0.5) insights.push('Tu nivel de deuda requiere seguimiento frente al valor de tus activos.');
  if (comparison?.netWorth !== undefined && comparison.netWorth > 0) insights.push('Tu patrimonio aumentó frente al mes anterior.');
  if (insights.length === 0) insights.push('El mes se mantiene estable. Continúa registrando ingresos, gastos, activos y pasivos para mejorar la lectura financiera.');
  return insights;
}

function reportId(month: string) {
  return `CC-${month.replace('-', '')}`;
}

function buildComparison(current: ReportModel, previous?: ReportModel): Comparison | undefined {
  if (!previous) return undefined;
  return {
    income: percentDelta(current.netIncome, previous.netIncome),
    expenses: percentDelta(current.totalExpenses, previous.totalExpenses),
    cashFlow: percentDelta(current.cashFlow, previous.cashFlow),
    netWorth: percentDelta(current.netWorth, previous.netWorth)
  };
}

export function ReportsScreen() {
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const assets = useCapitalStore(capitalSelectors.assets);
  const liabilities = useCapitalStore(capitalSelectors.liabilities);
  const liquidAccounts = useCapitalStore(capitalSelectors.liquidAccounts);
  const goals = useCapitalStore(capitalSelectors.goals);

  const liquidTotal = useMemo(() => liquidAccounts.filter((item) => (item.estado ?? (item.incluirEnLiquidez ? 'active' : 'inactive')) === 'active' && item.incluirEnLiquidez !== false).reduce((acc, item) => acc + (item.saldoActual || 0), 0), [liquidAccounts]);
  const months = useMemo<MonthOption[]>(() => {
    const keys = new Set<string>();
    incomes.forEach((item) => { const key = monthKey(item.fecha); if (key) keys.add(key); });
    expenses.forEach((item) => { const key = monthKey(item.fecha); if (key) keys.add(key); });
    assets.forEach((item) => { const key = monthKey(item.fecha); if (key) keys.add(key); });
    liabilities.forEach((item) => { const key = monthKey(item.proximaFechaPago); if (key) keys.add(key); });
    goals.forEach((item) => { const key = monthKey(item.fechaObjetivo); if (key) keys.add(key); });
    return [...keys].sort(compareMonthKeyDesc).map((key) => ({ key, label: monthLabel(key), year: getYear(key) }));
  }, [assets, expenses, goals, incomes, liabilities]);

  const years = useMemo(() => [...new Set(months.map((month) => month.year))], [months]);
  const [selectedYear, setSelectedYear] = useState(() => years[0] ?? String(new Date().getUTCFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(() => months[0]?.key ?? '');

  useEffect(() => {
    if (!months.length) return;
    if (!years.includes(selectedYear)) setSelectedYear(years[0]);
    if (!selectedMonth || !months.some((month) => month.key === selectedMonth)) setSelectedMonth(months[0].key);
  }, [months, selectedMonth, selectedYear, years]);

  const yearMonths = useMemo(() => months.filter((month) => month.year === selectedYear), [months, selectedYear]);
  const activeMonth = selectedMonth || months[0]?.key || '';
  const report = useMemo(() => buildReport({ month: activeMonth, incomes, expenses, assets, liabilities, goals, liquidTotal }), [activeMonth, assets, expenses, goals, incomes, liabilities, liquidTotal]);
  const previousReport = useMemo(() => {
    const previous = previousMonthKey(activeMonth);
    return months.some((month) => month.key === previous) ? buildReport({ month: previous, incomes, expenses, assets, liabilities, goals, liquidTotal }) : undefined;
  }, [activeMonth, assets, expenses, goals, incomes, liabilities, liquidTotal, months]);
  const comparison = buildComparison(report, previousReport);
  const reportMonthLabel = activeMonth ? monthLabel(activeMonth) : '';
  const generatedAt = formatDate(new Date().toISOString().slice(0, 10));
  const executiveSummary = buildExecutiveSummary(reportMonthLabel, report);
  const insights = buildInsights(report, comparison);
  const bestCashFlow = useMemo(() => months.reduce((best, month) => {
    const monthReport = buildReport({ month: month.key, incomes, expenses, assets, liabilities, goals, liquidTotal });
    return monthReport.cashFlow > best.cashFlow ? { key: month.key, cashFlow: monthReport.cashFlow } : best;
  }, { key: '', cashFlow: Number.NEGATIVE_INFINITY }), [assets, expenses, goals, incomes, liabilities, liquidTotal, months]);
  const hasReportData = months.length > 0;

  const selectMonth = (month: string) => {
    setSelectedMonth(month);
    setSelectedYear(getYear(month));
  };

  const printMonth = (month = activeMonth) => {
    selectMonth(month);
    window.setTimeout(() => window.print(), 80);
  };

  return (
    <div className="cc-integrated space-y-4 pb-4 text-[#071827] lg:space-y-5">
      <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.94),rgba(9,15,22,0.86))] p-4 shadow-[0_24px_70px_rgba(2,8,15,0.20),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D6B25E]/72">Estados financieros mensuales</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.065em] text-white md:text-4xl">Centro de Reportes Financieros</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/58">Consulta, analiza, imprime y exporta tus estados financieros mensuales.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <select value={selectedYear} onChange={(event) => { setSelectedYear(event.target.value); const first = months.find((month) => month.year === event.target.value); if (first) setSelectedMonth(first.key); }} className="h-11 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-white outline-none">
              {years.length === 0 ? <option>{new Date().getUTCFullYear()}</option> : years.map((year) => <option key={year} value={year} className="text-[#10170D]">{year}</option>)}
            </select>
            <select value={activeMonth} onChange={(event) => selectMonth(event.target.value)} disabled={!hasReportData} className="h-11 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-white outline-none disabled:opacity-45">
              {yearMonths.map((month) => <option key={month.key} value={month.key} className="text-[#10170D]">{month.label}</option>)}
            </select>
            <button type="button" className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2.5 text-sm font-black text-white/72 transition hover:bg-white/10" onClick={() => selectMonth(activeMonth)} disabled={!hasReportData}>Ver reporte</button>
            <button type="button" className="rounded-full bg-[#DDE9C7] px-4 py-2.5 text-sm font-black text-[#10170D] shadow-[0_12px_28px_rgba(221,233,199,0.14)] transition hover:-translate-y-px" onClick={() => printMonth()} disabled={!hasReportData}>Imprimir</button>
            <button type="button" className="rounded-full border border-[#D6B25E]/18 bg-[linear-gradient(180deg,#168E4F_0%,#0B7438_100%)] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(11,116,56,0.22)] transition hover:-translate-y-px" onClick={() => printMonth()} disabled={!hasReportData}>Descargar PDF</button>
          </div>
        </div>
      </section>

      {!hasReportData ? (
        <ReportsEmptyState />
      ) : (
        <>
          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.76))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Nivel 1 · Historial mensual</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Timeline financiero mensual</h2></div>
              <p className="text-sm font-semibold text-white/50">Estás viendo: <span className="font-black text-[#DDE9C7]">{reportMonthLabel}</span></p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {yearMonths.map((month) => {
                const monthReport = buildReport({ month: month.key, incomes, expenses, assets, liabilities, goals, liquidTotal });
                const previous = months.some((item) => item.key === previousMonthKey(month.key)) ? buildReport({ month: previousMonthKey(month.key), incomes, expenses, assets, liabilities, goals, liquidTotal }) : undefined;
                const monthComparison = buildComparison(monthReport, previous);
                const active = month.key === activeMonth;
                const state = monthReport.cashFlow > 0 ? 'Positivo' : monthReport.cashFlow < 0 ? 'Alerta' : 'Neutro';
                const best = month.key === bestCashFlow.key;
                return <MonthReportCard key={month.key} month={month} report={monthReport} active={active} state={best ? 'Mejor mes' : state} comparison={monthComparison} onView={() => selectMonth(month.key)} onPrint={() => printMonth(month.key)} />;
              })}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.90),rgba(12,20,30,0.76))] p-4 shadow-[0_18px_46px_rgba(2,8,15,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] md:p-6">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">Nivel 2 y 3 · Preview imprimible</p><h2 className="mt-1 text-2xl font-black tracking-[-0.055em] text-white">Vista previa del reporte</h2><p className="mt-1 text-sm font-semibold text-white/50">Este reporte se genera con tus datos reales. Listo para imprimir o guardar como PDF.</p></div>
              <button type="button" className="rounded-full bg-[#DDE9C7] px-5 py-3 text-sm font-black text-[#10170D]" onClick={() => printMonth()}>Imprimir / Guardar PDF</button>
            </div>
            <div className="mx-auto max-w-[1120px]">
              <PrintFinancialReport monthLabel={reportMonthLabel} generatedAt={generatedAt} reportId={reportId(activeMonth)} executiveSummary={executiveSummary} insights={insights} incomeRows={report.incomeRows} expenseRows={report.expenseRows} assets={report.assets} liabilities={report.liabilities} goals={report.goals} expenseBreakdown={report.expenseBreakdown} comparison={comparison} totals={{ grossIncome: report.grossIncome, income: report.netIncome, retainedIncome: report.taxes, expenses: report.totalExpenses, balance: report.cashFlow, netWorth: report.netWorth, freedom: report.freedom, assets: report.assetsTotal, liabilities: report.liabilitiesTotal, passiveIncome: report.passiveIncome, fixedExpenses: report.fixedExpenses, variableExpenses: report.variableExpenses, savings: report.savings, savingsRate: report.savingsRate, assetCashFlow: report.assetCashFlow }} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MonthReportCard({ month, report, active, state, comparison, onView, onPrint }: { month: MonthOption; report: ReportModel; active: boolean; state: string; comparison?: Comparison; onView: () => void; onPrint: () => void }) {
  const tone = report.cashFlow > 0 ? 'emerald' : report.cashFlow < 0 ? 'rose' : 'slate';
  return (
    <article className={`rounded-[24px] border p-4 transition duration-300 hover:-translate-y-0.5 ${active ? 'border-[#DDE9C7]/42 bg-white/[0.095] shadow-[0_18px_42px_rgba(221,233,199,0.10)]' : 'border-white/10 bg-white/[0.045] hover:bg-white/[0.07]'}`}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black tracking-[-0.04em] text-white">{month.label}</p><p className="mt-1 text-xs font-semibold text-white/42">{report.movementCount} movimientos</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em] ${tone === 'emerald' ? 'bg-emerald-400/12 text-emerald-200' : tone === 'rose' ? 'bg-rose-400/12 text-rose-200' : 'bg-white/8 text-white/52'}`}>{state}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><Snapshot label="Cash Flow" value={currency.format(report.cashFlow)} tone={report.cashFlow >= 0 ? 'good' : 'risk'} /><Snapshot label="Patrimonio" value={currency.format(report.netWorth)} /><Snapshot label="Ingresos" value={currency.format(report.netIncome)} /><Snapshot label="Gastos" value={currency.format(report.totalExpenses)} tone="risk" /></div>
      <p className="mt-3 text-xs font-bold text-white/48">Cash Flow {comparison?.cashFlow === undefined ? 'sin comparación previa' : `${comparison.cashFlow >= 0 ? '+' : ''}${comparison.cashFlow.toFixed(1)}% vs mes anterior`}</p>
      <div className="mt-4 flex gap-2"><button type="button" onClick={onView} className="flex-1 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10">Ver reporte</button><button type="button" onClick={onPrint} className="flex-1 rounded-full bg-[#DDE9C7] px-3 py-2 text-xs font-black text-[#10170D]">PDF</button></div>
    </article>
  );
}

function Snapshot({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'risk' | 'neutral' }) {
  return <div className="rounded-[16px] border border-white/10 bg-white/[0.045] p-2.5"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/34">{label}</p><p className={`mt-1 truncate text-sm font-black ${tone === 'good' ? 'text-emerald-300' : tone === 'risk' ? 'text-rose-300' : 'text-white'}`}>{value}</p></div>;
}

function ReportsEmptyState() {
  return <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.92),rgba(12,20,30,0.78))] p-6 text-center shadow-[0_22px_60px_rgba(2,8,15,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]"><div className="mx-auto max-w-2xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.055] text-white/58">▤</div><h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-white">No hay reportes disponibles todavía.</h2><p className="mt-2 text-sm font-semibold leading-6 text-white/54">Registra ingresos, gastos, activos o pasivos para generar tus primeros reportes financieros.</p><div className="mt-5 flex flex-wrap justify-center gap-2"><a href="/create/income" className="rounded-full bg-[#DDE9C7] px-5 py-3 text-sm font-black text-[#10170D]">Agregar ingreso</a><a href="/create/expense" className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-black text-white/70">Agregar gasto</a><a href="/create/asset" className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-black text-white/70">Agregar activo</a></div></div></section>;
}
