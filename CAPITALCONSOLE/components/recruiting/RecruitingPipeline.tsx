const columns = ['New', 'Interview', 'Hired', 'Rejected'];

export function RecruitingPipeline() {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {columns.map((column) => (
        <div key={column} className="glass-card p-4">
          <p className="mb-3 text-sm font-semibold">{column}</p>
          <div className="rounded-lg bg-surface-1 p-2 text-xs text-slate-300">Drop candidates here</div>
        </div>
      ))}
    </section>
  );
}
