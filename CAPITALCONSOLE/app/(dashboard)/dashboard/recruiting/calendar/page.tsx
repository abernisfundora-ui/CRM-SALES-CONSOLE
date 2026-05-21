import { EmptyState } from '@/components/ui/EmptyState';

export default function RecruitingCalendarPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <section>
        <h2>Recruiting Calendar</h2>
        <p className="text-sm text-slate-400">Interview slots, confirmations and interviewer assignments.</p>
      </section>
      <EmptyState title="No interviews scheduled" description="Add candidates to interview stages to populate this calendar." />
    </div>
  );
}
