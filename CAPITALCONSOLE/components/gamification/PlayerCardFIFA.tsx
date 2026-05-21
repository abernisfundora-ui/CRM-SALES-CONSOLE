export function PlayerCardFIFA() {
  return (
    <section className="glass-card overflow-hidden p-5">
      <p className="subtle-label">Agent profile</p>
      <div className="mt-3 grid grid-cols-[80px_1fr] gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 text-2xl font-bold">
          89
        </div>
        <div>
          <h3 className="text-lg font-semibold">Alejandro Ruiz</h3>
          <p className="text-sm text-slate-300">Senior Agent · Gold Tier</p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-2 w-3/4 rounded-full bg-brand-400" />
          </div>
          <p className="mt-1 text-xs text-slate-400">2,450 / 3,000 XP</p>
        </div>
      </div>
    </section>
  );
}
