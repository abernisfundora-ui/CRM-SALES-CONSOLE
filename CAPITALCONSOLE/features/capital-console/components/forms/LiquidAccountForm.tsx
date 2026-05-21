'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCapitalStore } from '@/store/useCapitalStore';
import type { LiquidAccountStatus, LiquidAccountType } from '@/types/liquidAccounts';
import { FormField, FormSelect } from './FormControls';
import { CreateWizard } from '@/components/create/CreateWizard';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';

const accountTypes: LiquidAccountType[] = ['cash', 'checking', 'savings', 'bank', 'wallet', 'other'];
const accountTypeLabels: Record<LiquidAccountType, string> = {
  cash: 'Efectivo',
  checking: 'Cuenta corriente',
  savings: 'Cuenta de ahorro',
  bank: 'Banco',
  wallet: 'Wallet digital',
  other: 'Otro',
  reserve: 'Reserva'
};
const statusOptions: LiquidAccountStatus[] = ['active', 'inactive'];
const statusLabels: Record<LiquidAccountStatus, string> = { active: 'Activa', inactive: 'Inactiva' };
const steps = ['Tipo de cuenta', 'Datos principales', 'Configuración', 'Confirmación'];
const today = () => new Date().toISOString().slice(0, 10);
const money = (value: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

function isValidDate(value: string) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

export function LiquidAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addLiquidAccount = useCapitalStore((state) => state.addLiquidAccount);
  const updateLiquidAccount = useCapitalStore((state) => state.updateLiquidAccount);
  const current = useCapitalStore((state) => state.liquidAccounts.find((item) => item.id === editId));
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombre: current?.nombre ?? '',
    tipo: current?.tipo === 'reserve' ? 'other' as LiquidAccountType : current?.tipo ?? ('checking' as LiquidAccountType),
    institucion: current?.institucion ?? '',
    saldoActual: String(current?.saldoActual ?? 0),
    moneda: current?.moneda ?? 'USD',
    fechaActualizacion: current?.fechaActualizacion ?? today(),
    estado: current?.estado ?? (current?.incluirEnLiquidez === false ? 'inactive' : 'active' as LiquidAccountStatus),
    notas: current?.notas ?? ''
  });

  const balance = Number(form.saldoActual);
  const isActive = form.estado === 'active';
  const canNext =
    step === 0 ? Boolean(form.tipo) :
    step === 1 ? Boolean(form.nombre.trim()) && form.saldoActual !== '' && Number.isFinite(balance) && balance >= 0 :
    step === 2 ? Boolean(form.moneda.trim()) && isValidDate(form.fechaActualizacion) && Boolean(form.estado) :
    true;

  const impactMetrics = useMemo(() => [
    { label: 'Balance actual', value: money(balance, form.moneda) },
    { label: 'Tipo de cuenta', value: accountTypeLabels[form.tipo] },
    { label: 'Estado', value: statusLabels[form.estado] },
    { label: 'Impacto en efectivo inmediato', value: isActive ? money(balance, form.moneda) : '$0' }
  ], [balance, form.estado, form.moneda, form.tipo, isActive]);

  const submit = () => {
    if (!canNext) return;
    const payload = {
      id: current?.id ?? `liq-${Date.now()}`,
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      institucion: form.institucion.trim() || undefined,
      saldoActual: balance,
      moneda: form.moneda.trim().toUpperCase() || 'USD',
      fechaActualizacion: form.fechaActualizacion,
      estado: form.estado,
      incluirEnLiquidez: isActive,
      notas: form.notas.trim() || undefined
    };
    if (current) updateLiquidAccount(payload);
    else addLiquidAccount(payload);
    router.push('/');
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <CreateWizard
        title={current ? 'Editar cuenta / efectivo / banco' : 'Nueva cuenta / efectivo / banco'}
        steps={steps}
        step={step}
        onPrev={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => (step === steps.length - 1 ? submit() : setStep((s) => s + 1))}
        canNext={canNext}
        isLast={step === steps.length - 1}
        nextLabel={step === steps.length - 1 ? (current ? 'Guardar cambios' : 'Crear cuenta') : 'Continuar'}
      >
        {step === 0 ? <FormSelect label="Tipo de cuenta" value={form.tipo} onChange={(v) => setForm((s) => ({ ...s, tipo: v as LiquidAccountType }))} options={accountTypes} getLabel={(value) => accountTypeLabels[value as LiquidAccountType]} /> : null}
        {step === 1 ? (
          <>
            <FormField label="Nombre de la cuenta" value={form.nombre} onChange={(v) => setForm((s) => ({ ...s, nombre: v }))} required />
            <FormField label="Institución / banco opcional" value={form.institucion} onChange={(v) => setForm((s) => ({ ...s, institucion: v }))} />
            <FormField label="Balance actual" type="number" value={form.saldoActual} onChange={(v) => setForm((s) => ({ ...s, saldoActual: v }))} required />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <FormField label="Moneda" value={form.moneda} onChange={(v) => setForm((s) => ({ ...s, moneda: v.toUpperCase() }))} required />
            <FormField label="Fecha de actualización" type="date" value={form.fechaActualizacion} onChange={(v) => setForm((s) => ({ ...s, fechaActualizacion: v }))} required />
            <FormSelect label="Estado" value={form.estado} onChange={(v) => setForm((s) => ({ ...s, estado: v as LiquidAccountStatus }))} options={statusOptions} getLabel={(value) => statusLabels[value as LiquidAccountStatus]} />
            <FormField label="Notas opcionales" value={form.notas} onChange={(v) => setForm((s) => ({ ...s, notas: v }))} />
          </>
        ) : null}
        {step === 3 ? (
          <div className="create-summary-card">
            <p className="font-semibold text-ds-text">{form.nombre || 'Cuenta sin nombre'}</p>
            <p>Tipo: {accountTypeLabels[form.tipo]}</p>
            <p>Institución: {form.institucion || 'Sin institución'}</p>
            <p>Balance: {money(balance, form.moneda)}</p>
            <p>Actualización: {form.fechaActualizacion}</p>
            <p>Estado: {statusLabels[form.estado]}</p>
          </div>
        ) : null}
      </CreateWizard>

      <CreateImpactPanel eyebrow="Liquidez inmediata" description="Esta cuenta se guarda como liquidez disponible; no crea ingresos, gastos ni cash flow operativo." metrics={impactMetrics}>
        <p className="text-xs leading-5 text-white/62">Las cuentas activas alimentan el KPI de Efectivo inmediato. Las inactivas quedan guardadas, pero no suman al balance disponible.</p>
      </CreateImpactPanel>
    </div>
  );
}
