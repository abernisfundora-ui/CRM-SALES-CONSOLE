import type { ReactNode } from 'react';

type CreateImpactPanelProps = {
  eyebrow: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
  children?: ReactNode;
};

export function CreateImpactPanel({ eyebrow, description, metrics, children }: CreateImpactPanelProps) {
  return (
    <aside className="create-impact-panel lg:sticky lg:top-4 lg:self-start">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/62">{eyebrow}</p>
      <p className="mt-2 text-sm leading-6 text-white/72">{description}</p>
      <div className="mt-5 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="create-impact-metric">
            <p className="text-xs font-semibold text-white/58">{metric.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{metric.value}</p>
            {metric.helper ? <p className="mt-1 text-xs font-medium text-white/52">{metric.helper}</p> : null}
          </div>
        ))}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </aside>
  );
}
