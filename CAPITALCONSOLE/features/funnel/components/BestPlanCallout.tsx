import { MoneyValue } from '@/features/funnel/components/MoneyValue';
import type { EstimateResult } from '@/features/funnel/types';

const getDynamicMessage = (difference: number) => {
  if (difference >= 40) return 'Podrías ahorrar de forma importante con el plan recomendado.';
  if (difference >= 15) return 'La diferencia entre planes es moderada.';
  return 'La diferencia entre planes es pequeña.';
};

export function BestPlanCallout({
  selected,
  best,
  allResults,
  currentBillAmount
}: {
  selected: EstimateResult;
  best: EstimateResult | null;
  allResults: EstimateResult[];
  currentBillAmount: number;
}) {
  if (!best) return null;

  const difference = selected.breakdown.total - best.breakdown.total;
  const selectedIsBest = selected.planId === best.planId;
  const bestVsBill = currentBillAmount > 0 ? currentBillAmount - best.breakdown.total : null;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${selectedIsBest ? 'border-[#6cc24a]/50 bg-[#e9f7ef]' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 4 · Comparador automático</p>
      <p className="mt-2 text-base font-semibold text-slate-900">
        {selectedIsBest
          ? 'Este parece ser el mejor plan para este perfil de consumo.'
          : (
            <>
              Podrías ahorrar <MoneyValue value={Math.abs(difference)} className="font-bold text-[#3f7d2e]" />/mes con {best.planName}.
            </>
          )}
      </p>
      <p className="mt-1 text-sm text-slate-700">{getDynamicMessage(Math.abs(difference))}</p>

      {bestVsBill !== null && (
        <p className="mt-2 text-sm text-slate-700">
          {bestVsBill >= 0 ? (
            <>
              {best.planName} podría ahorrarte <MoneyValue value={bestVsBill} className="font-semibold text-emerald-700" /> frente a tu factura actual.
            </>
          ) : (
            <>
              {best.planName} podría costarte <MoneyValue value={Math.abs(bestVsBill)} className="font-semibold text-rose-700" /> más que tu factura actual.
            </>
          )}
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {allResults.map((result) => {
          const isBest = result.planId === best.planId;
          return (
            <div key={result.planId} className={`rounded-xl border p-3 ${isBest ? 'border-[#6cc24a] bg-[#f1faee]' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-700">{result.planName}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                <MoneyValue value={result.breakdown.total} />
              </p>
              {isBest && <p className="mt-1 text-[11px] font-semibold text-[#3f7d2e]">Mejor estimado</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
