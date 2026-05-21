import { EmptyState } from '@/components/ui/EmptyState';

export default function CalendarPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <section>
        <h2>Calendar</h2>
        <p className="text-sm text-slate-400">Unified schedule view by role permissions.</p>
      </section>
      <EmptyState title="No events for selected date" description="Your meetings, follow-ups and recruiting interviews will appear here." />
    </div>
  );
}
