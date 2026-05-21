export function CandidateCard() {
  return (
    <article className="glass-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-medium">Camila Ortega</h4>
        <span className="rounded-full bg-brand-500/20 px-2 py-1 text-xs text-brand-200">Interview</span>
      </div>
      <p className="text-sm text-slate-300">3 years in B2B sales · score 87/100</p>
    </article>
  );
}
