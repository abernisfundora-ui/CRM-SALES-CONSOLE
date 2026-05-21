import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { LeadFormValues } from '@/features/funnel/types';

type ValidationErrors = {
  name?: string;
  phone?: string;
  usage?: string;
  currentBillAmount?: string;
  freeUsagePercent?: string;
};

type LeadFormProps = {
  values: LeadFormValues;
  errors: ValidationErrors;
  successMessage: string;
  onChange: (field: keyof LeadFormValues, value: string) => void;
  onSubmit: () => void;
};

const INPUT_CLASSES =
  'h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-[#0077c8] focus:ring-2 focus:ring-[#0077c8]/20';

export function LeadForm({ values, errors, successMessage, onChange, onSubmit }: LeadFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 5 · Envía los datos del cliente</p>
      <h3 className="mt-2 text-base font-semibold text-slate-900">Revisión comercial rápida</h3>
      <p className="mt-1 text-xs text-slate-600">Déjanos los datos del cliente para revisar su ahorro y dar seguimiento.</p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="leadName" className="mb-1 block text-xs font-medium text-slate-700">
            Nombre
          </label>
          <Input
            className={INPUT_CLASSES}
            id="leadName"
            value={values.name}
            placeholder="Ej: María López"
            onChange={(event) => onChange('name', event.target.value)}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="leadPhone" className="mb-1 block text-xs font-medium text-slate-700">
            Teléfono
          </label>
          <Input
            className={INPUT_CLASSES}
            id="leadPhone"
            placeholder="Ej: (786) 555-1234"
            value={values.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="leadEmail" className="mb-1 block text-xs font-medium text-slate-700">
            Email (opcional)
          </label>
          <Input
            className={INPUT_CLASSES}
            id="leadEmail"
            type="email"
            placeholder="Ej: maria@email.com"
            value={values.email}
            onChange={(event) => onChange('email', event.target.value)}
          />
        </div>
      </div>

      {(errors.usage || errors.currentBillAmount || errors.freeUsagePercent) && (
        <div className="mt-3 space-y-1 text-xs text-rose-600">
          {errors.usage && <p>{errors.usage}</p>}
          {errors.currentBillAmount && <p>{errors.currentBillAmount}</p>}
          {errors.freeUsagePercent && <p>{errors.freeUsagePercent}</p>}
        </div>
      )}

      {successMessage && <p className="mt-3 text-xs text-[#3f7d2e]">{successMessage}</p>}

      <div className="mt-5 space-y-2">
        <Button type="button" className="w-full justify-center bg-[#0077c8] py-3 text-sm font-semibold text-white hover:bg-[#0063a7]" onClick={onSubmit}>
          Revisar su ahorro por WhatsApp
        </Button>
        <p className="text-xs text-slate-600">Te contactaremos por WhatsApp para revisar el ahorro y ayudarte con el siguiente paso.</p>
      </div>
    </section>
  );
}
