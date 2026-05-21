export function CssMoneyStack() {
  return (
    <div className="relative h-14 w-full">
      <div className="absolute left-3 top-6 h-6 w-24 rounded-md bg-emerald-700/70" />
      <div className="absolute left-8 top-4 h-6 w-24 rounded-md bg-emerald-600/75" />
      <div className="absolute left-14 top-2 h-6 w-24 rounded-md bg-emerald-500/80" />
      <div className="absolute left-[5.5rem] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-200/80 text-[10px] font-bold text-emerald-900">$</div>
    </div>
  );
}
