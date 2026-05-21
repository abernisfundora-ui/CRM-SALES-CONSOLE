const events = [
  'Lead Maria Gomez moved to Proposal',
  'Meeting confirmed with Acme Group',
  'Follow-up task due at 17:30'
];

export function ActivityFeed() {
  return (
    <section className="glass-card p-5">
      <p className="subtle-label mb-3">Recent activity</p>
      <ul className="space-y-3 text-sm text-slate-200">
        {events.map((event) => (
          <li key={event} className="rounded-lg bg-surface-1 px-3 py-2">
            {event}
          </li>
        ))}
      </ul>
    </section>
  );
}
