'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';
import { useCapitalStore } from '@/store/useCapitalStore';
import type { LiabilityDebtClass, LiabilityPaymentFrequency, LiabilityType } from '@/types/liabilities';
import { useLanguage } from '@/providers/LanguageProvider';
import { FormField, FormSelect } from './FormControls';

const types: LiabilityType[] = ['Tarjeta de crédito', 'Préstamo', 'Hipoteca', 'Leasing', 'Impuesto'];
const paymentFrequencies: LiabilityPaymentFrequency[] = ['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'];
const debtClasses: LiabilityDebtClass[] = ['deuda_buena', 'deuda_mala', 'deuda_neutral'];
const debtClassLabel: Record<LiabilityDebtClass, string> = { deuda_buena: 'Deuda buena', deuda_mala: 'Deuda mala', deuda_neutral: 'Deuda neutral' };
const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export function LiabilityForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addLiability = useCapitalStore((state) => state.addLiability);
  const updateLiability = useCapitalStore((state) => state.updateLiability);
  const assets = useCapitalStore((state) => state.assets);
  const currentLiability = useCapitalStore((state) => state.liabilities.find((item) => item.id === editId));
  const { t } = useLanguage();
  const [form, setForm] = useState({
    nombre: currentLiability?.nombre ?? '',
    tipo: currentLiability?.tipo ?? ('Préstamo' as LiabilityType),
    saldoActual: currentLiability?.saldoActual ?? 0,
    pagoMensual: currentLiability?.pagoMensual ?? 0,
    frecuenciaPago: currentLiability?.frecuenciaPago ?? ('mensual' as LiabilityPaymentFrequency),
    proximaFechaPago: currentLiability?.proximaFechaPago ?? '',
    generaGasto: currentLiability?.generaGasto ?? true,
    linkedAssetId: currentLiability?.linkedAssetId ?? '',
    debtClass: currentLiability?.debtClass ?? ('deuda_neutral' as LiabilityDebtClass)
  });

  const canSubmit = Boolean(form.tipo && form.nombre && Number(form.saldoActual) > 0 && form.proximaFechaPago);

  const submit = () => {
    if (!canSubmit) return;

    const payload = {
      id: currentLiability?.id ?? `lib-${Date.now()}`,
      ...form,
      saldoActual: Number(form.saldoActual),
      pagoMensual: Number(form.pagoMensual),
      linkedAssetId: form.linkedAssetId || null,
      gastoRelacionadoId: form.generaGasto ? currentLiability?.gastoRelacionadoId ?? `exp-${Date.now()}` : undefined
    };
    if (currentLiability) updateLiability(payload);
    else addLiability(payload);
    router.push('/liabilities');
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="create-form-section">
          <p className="create-section-title">Información principal</p>
          <div className="create-field-grid mt-4">
            <FormField label="Nombre" value={form.nombre} onChange={(v) => setForm((s) => ({ ...s, nombre: v }))} required />
            <FormSelect label="Tipo" value={form.tipo} onChange={(v) => setForm((s) => ({ ...s, tipo: v as LiabilityType }))} options={types} />
            <FormField label="Saldo" type="number" value={String(form.saldoActual)} onChange={(v) => setForm((s) => ({ ...s, saldoActual: Number(v) }))} required />
            <FormField label="Pago mensual" type="number" value={String(form.pagoMensual)} onChange={(v) => setForm((s) => ({ ...s, pagoMensual: Number(v) }))} required />
            <FormSelect label="Clasificación deuda" value={form.debtClass} onChange={(v) => setForm((s) => ({ ...s, debtClass: v as LiabilityDebtClass }))} options={debtClasses} getLabel={(value) => debtClassLabel[value as LiabilityDebtClass]} />
          </div>
        </section>

        <section className="create-form-section space-y-4">
          <p className="create-section-title">Recurrencia y vinculación</p>
          <div className="create-field-grid">
            <FormField label="Próxima fecha pago" type="date" value={form.proximaFechaPago} onChange={(v) => setForm((s) => ({ ...s, proximaFechaPago: v }))} required />
            <FormSelect label="Frecuencia de pago" value={form.frecuenciaPago} onChange={(v) => setForm((s) => ({ ...s, frecuenciaPago: v as LiabilityPaymentFrequency }))} options={paymentFrequencies} />
            <FormSelect label="Activo vinculado (opcional)" value={form.linkedAssetId} onChange={(v) => setForm((s) => ({ ...s, linkedAssetId: v }))} options={['', ...assets.map((item) => item.id)]} getLabel={(value) => (value ? assets.find((item) => item.id === value)?.nombre ?? value : 'Sin vínculo')} />
          </div>
          <label className="create-toggle-card" data-checked={form.generaGasto}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="create-toggle-icon">−</span>
              <span>
                <span className="block text-sm font-extrabold text-[#10170D]">{t('form.generatesExpense')}</span>
                <span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Crea impacto mensual derivado en gastos y calendario.</span>
              </span>
            </span>
            <input className="sr-only" type="checkbox" checked={form.generaGasto} onChange={(e) => setForm((s) => ({ ...s, generaGasto: e.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>
        </section>
      </div>

      <CreateImpactPanel
        eyebrow="Impacto del pasivo"
        description="Visualiza deuda total e impacto mensual antes de registrar la obligación financiera."
        metrics={[
          { label: 'Deuda total', value: money(Number(form.saldoActual)), helper: form.tipo },
          { label: 'Impacto mensual', value: `-${money(Number(form.pagoMensual))}`, helper: form.generaGasto ? 'Se reflejará como gasto derivado.' : 'Sin gasto derivado activo.' }
        ]}
      >
        <div className="flex gap-2">
          <button type="button" className="ds-btn-secondary w-full" onClick={() => router.back()}>Volver</button>
          <button type="button" className="ds-btn-primary w-full" onClick={submit} disabled={!canSubmit}>{currentLiability ? 'Guardar' : 'Crear'}</button>
        </div>
      </CreateImpactPanel>
    </div>
  );
}
