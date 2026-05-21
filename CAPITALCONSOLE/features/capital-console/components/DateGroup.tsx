import type { CalendarItem } from '@/types/calendar';
import { CalendarEventCard } from '@/features/capital-console/components/CalendarEventCard';

type DateGroupProps = {
  date: string;
  events: CalendarItem[];
  onEditEvent?: (event: CalendarItem) => void;
  onDeleteEvent?: (eventId: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });

export function DateGroup({ date, events, onEditEvent, onDeleteEvent }: DateGroupProps) {
  return (
    <section className="space-y-2">
      <div className="sticky top-[4.5rem] z-10 rounded-lg border border-white/10 bg-ds-bg/90 px-2.5 py-1.5 text-xs font-semibold text-ds-muted backdrop-blur">
        {dateFormatter.format(new Date(date))}
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <CalendarEventCard key={event.id} event={event} onEdit={onEditEvent} onDelete={onDeleteEvent} />
        ))}
      </div>
    </section>
  );
}
