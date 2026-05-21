import { MoneyValue } from '@/features/funnel/components/MoneyValue';
import type { EstimateResult, PlanConfig } from '@/features/funnel/types';
import { formatRate } from '@/features/funnel/lib/format';

const getBillMessage = (realSavings: number) => {
  if (realSavings > 20) return 'Comparado con tu factura actual, podrías ahorrar aproximadamente este monto al mes.';
  if (realSavings > 0) return 'La diferencia contra tu factura actual sería de alrededor de este monto mensual.';
  if (realSavings === 0) return 'Con este plan no se aprecia ahorro frente a tu factura actual.';
  return 'Este plan podría salir más caro que tu factura actual.';
};

export function EstimateBreakdown({
  estimate,
  plan,
  currentBillAmount,
  realSavings
}: {
  estimate: EstimateResult;
  plan: PlanConfig;
  currentBillAmount: number;
  realSavings: number;
}) {
  if (estimate.usage <= 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 4 · Revisa el estimado</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Ingresa el consumo para ver el estimado</h3>
        <p className="mt-1 text-sm text-slate-600">Pon tu consumo y lo que pagaste en tu último bill para mostrarte cuánto podrías ahorrar realmente.</p>
      </div>
    );
  }

  const rows = [
    { label: 'Energía', value: estimate.breakdown.energyCost },
    { label: 'Oncor', value: estimate.breakdown.oncorCost },
    { label: 'Cargo base', value: estimate.breakdown.baseCharge },
    { label: 'Impuestos y cargos estimados', value: estimate.breakdown.taxes }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 4 · Revisa el estimado</p>
      <p className="mt-2 text-sm text-slate-700">Con este consumo, este plan estima aproximadamente:</p>

      <div className="mt-4 rounded-xl border border-sky-100 bg-[#f3f9fe] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Total estimado</p>
        <p className="mt-2 text-5xl font-extrabold leading-none text-[#0077c8]">
          <MoneyValue value={estimate.breakdown.total} />
        </p>
        <p className="mt-2 text-sm text-slate-700">Tarifa promedio: {formatRate(estimate.breakdown.averageRate)}</p>
      </div>

      {currentBillAmount > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-2 text-sm">
            <p className="flex items-center justify-between text-slate-700">
              <span>Tu factura actual</span>
              <MoneyValue value={currentBillAmount} className="font-semibold text-slate-900" />
            </p>
            <p className="flex items-center justify-between text-slate-700">
              <span>Con este plan</span>
              <MoneyValue value={estimate.breakdown.total} className="font-semibold text-slate-900" />
            </p>
            <p className="flex items-center justify-between font-semibold">
              <span>{realSavings >= 0 ? 'Ahorro estimado' : 'Diferencia estimada'}</span>
              <MoneyValue value={Math.abs(realSavings)} className={realSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'} />
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-600">{getBillMessage(realSavings)}</p>
        </div>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-slate-700">
            <dt>{row.label}</dt>
            <dd>
              <MoneyValue value={row.value} className="font-medium text-slate-900" />
            </dd>
          </div>
        ))}
        {plan.type === 'free-hours' && (
          <div className="flex items-center justify-between rounded-lg border border-[#6cc24a]/25 bg-[#e9f7ef] px-3 py-2 text-[#3f7d2e]">
            <dt>Crédito por horas gratis</dt>
            <dd className="font-semibold">
              -<MoneyValue value={estimate.breakdown.freeCreditDisplay} />
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-xs text-slate-500">Estimate only. Actual bill may vary.</p>
    </div>
  );
}
