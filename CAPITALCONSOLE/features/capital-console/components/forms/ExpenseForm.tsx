'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';
import { useCapitalStore } from '@/store/useCapitalStore';
import type { ExpenseFrequency, ExpenseType } from '@/types/expenses';
import { monthlyFromExpense } from '@/lib/finance/frequency';
import { FormField, FormSelect } from './FormControls';

const frequencies: ExpenseFrequency[] = ['una_vez', 'semanal', 'quincenal', 'mensual', 'trimestral', 'anual'];
const types: ExpenseType[] = ['fijo', 'variable'];
const frequencyLabel: Record<ExpenseFrequency, string> = {
  una_vez: 'Una vez',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual'
};

const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export function ExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addExpense = useCapitalStore((state) => state.addExpense);
  const updateExpense = useCapitalStore((state) => state.updateExpense);
  const incomes = useCapitalStore((state) => state.incomes);
  const currentExpense = useCapitalStore((state) => state.manualExpenses.find((item) => item.id === editId));
  const [form, setForm] = useState({
    nombre: currentExpense?.nombre ?? '',
    monto: currentExpense?.monto ?? 0,
    fecha: currentExpense?.fecha ?? '',
    frecuencia: currentExpense?.frecuencia ?? ('mensual' as ExpenseFrequency),
    tipo: currentExpense?.tipo ?? ('fijo' as ExpenseType),
    descripcion: currentExpense?.descripcion ?? '',
    recurrente: currentExpense?.frecuencia !== 'una_vez',
    hasFinancialImpact: true
  });

  const monthlyExpense = useMemo(() => monthlyFromExpense(Number(form.monto), form.frecuencia), [form.frecuencia, form.monto]);
  const totalIncome = incomes.reduce((acc, income) => acc + (income.montoMensual || 0), 0);
  const freedomReduction = totalIncome > 0 ? (monthlyExpense / totalIncome) * 100 : 0;
  const canSubmit = Boolean(form.tipo && form.nombre && Number(form.monto) > 0 && form.fecha);

  const submit = () => {
    if (!canSubmit) return;

    const payload = {
      id: currentExpense?.id ?? `exp-man-${Date.now()}`,
      ...form,
      monto: Number(form.monto),
      montoMensual: monthlyExpense,
      originType: 'manual' as const
    };
    if (currentExpense) updateExpense(payload);
    else addExpense(payload);
    router.push('/expenses');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="create-form-section">
          <p className="create-section-title">Información principal</p>
          <div className="create-field-grid mt-4">
            <FormField label="Nombre" value={form.nombre} onChange={(v) => setForm((s) => ({ ...s, nombre: v }))} required />
            <FormSelect label="Categoría" value={form.tipo} onChange={(v) => setForm((s) => ({ ...s, tipo: v as ExpenseType }))} options={types} />
            <FormField label="Monto" type="number" value={String(form.monto)} onChange={(v) => setForm((s) => ({ ...s, monto: Number(v) }))} required />
            <FormField label="Fecha" type="date" value={form.fecha} onChange={(v) => setForm((s) => ({ ...s, fecha: v }))} required />
            <FormField label="Descripción" value={form.descripcion} onChange={(v) => setForm((s) => ({ ...s, descripcion: v }))} />
          </div>
        </section>

        <section className="create-form-section space-y-4">
          <p className="create-section-title">Recurrencia e impacto</p>
          <label className="create-toggle-card" data-checked={form.recurrente}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="create-toggle-icon">↺</span>
              <span>
                <span className="block text-sm font-extrabold text-[#10170D]">Gasto recurrente</span>
                <span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Úsalo para gastos que afectan tu cash flow cada periodo.</span>
              </span>
            </span>
            <input className="sr-only" type="checkbox" checked={form.recurrente} onChange={(event) => setForm((s) => ({ ...s, recurrente: event.target.checked, frecuencia: event.target.checked ? s.frecuencia : 'una_vez' }))} />
            <span className="create-switch" aria-hidden />
          </label>

          <div className="create-field-grid">
            <FormSelect label="Frecuencia" value={form.frecuencia} onChange={(v) => setForm((s) => ({ ...s, frecuencia: v as ExpenseFrequency, recurrente: v !== 'una_vez' }))} options={frequencies} getLabel={(value) => frequencyLabel[value as ExpenseFrequency]} />
          </div>

          <label className="create-toggle-card" data-checked={form.hasFinancialImpact}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="create-toggle-icon">−</span>
              <span>
                <span className="block text-sm font-extrabold text-[#10170D]">Impacto financiero</span>
                <span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Mostrar este gasto como reducción directa del flujo mensual.</span>
              </span>
            </span>
            <input className="sr-only" type="checkbox" checked={form.hasFinancialImpact} onChange={(event) => setForm((s) => ({ ...s, hasFinancialImpact: event.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>
        </section>
      </div>

      <CreateImpactPanel
        eyebrow="Impacto del gasto"
        description="Evalúa la salida mensual antes de guardar y cómo reduce tu margen de libertad financiera."
        metrics={[
          { label: 'Impacto negativo en cash flow', value: `-${money(monthlyExpense)}`, helper: frequencyLabel[form.frecuencia] },
          { label: 'Reducción de libertad financiera', value: `${freedomReduction.toFixed(1)}%`, helper: totalIncome > 0 ? 'Sobre ingresos mensuales actuales.' : 'Agrega ingresos para estimarlo mejor.' }
        ]}
      >
        <div className="flex gap-2">
          <button type="button" className="ds-btn-secondary w-full" onClick={() => router.back()}>Volver</button>
          <button type="button" className="ds-btn-primary w-full" onClick={submit} disabled={!canSubmit}>{currentExpense ? 'Guardar' : 'Crear'}</button>
        </div>
      </CreateImpactPanel>
    </div>
  );
}
