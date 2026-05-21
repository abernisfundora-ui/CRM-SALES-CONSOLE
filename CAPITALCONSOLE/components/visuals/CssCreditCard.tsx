export function CssCreditCard() {
  return (
    <div className="relative h-14 w-24 rounded-xl border border-rose-200/25 bg-gradient-to-br from-rose-400/30 via-rose-500/25 to-rose-700/35 shadow-[0_10px_30px_rgba(244,63,94,0.25)]">
      <div className="absolute left-3 top-3 h-2 w-8 rounded bg-white/60" />
      <div className="absolute left-3 top-7 h-1.5 w-12 rounded bg-white/30" />
      <div className="absolute right-3 top-3 h-6 w-6 rounded-full border border-white/35 bg-white/10" />
    </div>
  );
}
