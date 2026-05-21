import { cn } from '@/lib/cn';

type AssetMetaProgressProps = {
  meta?: number;
  progreso?: number;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function AssetMetaProgress({ meta, progreso }: AssetMetaProgressProps) {
  if (!meta || typeof progreso !== 'number') {
    return null;
  }

  const width = Math.max(0, Math.min(100, progreso));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ds-muted">Meta</span>
        <span className="font-medium text-ds-text">{money.format(meta)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full bg-module-assets transition-all')} style={{ width: `${width}%` }} />
      </div>
      <p className="text-right text-[11px] text-ds-inactive">{width}% completado</p>
    </div>
  );
}
