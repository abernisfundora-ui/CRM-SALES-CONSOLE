'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';
import { useCapitalStore } from '@/store/useCapitalStore';
import { FormField } from './FormControls';

const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function monthsUntil(dateValue: string) {
  const target = new Date(`${dateValue}T00:00:00.000Z`);
  if (!dateValue || Number.isNaN(target.getTime())) return 0;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
}

export function GoalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addGoal = useCapitalStore((state) => state.addGoal);
  const updateGoal = useCapitalStore((state) => state.updateGoal);
  const currentGoal = useCapitalStore((state) => state.goals.find((item) => item.id === editId));
  const [form, setForm] = useState({
    nombre: currentGoal?.nombre ?? '',
    objetivo: currentGoal?.objetivo ?? 0,
    actual: currentGoal?.actual ?? 0,
    fechaObjetivo: currentGoal?.fechaObjetivo ?? '',
    descripcion: currentGoal?.descripcion ?? '',
    remindInCalendar: true
  });

  const progress = Number(form.objetivo) > 0 ? Math.min(100, (Number(form.actual) / Number(form.objetivo)) * 100) : 0;
  const remaining = Math.max(0, Number(form.objetivo) - Number(form.actual));
  const months = useMemo(() => monthsUntil(form.fechaObjetivo), [form.fechaObjetivo]);
  const monthlyNeeded = months > 0 ? remaining / months : remaining;
  const canSubmit = Boolean(form.nombre && Number(form.objetivo) > 0 && form.fechaObjetivo);

  const submit = () => {
    if (!canSubmit) return;

    const payload = {
      id: currentGoal?.id ?? `goal-${Date.now()}`,
      nombre: form.nombre,
      objetivo: Number(form.objetivo),
      actual: Number(form.actual),
      fechaObjetivo: form.fechaObjetivo,
      descripcion: form.descripcion
    };
    if (currentGoal) updateGoal(payload);
    else addGoal(payload);
    router.push('/');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="create-form-section">
          <p className="create-section-title">Meta financiera</p>
          <p className="mt-2 text-sm text-[rgba(16,23,13,0.60)]">Define el objetivo, progreso actual y fecha esperada para darle seguimiento.</p>
          <div className="create-field-grid mt-4">
            <FormField label="Nombre" value={form.nombre} onChange={(v) => setForm((s) => ({ ...s, nombre: v }))} required />
            <FormField label="Fecha" type="date" value={form.fechaObjetivo} onChange={(v) => setForm((s) => ({ ...s, fechaObjetivo: v }))} required />
            <FormField label="Objetivo" type="number" value={String(form.objetivo)} onChange={(v) => setForm((s) => ({ ...s, objetivo: Number(v) }))} required />
            <FormField label="Actual" type="number" value={String(form.actual)} onChange={(v) => setForm((s) => ({ ...s, actual: Number(v) }))} required />
            <FormField label="Descripción" value={form.descripcion} onChange={(v) => setForm((s) => ({ ...s, descripcion: v }))} />
          </div>
        </section>

        <section className="create-form-section space-y-4">
          <p className="create-section-title">Seguimiento inteligente</p>
          <label className="create-toggle-card" data-checked={form.remindInCalendar}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="create-toggle-icon">◎</span>
              <span>
                <span className="block text-sm font-extrabold text-[#10170D]">Recordatorio de meta</span>
                <span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Mantén visible esta meta en tu planeación financiera.</span>
              </span>
            </span>
            <input className="sr-only" type="checkbox" checked={form.remindInCalendar} onChange={(event) => setForm((s) => ({ ...s, remindInCalendar: event.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>
        </section>
      </div>

      <CreateImpactPanel
        eyebrow="Impacto de la meta"
        description="Calcula avance y aporte necesario para llegar al objetivo con mayor claridad."
        metrics={[
          { label: 'Progreso', value: `${progress.toFixed(1)}%`, helper: `${money(Number(form.actual))} de ${money(Number(form.objetivo))}` },
          { label: 'Aporte necesario mensual', value: money(monthlyNeeded), helper: months > 0 ? `${months} mes${months === 1 ? '' : 'es'} restantes.` : 'Define una fecha futura para estimar meses.' }
        ]}
      >
        <div className="flex gap-2">
          <button type="button" className="ds-btn-secondary w-full" onClick={() => router.back()}>Volver</button>
          <button type="button" className="ds-btn-primary w-full" onClick={submit} disabled={!canSubmit}>{currentGoal ? 'Guardar' : 'Crear'}</button>
        </div>
      </CreateImpactPanel>
    </div>
  );
}
