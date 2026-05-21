import type { ReactNode } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { cn } from '@/lib/cn';

type SummaryTone = 'asset' | 'income' | 'expense' | 'liability' | 'goal' | 'neutral';

type SummaryPanelProps = {
  eyebrow: string;
  value: string;
  description?: string;
  tone?: SummaryTone;
  children?: ReactNode;
  className?: string;
};

const toneClass: Record<SummaryTone, string> = {
  asset: 'summary-panel--asset',
  income: 'summary-panel--income',
  expense: 'summary-panel--expense',
  liability: 'summary-panel--liability',
  goal: 'summary-panel--goal',
  neutral: 'summary-panel--neutral'
};

export function SummaryPanel({ eyebrow, value, description, tone = 'neutral', children, className }: SummaryPanelProps) {
  return (
    <AppCard className={cn('summary-panel', toneClass[tone], className)}>
      <div className="summary-panel__header">
        <div className="min-w-0">
          <p className="summary-panel__eyebrow">{eyebrow}</p>
          <p className="summary-panel__value">{value}</p>
        </div>
        {description ? <p className="summary-panel__description">{description}</p> : null}
      </div>
      {children ? <div className="summary-panel__grid">{children}</div> : null}
    </AppCard>
  );
}

export function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-metric">
      <p className="summary-metric__label">{label}</p>
      <p className="summary-metric__value">{value}</p>
    </div>
  );
}
