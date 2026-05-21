'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';
import { cn } from '@/lib/cn';
import { incomeMonthlyEquivalent, nextIncomeOccurrence } from '@/lib/finance/frequency';
import { useCapitalStore } from '@/store/useCapitalStore';
import type { IncomeDeduction, IncomeFrequency, IncomeKind, IncomeStatus, IncomeTaxProfile } from '@/types/incomes';
import { FormField, FormSelect } from './FormControls';

const frequencyOptions: IncomeFrequency[] = ['una_vez', 'semanal', 'quincenal', 'mensual', 'trimestral', 'anual'];
const incomeKinds: IncomeKind[] = ['empleo', 'negocio', 'freelance', 'comision', 'renta', 'dividendos', 'intereses', 'trading', 'cripto', 'ingreso_pasivo', 'ingreso_manual', 'otros'];
const statuses: IncomeStatus[] = ['activo', 'proyectado', 'pausado', 'cerrado'];
const taxProfiles: IncomeTaxProfile[] = ['w2', '1099', 'informal', 'corporativo', 'inversion', 'otro'];
const steps = ['Tipo', 'Detalle', 'Retenciones', 'Resumen'];
const deductionCatalog = [
  { id: 'federal-tax', label: 'Federal tax' },
  { id: 'state-tax', label: 'State tax' },
  { id: 'social-security', label: 'Social security' },
  { id: 'medicare', label: 'Medicare' },
  { id: 'insurance', label: 'Seguro' },
  { id: 'retirement-401k', label: 'Retiro / 401k' },
  { id: 'other', label: 'Otros' }
] as const;

const frequencyLabel: Record<IncomeFrequency, string> = {
  una_vez: 'Una vez',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual'
};
const kindLabel: Record<IncomeKind, string> = {
  empleo: 'Empleo',
  negocio: 'Negocio',
  freelance: 'Freelance',
  comision: 'Comisión',
  renta: 'Renta',
  dividendos: 'Dividendos',
  intereses: 'Intereses',
  trading: 'Trading',
  cripto: 'Cripto',
  ingreso_pasivo: 'Ingreso pasivo',
  ingreso_manual: 'Ingreso manual',
  otros: 'Otros'
};
const taxProfileLabel: Record<IncomeTaxProfile, string> = {
  w2: 'W2',
  '1099': '1099',
  informal: 'Informal',
  corporativo: 'Corporativo',
  inversion: 'Inversión',
  otro: 'Otro'
};

const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export function IncomeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addIncome = useCapitalStore((state) => state.addIncome);
  const updateIncome = useCapitalStore((state) => state.updateIncome);
  const currentIncome = useCapitalStore((state) => state.manualIncomes.find((item) => item.id === editId));
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: currentIncome?.nombre ?? '',
    origin: currentIncome?.origin ?? currentIncome?.employer ?? '',
    employer: currentIncome?.employer ?? '',
    incomeKind: currentIncome?.incomeKind ?? ('empleo' as IncomeKind),
    grossAmount: currentIncome?.grossAmount ?? currentIncome?.incomeAmount ?? currentIncome?.montoMensual ?? 0,
    frequency: currentIncome?.frequency ?? ('mensual' as IncomeFrequency),
    startDate: currentIncome?.startDate ?? currentIncome?.incomeStartDate ?? currentIncome?.fecha ?? '',
    nextDate: currentIncome?.nextDate ?? currentIncome?.fecha ?? '',
    dayOfWeek: currentIncome?.incomeDayOfWeek ?? 1,
    dayOfMonth: currentIncome?.incomeDayOfMonth ?? 1,
    status: currentIncome?.status ?? ('activo' as IncomeStatus),
    taxCategory: currentIncome?.taxCategory ?? '',
    taxProfile: currentIncome?.taxProfile ?? ('w2' as IncomeTaxProfile),
    notes: currentIncome?.notes ?? currentIncome?.descripcion ?? '',
    isRecurring: currentIncome?.isRecurring ?? true
  });
  const [deductions, setDeductions] = useState<IncomeDeduction[]>(currentIncome?.deductions ?? deductionCatalog.map((item) => ({ id: item.id, label: item.label, mode: 'porcentaje', value: 0 })));

  const projection = useMemo(() => incomeMonthlyEquivalent({ grossAmount: Number(form.grossAmount), frequency: form.frequency, deductions }), [deductions, form.frequency, form.grossAmount]);
  const computedNextDate = useMemo(() => form.nextDate || nextIncomeOccurrence({ startDate: form.startDate, frequency: form.frequency, dayOfWeek: Number(form.dayOfWeek), dayOfMonth: Number(form.dayOfMonth) }), [form.dayOfMonth, form.dayOfWeek, form.frequency, form.nextDate, form.startDate]);
  const canSubmit = Boolean(form.incomeKind && form.nombre && form.origin && Number(form.grossAmount) > 0 && form.startDate && computedNextDate);
  const retentionRate = projection.grossPerPayment > 0 ? (projection.totalDeductionsPerPayment / projection.grossPerPayment) * 100 : 0;

  const submit = () => {
    if (!canSubmit) return;

    const payload = {
      id: currentIncome?.id ?? `inc-man-${Date.now()}`,
      nombre: form.nombre,
      origin: form.incomeKind === 'empleo' ? form.employer || form.origin : form.origin,
      employer: form.incomeKind === 'empleo' ? form.employer || form.origin : undefined,
      incomeKind: form.incomeKind,
      montoMensual: projection.netMonthly,
      grossAmount: projection.grossPerPayment,
      grossMonthlyAmount: projection.grossMonthly,
      netAmount: projection.netPerPayment,
      netMonthlyAmount: projection.netMonthly,
      totalDeductionsPerPayment: projection.totalDeductionsPerPayment,
      totalDeductionsMonthly: projection.deductionsMonthly,
      deductions,
      fecha: computedNextDate,
      startDate: form.startDate,
      nextDate: computedNextDate,
      descripcion: form.notes,
      notes: form.notes,
      sourceType: 'manual' as const,
      frequency: form.frequency,
      incomeAmount: projection.grossPerPayment,
      incomeStartDate: form.startDate,
      incomeDayOfWeek: form.frequency === 'semanal' ? Number(form.dayOfWeek) : undefined,
      incomeDayOfMonth: ['mensual', 'trimestral', 'anual'].includes(form.frequency) ? Number(form.dayOfMonth) : undefined,
      status: form.status,
      taxCategory: form.taxCategory,
      taxProfile: form.taxProfile,
      isRecurring: form.isRecurring && form.frequency !== 'una_vez'
    };

    if (currentIncome) updateIncome(payload);
    else addIncome(payload);
    router.push('/income');
  };

  const updateDeduction = (id: string, patch: Partial<IncomeDeduction>) => {
    setDeductions((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="create-form-section p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="create-section-title">Wizard profesional de ingresos</p>
              <p className="mt-1 text-xs font-semibold text-[rgba(16,23,13,0.58)]">Captura fuente, bruto, retenciones y neto real para cash flow intelligence.</p>
            </div>
            <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-[rgba(47,61,31,0.10)] bg-white/62 p-1.5">
              {steps.map((label, index) => (
                <button key={label} type="button" onClick={() => setStep(index)} className={cn('rounded-xl px-3 py-2 text-[11px] font-extrabold transition', index === step ? 'bg-[#2F3D1F] text-white shadow-[0_10px_22px_rgba(47,61,31,0.18)]' : index < step ? 'bg-emerald-50 text-emerald-800' : 'text-[rgba(16,23,13,0.54)] hover:bg-white')}>
                  {index + 1}. {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {step === 0 ? (
          <section className="create-form-section animate-in fade-in duration-200">
            <p className="create-section-title">Paso 1 · Selecciona la fuente</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {incomeKinds.map((kind) => (
                <button key={kind} type="button" onClick={() => setForm((state) => ({ ...state, incomeKind: kind, taxProfile: kind === 'empleo' ? 'w2' : kind === 'freelance' ? '1099' : state.taxProfile }))} className={cn('rounded-2xl border p-3 text-left transition-colors transition-shadow', form.incomeKind === kind ? 'border-emerald-400 bg-emerald-50 shadow-[0_14px_28px_rgba(5,150,105,0.12)]' : 'border-[rgba(47,61,31,0.10)] bg-white/70')}>
                  <span className="text-sm font-black text-[#10170D]">{kindLabel[kind]}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-[rgba(16,23,13,0.54)]">{kind === 'empleo' ? 'Payroll con retenciones' : kind === 'ingreso_pasivo' ? 'Flujo de activos o inversiones' : 'Fuente configurable'}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="create-form-section animate-in fade-in duration-200">
            <p className="create-section-title">Paso 2 · Detalle financiero</p>
            <div className="create-field-grid mt-4">
              <FormField label="Nombre" value={form.nombre} onChange={(v) => setForm((s) => ({ ...s, nombre: v }))} required />
              {form.incomeKind === 'empleo' ? <FormField label="Empresa" value={form.employer} onChange={(v) => setForm((s) => ({ ...s, employer: v, origin: v }))} required /> : <FormField label="Origen" value={form.origin} onChange={(v) => setForm((s) => ({ ...s, origin: v }))} required />}
              <FormSelect label="Frecuencia" value={form.frequency} onChange={(v) => setForm((s) => ({ ...s, frequency: v as IncomeFrequency, isRecurring: v !== 'una_vez' }))} options={frequencyOptions} getLabel={(value) => frequencyLabel[value as IncomeFrequency]} />
              <FormField label={form.incomeKind === 'empleo' ? 'Bruto por pago' : 'Monto bruto'} type="number" value={String(form.grossAmount)} onChange={(v) => setForm((s) => ({ ...s, grossAmount: Number(v) }))} required />
              <FormField label="Fecha inicio" type="date" value={form.startDate} onChange={(v) => setForm((s) => ({ ...s, startDate: v, nextDate: '' }))} required />
              <FormField label="Próxima fecha" type="date" value={computedNextDate} onChange={(v) => setForm((s) => ({ ...s, nextDate: v }))} required />
              {form.frequency === 'semanal' ? <FormField label="Día semana (0-6)" type="number" value={String(form.dayOfWeek)} onChange={(v) => setForm((s) => ({ ...s, dayOfWeek: Number(v), nextDate: '' }))} /> : null}
              {['mensual', 'trimestral', 'anual'].includes(form.frequency) ? <FormField label="Día del mes" type="number" value={String(form.dayOfMonth)} onChange={(v) => setForm((s) => ({ ...s, dayOfMonth: Number(v), nextDate: '' }))} /> : null}
              <FormSelect label="Estado" value={form.status} onChange={(v) => setForm((s) => ({ ...s, status: v as IncomeStatus }))} options={statuses} getLabel={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
              <FormSelect label="Perfil fiscal" value={form.taxProfile} onChange={(v) => setForm((s) => ({ ...s, taxProfile: v as IncomeTaxProfile }))} options={taxProfiles} getLabel={(value) => taxProfileLabel[value as IncomeTaxProfile]} />
              <FormField label="Categoría fiscal opcional" value={form.taxCategory} onChange={(v) => setForm((s) => ({ ...s, taxCategory: v }))} />
              <FormField label="Notas" value={form.notes} onChange={(v) => setForm((s) => ({ ...s, notes: v }))} />
            </div>
            <label className="create-toggle-card mt-4" data-checked={form.isRecurring}>
              <span className="flex min-w-0 items-center gap-3"><span className="create-toggle-icon">↻</span><span><span className="block text-sm font-extrabold text-[#10170D]">Ingreso recurrente</span><span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Recalcula equivalentes mensuales y genera vencimientos en calendario.</span></span></span>
              <input className="sr-only" type="checkbox" checked={form.isRecurring} disabled={form.frequency === 'una_vez'} onChange={(event) => setForm((s) => ({ ...s, isRecurring: event.target.checked }))} />
              <span className="create-switch" aria-hidden />
            </label>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="create-form-section animate-in fade-in duration-200">
            <p className="create-section-title">Paso 3 · Retenciones y descuentos</p>
            <div className="mt-4 space-y-2">
              {deductions.map((deduction) => (
                <div key={deduction.id} className="grid gap-2 rounded-2xl border border-[rgba(47,61,31,0.10)] bg-white/66 p-3 md:grid-cols-[minmax(160px,1fr)_150px_140px] md:items-center">
                  <p className="text-sm font-extrabold text-[#10170D]">{deduction.label}</p>
                  <select value={deduction.mode} onChange={(event) => updateDeduction(deduction.id, { mode: event.target.value as IncomeDeduction['mode'] })} className="ds-select-control">
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto_fijo">Monto fijo</option>
                  </select>
                  <input type="number" value={String(deduction.value)} onChange={(event) => updateDeduction(deduction.id, { value: Number(event.target.value) })} className="ds-input-control" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="create-form-section animate-in fade-in duration-200">
            <p className="create-section-title">Paso 4 · Resumen inteligente</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryBlock label="Bruto estimado" value={money(projection.grossMonthly)} />
              <SummaryBlock label="Total retenido" value={money(projection.deductionsMonthly)} />
              <SummaryBlock label="Neto estimado" value={money(projection.netMonthly)} tone="income" />
              <SummaryBlock label="Próxima fecha" value={computedNextDate || '—'} />
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-50/80 p-4">
              <p className="text-sm font-black text-emerald-900">Efecto en cash flow real</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-950/68">Capital Console usará el ingreso neto mensual de {money(projection.netMonthly)} para dashboard, reportes, libertad financiera y calendario. El bruto mensual se conserva para análisis fiscal.</p>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" className="ds-btn-secondary w-auto px-5" onClick={() => (step === 0 ? router.back() : setStep((value) => Math.max(0, value - 1)))}>{step === 0 ? 'Volver' : 'Anterior'}</button>
          <div className="flex gap-2">
            {step < steps.length - 1 ? <button type="button" className="ds-btn-primary w-auto px-5" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Continuar</button> : null}
            <button type="button" className="ds-btn-primary w-auto px-5" onClick={submit} disabled={!canSubmit}>{currentIncome ? 'Guardar ingreso' : 'Crear ingreso'}</button>
          </div>
        </div>
      </div>

      <CreateImpactPanel
        eyebrow="Cash flow intelligence"
        description="Resumen lateral sticky con bruto, retenciones, neto y fecha de impacto. El cash flow real se calcula con neto."
        metrics={[
          { label: 'Ingreso bruto mensual', value: money(projection.grossMonthly), helper: frequencyLabel[form.frequency] },
          { label: 'Retenciones mensuales', value: money(projection.deductionsMonthly), helper: `${retentionRate.toFixed(1)}% por pago` },
          { label: 'Ingreso neto mensual', value: money(projection.netMonthly), helper: 'Base real de cash flow' },
          { label: 'Próximo pago', value: computedNextDate || '—', helper: form.isRecurring ? 'Recurrente' : 'Único' }
        ]}
      >
        <div className="space-y-2 rounded-2xl border border-[rgba(47,61,31,0.10)] bg-white/58 p-3 text-xs font-semibold text-[rgba(16,23,13,0.62)]">
          <p className="font-extrabold text-[#10170D]">{kindLabel[form.incomeKind]}</p>
          <p>Origen: {form.incomeKind === 'empleo' ? form.employer || '—' : form.origin || '—'}</p>
          <p>Estado: {form.status}</p>
        </div>
      </CreateImpactPanel>
    </div>
  );
}

function SummaryBlock({ label, value, tone }: { label: string; value: string; tone?: 'income' }) {
  return (
    <div className="rounded-2xl border border-[rgba(47,61,31,0.10)] bg-white/70 p-3">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[rgba(47,61,31,0.50)]">{label}</p>
      <p className={cn('mt-1 text-lg font-black tracking-[-0.02em]', tone === 'income' ? 'text-emerald-700' : 'text-[#10170D]')}>{value}</p>
    </div>
  );
}
