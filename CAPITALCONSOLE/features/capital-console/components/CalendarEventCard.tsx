import type { CalendarEventType, CalendarItem } from '@/types/calendar';
import { cn } from '@/lib/cn';

type CalendarEventCardProps = {
  event: CalendarItem;
  onEdit?: (event: CalendarItem) => void;
  onDelete?: (eventId: string) => void;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const typeStyles: Record<CalendarEventType, string> = {
  ingreso: 'border-module-income/35 bg-module-income/10 text-module-income',
  gasto: 'border-module-expenses/35 bg-module-expenses/10 text-module-expenses',
  recordatorio: 'border-module-calendar/35 bg-module-calendar/10 text-module-calendar',
  evento_financiero: 'border-module-assets/35 bg-module-assets/10 text-module-assets'
};

const typeLabels: Record<CalendarEventType, string> = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
  recordatorio: 'Recordatorio',
  evento_financiero: 'Evento financiero'
};

const syncLabel = {
  none: 'Sin sync',
  pending: 'Sync pendiente',
  synced: 'Google synced',
  failed: 'Sync fallido'
} as const;

export function CalendarEventCard({ event, onEdit, onDelete }: CalendarEventCardProps) {
  const canEdit = event.editable ?? event.source === 'manual';
  const canDelete = event.deletable ?? event.source === 'manual';

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ds-text">{event.title}</p>
          {event.description ? <p className="mt-1 text-xs text-ds-muted">{event.description}</p> : null}
        </div>
        <span className={cn('rounded-full border px-2 py-1 text-[11px] font-medium', typeStyles[event.type])}>{typeLabels[event.type]}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="uppercase tracking-[0.08em] text-ds-inactive">{event.source}</span>
        {typeof event.amount === 'number' ? <span className="font-semibold text-ds-text">{money.format(event.amount)}</span> : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-ds-muted">
        {event.reminderConfig && event.reminderConfig !== 'none' ? <span className="rounded-full border border-white/10 px-2 py-1">Rem: {event.reminderConfig}</span> : null}
        {event.syncToGoogleCalendar ? (
          <span className="rounded-full border border-white/10 px-2 py-1">{syncLabel[event.googleCalendarStatus ?? 'none']}</span>
        ) : null}
      </div>
      {canEdit || canDelete ? (
        <div className="mt-2 flex items-center gap-2">
          {canEdit ? (
            <button type="button" onClick={() => onEdit?.(event)} className="ds-btn-secondary w-full">
              Editar
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete?.(event.id)}
              className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 ds-focus"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
