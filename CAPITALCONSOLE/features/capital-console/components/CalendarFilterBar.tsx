'use client';

import type { CalendarEventType } from '@/types/calendar';
import { cn } from '@/lib/cn';

type CalendarFilterBarProps = {
  typeFilter: CalendarEventType | 'all';
  onTypeChange: (type: CalendarEventType | 'all') => void;
  query: string;
  onQueryChange: (query: string) => void;
};

const filters: Array<{ id: CalendarEventType | 'all'; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'ingreso', label: 'Ingreso' },
  { id: 'gasto', label: 'Gasto' },
  { id: 'recordatorio', label: 'Recordatorio' },
  { id: 'evento_financiero', label: 'Evento' }
];

export function CalendarFilterBar({ typeFilter, onTypeChange, query, onQueryChange }: CalendarFilterBarProps) {
  return (
    <section className="space-y-2.5">
      <label className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full bg-transparent text-sm text-ds-text placeholder:text-ds-inactive focus:outline-none"
          placeholder="Buscar evento, nota o descripción"
        />
      </label>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((filter) => {
          const active = typeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onTypeChange(filter.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition',
                active ? 'border-module-calendar/40 bg-module-calendar/15 text-module-calendar' : 'border-white/10 text-ds-inactive'
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
