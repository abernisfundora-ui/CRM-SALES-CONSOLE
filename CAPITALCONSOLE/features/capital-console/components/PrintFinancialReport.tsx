import type { ReactNode } from 'react';
import type { AssetItem } from '@/types/assets';
import type { ExpenseItem } from '@/types/expenses';
import { getAssetCashFlow, getAssetMonthlyExpense, getAssetMonthlyIncome, getAssetRoi, getIncomeGrossMonthly, getIncomeNetMonthly } from '@/lib/finance/metrics';
import type { GoalItem } from '@/types/goals';
import type { IncomeItem } from '@/types/incomes';
import type { LiabilityItem } from '@/types/liabilities';

type ExpenseBreakdown = { label: string; total: number; percent: number };
type ReportComparison = { income?: number; expenses?: number; cashFlow?: number; netWorth?: number };

type PrintFinancialReportProps = {
  monthLabel: string;
  generatedAt: string;
  reportId: string;
  executiveSummary: string;
  insights: string[];
  incomeRows: IncomeItem[];
  expenseRows: ExpenseItem[];
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  goals: GoalItem[];
  expenseBreakdown: ExpenseBreakdown[];
  comparison?: ReportComparison;
  totals: {
    income: number;
    grossIncome: number;
    retainedIncome: number;
    expenses: number;
    balance: number;
    netWorth: number;
    freedom: number;
    assets: number;
    liabilities: number;
    passiveIncome: number;
    fixedExpenses: number;
    variableExpenses: number;
    savings: number;
    savingsRate: number;
    assetCashFlow: number;
  };
};

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

function formatDate(dateValue?: string) {
  if (!dateValue) return '—';
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function formatPercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 'Sin comparación previa';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}% vs mes anterior`;
}

function incomeTax(income: IncomeItem) {
  return income.totalDeductionsMonthly ?? Math.max(0, getIncomeGrossMonthly(income) - getIncomeNetMonthly(income));
}

function incomeOrigin(income: IncomeItem) {
  if (income.sourceType === 'derived_asset') return income.assetOriginName ? `Activo · ${income.assetOriginName}` : 'Activo';
  return income.origin?.trim() || income.descripcion?.trim() || 'Manual';
}

function incomeType(income: IncomeItem) {
  if (income.sourceType === 'derived_asset' || income.incomeKind === 'ingreso_pasivo') return 'Pasivo';
  return 'Activo';
}

function incomeFrequency(income: IncomeItem) {
  return income.frequency ?? income.incomeFrequency ?? 'mensual';
}

function expenseOrigin(expense: ExpenseItem) {
  if (expense.originType === 'asset-derived') return expense.assetOriginName ? `Activo · ${expense.assetOriginName}` : 'Activo';
  if (expense.originType === 'liability-derived') return expense.liabilityOriginName ? `Pasivo · ${expense.liabilityOriginName}` : 'Pasivo';
  return expense.descripcion?.trim() || 'Manual';
}

function debtRisk(liability: LiabilityItem) {
  if (liability.debtClass === 'deuda_buena') return 'Deuda saludable';
  if (liability.debtClass === 'deuda_mala') return 'Deuda alta';
  if ((liability.pagoMensual || 0) > 0 && (liability.saldoActual || 0) / Math.max(1, liability.pagoMensual) > 36) return 'Seguimiento alto';
  return 'Deuda media';
}

export function PrintFinancialReport({ monthLabel, generatedAt, reportId, executiveSummary, insights, incomeRows, expenseRows, assets, liabilities, goals, expenseBreakdown, comparison, totals }: PrintFinancialReportProps) {
  const primaryGoal = goals[0];
  const goalPct = primaryGoal && primaryGoal.objetivo > 0 ? Math.min(100, ((primaryGoal.actual || 0) / primaryGoal.objetivo) * 100) : 0;

  return (
    <article id="financial-statement-print" className="print-financial-report">
      <header className="print-report-header">
        <div>
          <p className="print-brand">CAPITAL CONSOLE</p>
          <h1>Estado Financiero Mensual</h1>
          <p>Reporte imprimible para revisión financiera, taxes y documentación patrimonial.</p>
          <p className="print-subbrand">Executive Wealth Statement</p>
        </div>
        <div className="print-report-meta">
          <p><strong>Mes:</strong> {monthLabel || 'Sin mes seleccionado'}</p>
          <p><strong>Generado:</strong> {generatedAt}</p>
          <p><strong>Referencia:</strong> {reportId}</p>
        </div>
      </header>

      <section className="print-section print-notes-box">
        <h2>Resumen ejecutivo</h2>
        <p>{executiveSummary}</p>
      </section>

      <section className="print-section">
        <h2>KPIs superiores</h2>
        <div className="print-metric-grid">
          <PrintMetric label="Ingreso bruto" value={currency.format(totals.grossIncome)} />
          <PrintMetric label="Ingreso neto" value={currency.format(totals.income)} />
          <PrintMetric label="Impuestos / retenciones" value={currency.format(totals.retainedIncome)} />
          <PrintMetric label="Gastos" value={currency.format(totals.expenses)} />
          <PrintMetric label="Cash Flow" value={currency.format(totals.balance)} tone={totals.balance >= 0 ? 'positive' : 'negative'} />
          <PrintMetric label="Patrimonio" value={currency.format(totals.netWorth)} />
          <PrintMetric label="Activos" value={currency.format(totals.assets)} />
          <PrintMetric label="Pasivos" value={currency.format(totals.liabilities)} />
          <PrintMetric label="Ahorro" value={`${currency.format(totals.savings)} · ${totals.savingsRate.toFixed(1)}%`} />
          <PrintMetric label="Libertad financiera" value={`${totals.freedom.toFixed(1)}%`} />
          <PrintMetric label="Ingreso pasivo" value={currency.format(totals.passiveIncome)} />
          <PrintMetric label="Cash Flow activos" value={currency.format(totals.assetCashFlow)} />
        </div>
      </section>

      <section className="print-section print-comparison-box">
        <h2>Comparación mensual</h2>
        <div className="print-metric-grid print-metric-grid-four">
          <PrintMetric label="Ingresos" value={formatPercent(comparison?.income)} />
          <PrintMetric label="Gastos" value={formatPercent(comparison?.expenses)} />
          <PrintMetric label="Cash Flow" value={formatPercent(comparison?.cashFlow)} />
          <PrintMetric label="Patrimonio" value={formatPercent(comparison?.netWorth)} />
        </div>
      </section>

      <PrintTable title="1. Ingresos activos y pasivos" columns={['Fecha', 'Concepto', 'Origen/Fuente', 'Tipo', 'Frecuencia', 'Bruto', 'Impuestos', 'Neto']}>
        {incomeRows.length === 0 ? <PrintEmpty colSpan={8} label="Sin ingresos registrados para este mes." /> : incomeRows.map((income) => (
          <tr key={income.id}><td>{formatDate(income.fecha)}</td><td><strong>{income.nombre}</strong></td><td>{incomeOrigin(income)}</td><td>{incomeType(income)}</td><td>{incomeFrequency(income)}</td><td className="print-money">{currency.format(getIncomeGrossMonthly(income))}</td><td className="print-money">{currency.format(incomeTax(income))}</td><td className="print-money">{currency.format(getIncomeNetMonthly(income))}</td></tr>
        ))}
      </PrintTable>

      <PrintTable title="2. Gastos" columns={['Fecha', 'Concepto', 'Categoría', 'Frecuencia', 'Monto', '% del total']}>
        {expenseRows.length === 0 ? <PrintEmpty colSpan={6} label="Sin gastos registrados para este mes." /> : expenseRows.map((expense) => (
          <tr key={expense.id}><td>{formatDate(expense.fecha)}</td><td><strong>{expense.nombre}</strong><br /><span>{expenseOrigin(expense)}</span></td><td>{expense.tipo}</td><td>{expense.frecuencia}</td><td className="print-money">{currency.format(expense.montoMensual)}</td><td className="print-money">{totals.expenses > 0 ? `${((expense.montoMensual / totals.expenses) * 100).toFixed(1)}%` : '0.0%'}</td></tr>
        ))}
      </PrintTable>

      <section className="print-section print-breakdown-box">
        <h2>Resumen de gastos por categoría</h2>
        {expenseBreakdown.length === 0 ? <p className="print-empty-block">Sin gastos registrados para este mes.</p> : expenseBreakdown.map((item) => <div key={item.label} className="print-category-row"><span>{item.label}</span><strong>{currency.format(item.total)} · {item.percent.toFixed(1)}%</strong><i style={{ width: `${Math.min(100, item.percent)}%` }} /></div>)}
      </section>

      <PrintTable title="3. Activos" columns={['Activo', 'Tipo', 'Clasificación', 'Valor actual', 'Ingreso', 'Gasto', 'Cash Flow', 'ROI']}>
        {assets.length === 0 ? <PrintEmpty colSpan={8} label="Sin activos registrados." /> : assets.map((asset) => {
          const cashFlow = getAssetCashFlow(asset);
          const badge = asset.generaIngreso ? 'Productivo' : cashFlow > 0 ? 'Creciendo' : cashFlow < 0 ? 'Riesgo' : 'Sin flujo';
          return <tr key={asset.id}><td><strong>{asset.nombre}</strong><br /><span>{badge}</span></td><td>{asset.tipo}</td><td>{asset.wealthClass?.replace('_', ' ') ?? 'Neutro'}</td><td className="print-money">{currency.format(asset.valorActual)}</td><td className="print-money">{currency.format(getAssetMonthlyIncome(asset))}</td><td className="print-money">{currency.format(getAssetMonthlyExpense(asset))}</td><td className="print-money">{currency.format(cashFlow)}</td><td className="print-money">{getAssetRoi(asset).toFixed(1)}%</td></tr>;
        })}
      </PrintTable>

      <PrintTable title="4. Pasivos" columns={['Pasivo', 'Tipo', 'Balance', 'Pago mensual', 'Interés', 'Fecha de pago', 'Riesgo']}>
        {liabilities.length === 0 ? <PrintEmpty colSpan={7} label="Sin pasivos registrados." /> : liabilities.map((liability) => (
          <tr key={liability.id}><td><strong>{liability.nombre}</strong></td><td>{liability.tipo}</td><td className="print-money">{currency.format(liability.saldoActual)}</td><td className="print-money">{currency.format(liability.pagoMensual)}</td><td>—</td><td>{formatDate(liability.proximaFechaPago)}</td><td>{debtRisk(liability)}</td></tr>
        ))}
      </PrintTable>

      <section className="print-section print-balance-box">
        <h2>5. Balance final</h2>
        <div className="print-metric-grid">
          <PrintMetric label="Patrimonio neto" value={currency.format(totals.netWorth)} />
          <PrintMetric label="Cash Flow mensual" value={currency.format(totals.balance)} tone={totals.balance >= 0 ? 'positive' : 'negative'} />
          <PrintMetric label="Ahorro" value={`${currency.format(totals.savings)} · ${totals.savingsRate.toFixed(1)}%`} />
          <PrintMetric label="Libertad financiera" value={`${totals.freedom.toFixed(1)}%`} />
          <PrintMetric label="Gastos fijos" value={currency.format(totals.fixedExpenses)} />
          <PrintMetric label="Gastos variables" value={currency.format(totals.variableExpenses)} />
          <PrintMetric label="Deuda total" value={currency.format(totals.liabilities)} />
          <PrintMetric label="Capacidad reinversión" value={currency.format(totals.savings)} />
        </div>
      </section>

      <section className="print-section print-notes-box">
        <h2>6. Interpretación financiera</h2>
        <ul className="print-insight-list">{insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>
      </section>

      <section className="print-section print-goal-box">
        <h2>7. Metas y objetivos</h2>
        {!primaryGoal ? <p className="print-empty-block">Sin metas vinculadas a este reporte.</p> : <div><p><strong>{primaryGoal.nombre}</strong> · objetivo {currency.format(primaryGoal.objetivo)} · progreso {currency.format(primaryGoal.actual || 0)} · faltante {currency.format(Math.max(0, primaryGoal.objetivo - (primaryGoal.actual || 0)))} · {goalPct.toFixed(1)}% alcanzado</p><div className="print-goal-track"><span style={{ width: `${goalPct}%` }} /></div></div>}
      </section>

      <footer className="print-report-footer">
        <span>Capital Console — Executive Wealth Workspace</span>
        <span>Reporte generado automáticamente el {generatedAt}</span>
        <span>© 2026 Todos los derechos reservados — Desarrollado por Ruben D Hernandez</span>
      </footer>
    </article>
  );
}

function PrintMetric({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'negative' }) {
  return <div className={`print-metric ${tone ? `print-metric-${tone}` : ''}`}><p>{label}</p><strong>{value}</strong></div>;
}

function PrintTable({ title, columns, children }: { title: string; columns: string[]; children: ReactNode }) {
  return <section className="print-section"><h2>{title}</h2><table className="print-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{children}</tbody></table></section>;
}

function PrintEmpty({ colSpan, label }: { colSpan: number; label: string }) {
  return <tr><td colSpan={colSpan} className="print-empty">{label}</td></tr>;
}
