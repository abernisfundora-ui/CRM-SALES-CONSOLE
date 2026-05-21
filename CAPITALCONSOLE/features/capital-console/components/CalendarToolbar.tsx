'use client';

import type { CalendarPeriod } from '@/types/calendar';
import { cn } from '@/lib/cn';

type CalendarToolbarProps = {
  period: CalendarPeriod;
  onPeriodChange: (period: CalendarPeriod) => void;
};

const periods: CalendarPeriod[] = ['7d', '30d', '90d'];

export function CalendarToolbar({ period, onPeriodChange }: CalendarToolbarProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
      <div className="flex gap-2">
        {periods.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPeriodChange(item)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
              period === item ? 'bg-white text-slate-950' : 'text-ds-inactive'
            )}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}
