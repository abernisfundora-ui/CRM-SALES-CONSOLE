'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateImpactPanel } from '@/components/create/CreateImpactPanel';
import { useCapitalStore } from '@/store/useCapitalStore';
import type { CalendarEventType, ReminderOption } from '@/types/calendar';
import { FormField, FormSelect } from './FormControls';

const eventTypes: CalendarEventType[] = ['ingreso', 'gasto', 'recordatorio', 'evento_financiero'];
const reminderOptions: ReminderOption[] = ['none', '10m', '30m', '1h', '1d'];

const reminderLabels: Record<ReminderOption, string> = {
  none: 'Sin recordatorio',
  '10m': '10 minutos antes',
  '30m': '30 minutos antes',
  '1h': '1 hora antes',
  '1d': '1 día antes'
};

const eventTypeLabels: Record<CalendarEventType, string> = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
  recordatorio: 'Recordatorio',
  evento_financiero: 'Evento financiero'
};

const money = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

function toDateAndTime(isoDateTime?: string, fallbackDate = '') {
  if (!isoDateTime) return { date: fallbackDate, time: '09:00' };
  const [datePart, timePart] = isoDateTime.split('T');
  return { date: datePart ?? fallbackDate, time: (timePart ?? '09:00:00').slice(0, 5) };
}

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T00:00:00.000Z`);
  if (!dateValue || Number.isNaN(target.getTime())) return null;
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

async function syncCalendarEvent(method: 'POST' | 'PUT', payload: { id: string; title: string; description?: string; startDateTime: string; endDateTime?: string; reminderConfig: ReminderOption; allDay: boolean; }) {
  const endpoint = method === 'POST' ? '/api/google-calendar/events' : `/api/google-calendar/events/${payload.id}`;
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('No se pudo sincronizar con Google Calendar');
  }

  return response.json() as Promise<{ eventId: string }>;
}

export function EventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const addEvent = useCapitalStore((state) => state.addEvent);
  const updateEvent = useCapitalStore((state) => state.updateEvent);
  const manualEvents = useCapitalStore((state) => state.manualEvents);
  const currentEvent = useCapitalStore((state) => state.manualEvents.find((item) => item.id === editId));
  const { date: initialDate, time: initialTime } = useMemo(
    () => toDateAndTime(currentEvent?.startDateTime, currentEvent?.date ?? ''),
    [currentEvent?.date, currentEvent?.startDateTime]
  );

  const [form, setForm] = useState({
    title: currentEvent?.title ?? '',
    date: initialDate,
    time: initialTime,
    description: currentEvent?.description ?? '',
    type: currentEvent?.type ?? ('recordatorio' as CalendarEventType),
    amount: currentEvent?.amount ?? 0,
    allDay: currentEvent?.allDay ?? false,
    reminderConfig: currentEvent?.reminderConfig ?? ('none' as ReminderOption),
    syncToGoogleCalendar: currentEvent?.syncToGoogleCalendar ?? false,
    hasFinancialImpact: Boolean(currentEvent?.amount)
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = Boolean(form.type && form.title && form.date && !isSaving);
  const upcomingCount = manualEvents.filter((event) => {
    const days = daysUntil(event.date);
    return days !== null && days >= 0 && days <= 30;
  }).length + (currentEvent ? 0 : 1);
  const days = daysUntil(form.date);

  const submit = async () => {
    if (!canSubmit) return;
    setError('');
    setIsSaving(true);

    try {
      const startDateTime = form.allDay
        ? `${form.date}T00:00:00.000Z`
        : `${form.date}T${form.time || '09:00'}:00.000Z`;
      const payload = {
        id: currentEvent?.id ?? `cal-man-${Date.now()}`,
        title: form.title,
        date: form.date,
        description: form.description,
        amount: form.hasFinancialImpact ? Number(form.amount) : undefined,
        type: form.type,
        source: 'manual' as const,
        sourceType: 'manual' as const,
        allDay: form.allDay,
        startDateTime,
        editable: true,
        deletable: true,
        syncToGoogleCalendar: form.syncToGoogleCalendar,
        reminderConfig: form.reminderConfig,
        googleCalendarStatus: form.syncToGoogleCalendar ? ('pending' as const) : ('none' as const)
      };

      if (currentEvent) updateEvent(payload);
      else addEvent(payload);

      if (form.syncToGoogleCalendar) {
        const syncResult = await syncCalendarEvent(currentEvent ? 'PUT' : 'POST', {
          id: payload.id,
          title: payload.title,
          description: payload.description,
          allDay: payload.allDay,
          startDateTime: payload.startDateTime,
          reminderConfig: payload.reminderConfig
        });

        updateEvent({
          ...payload,
          googleCalendarEventId: syncResult.eventId,
          googleCalendarStatus: 'synced',
          sourceType: 'google-synced'
        });
      }

      router.push('/calendar');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el evento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="create-form-section">
          <p className="create-section-title">Información principal</p>
          <div className="create-field-grid mt-4">
            <FormSelect label="Tipo" value={form.type} onChange={(v) => setForm((s) => ({ ...s, type: v as CalendarEventType }))} options={eventTypes} getLabel={(value) => eventTypeLabels[value as CalendarEventType]} />
            <FormField label="Título" value={form.title} onChange={(v) => setForm((s) => ({ ...s, title: v }))} required />
            <FormField label="Fecha" type="date" value={form.date} onChange={(v) => setForm((s) => ({ ...s, date: v }))} required />
            {!form.allDay ? <FormField label="Hora" type="time" value={form.time} onChange={(v) => setForm((s) => ({ ...s, time: v }))} required /> : null}
            <FormField label="Descripción" value={form.description} onChange={(v) => setForm((s) => ({ ...s, description: v }))} />
          </div>
        </section>

        <section className="create-form-section space-y-4">
          <p className="create-section-title">Recordatorio y sincronización</p>
          <div className="create-field-grid">
            <FormSelect label="Recordatorio" value={form.reminderConfig} onChange={(v) => setForm((s) => ({ ...s, reminderConfig: v as ReminderOption }))} options={reminderOptions} getLabel={(option) => reminderLabels[option as ReminderOption]} />
            {form.hasFinancialImpact ? <FormField label="Monto opcional" type="number" value={String(form.amount)} onChange={(v) => setForm((s) => ({ ...s, amount: Number(v) }))} /> : null}
          </div>

          <label className="create-toggle-card" data-checked={form.allDay}>
            <span className="flex min-w-0 items-center gap-3"><span className="create-toggle-icon">◷</span><span><span className="block text-sm font-extrabold text-[#10170D]">Evento de todo el día</span><span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Oculta la hora y agenda el evento completo.</span></span></span>
            <input className="sr-only" type="checkbox" checked={form.allDay} onChange={(event) => setForm((s) => ({ ...s, allDay: event.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>

          <label className="create-toggle-card" data-checked={form.hasFinancialImpact}>
            <span className="flex min-w-0 items-center gap-3"><span className="create-toggle-icon">$</span><span><span className="block text-sm font-extrabold text-[#10170D]">Impacto financiero</span><span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Agrega un monto opcional al evento o recordatorio.</span></span></span>
            <input className="sr-only" type="checkbox" checked={form.hasFinancialImpact} onChange={(event) => setForm((s) => ({ ...s, hasFinancialImpact: event.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>

          <label className="create-toggle-card" data-checked={form.syncToGoogleCalendar}>
            <span className="flex min-w-0 items-center gap-3"><span className="create-toggle-icon">G</span><span><span className="block text-sm font-extrabold text-[#10170D]">Sincronizar con Google Calendar</span><span className="block text-xs font-medium text-[rgba(16,23,13,0.58)]">Crea o actualiza el evento en la integración mock.</span></span></span>
            <input className="sr-only" type="checkbox" checked={form.syncToGoogleCalendar} onChange={(event) => setForm((s) => ({ ...s, syncToGoogleCalendar: event.target.checked }))} />
            <span className="create-switch" aria-hidden />
          </label>
          {error ? <p className="create-error">{error}</p> : null}
        </section>
      </div>

      <CreateImpactPanel
        eyebrow="Impacto en calendario"
        description="Resume cuándo aparecerá el evento y cómo suma próximos movimientos visibles."
        metrics={[
          { label: 'Impacto en calendario', value: days === null ? 'Sin fecha' : days <= 0 ? 'Hoy' : `${days} día${days === 1 ? '' : 's'}`, helper: eventTypeLabels[form.type] },
          { label: 'Próximos movimientos', value: String(upcomingCount), helper: form.hasFinancialImpact ? `Monto: ${money(Number(form.amount))}` : 'Sin monto financiero.' }
        ]}
      >
        <div className="flex gap-2">
          <button type="button" className="ds-btn-secondary w-full" onClick={() => router.back()}>Volver</button>
          <button type="button" className="ds-btn-primary w-full" onClick={() => void submit()} disabled={!canSubmit}>{isSaving ? 'Guardando…' : currentEvent ? 'Guardar' : 'Crear'}</button>
        </div>
      </CreateImpactPanel>
    </div>
  );
}
