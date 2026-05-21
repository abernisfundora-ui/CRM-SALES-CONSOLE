import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

type UsageInputsProps = {
  usage: string;
  currentBillAmount: string;
  freeUsagePercent: string;
  showFreeUsageInput: boolean;
  freePeriodLabel: string;
  onUsageChange: (value: string) => void;
  onCurrentBillChange: (value: string) => void;
  onFreeUsageChange: (value: string) => void;
};

const INPUT_BASE_CLASSES =
  'simulator-input-value w-full rounded-2xl bg-white border-2 border-slate-400 px-5 py-4 text-2xl font-extrabold text-slate-900 opacity-100 caret-sky-600 placeholder:text-slate-500 shadow-[0_2px_10px_rgba(15,23,42,0.10)] outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition';

const CHIP_BASE_CLASSES =
  'rounded-full border border-slate-300 bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200';

const QUICK_USAGE_VALUES = ['500', '1000', '1500', '2000'];
const QUICK_FREE_VALUES = ['20', '40', '60', '80'];

export function UsageInputs({
  usage,
  currentBillAmount,
  freeUsagePercent,
  showFreeUsageInput,
  freePeriodLabel,
  onUsageChange,
  onCurrentBillChange,
  onFreeUsageChange
}: UsageInputsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Completa los datos para simular</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="usage" className="mb-2 block text-sm font-bold text-slate-800">
            ¿Cuánto consumiste este mes? (kWh)
          </label>
          <Input
            className={INPUT_BASE_CLASSES}
            id="usage"
            type="number"
            min={0}
            step="1"
            value={usage}
            placeholder="Ej: 1000"
            onChange={(event) => onUsageChange(event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-700">Puedes encontrarlo en tu bill como consumo mensual o kWh usados.</p>
          {!usage && <p className="mt-1 text-xs font-medium text-slate-600">Ingresa el consumo mensual estimado del cliente.</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_USAGE_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                className={cn(CHIP_BASE_CLASSES, usage === value && 'border-sky-600 bg-sky-600 text-white')}
                onClick={() => onUsageChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="currentBill" className="mb-2 block text-sm font-bold text-slate-800">
            ¿Cuánto pagaste en tu factura actual? ($)
          </label>
          <Input
            className={INPUT_BASE_CLASSES}
            id="currentBill"
            type="number"
            min={0}
            step="0.01"
            value={currentBillAmount}
            placeholder="Ej: 210.50"
            onChange={(event) => onCurrentBillChange(event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-700">Escribe el total que te cobraron en tu último bill.</p>
        </div>

        {showFreeUsageInput && (
          <div className="md:col-span-2">
            <label htmlFor="freeUsage" className="mb-2 block text-sm font-bold text-slate-800">
              ¿Qué % del consumo ocurre en horas gratis?
            </label>
            <Input
              className={INPUT_BASE_CLASSES}
              id="freeUsage"
              type="number"
              min={0}
              max={100}
              step="1"
              value={freeUsagePercent}
              placeholder="Ej: 40"
              onChange={(event) => onFreeUsageChange(event.target.value)}
            />
            <p className="mt-2 text-xs text-slate-700">
              {freePeriodLabel === 'día'
                ? 'Pon un estimado del consumo que ocurre durante el día.'
                : 'Pon un estimado del consumo que ocurre durante la noche.'}
            </p>
            {!freeUsagePercent && (
              <p className="mt-1 text-xs font-medium text-slate-600">Pon un estimado del consumo que ocurre en horas gratis.</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_FREE_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cn(CHIP_BASE_CLASSES, freeUsagePercent === value && 'border-sky-600 bg-sky-600 text-white')}
                  onClick={() => onFreeUsageChange(value)}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
