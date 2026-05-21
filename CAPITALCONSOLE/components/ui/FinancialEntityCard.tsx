import Link from 'next/link';
import type { ReactNode } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import { cn } from '@/lib/cn';

export type FinancialCardTone = 'asset' | 'liability' | 'income' | 'expense' | 'neutral';
export type FinancialCardValueTone = 'default' | 'positive' | 'negative' | 'warning';

export type FinancialCardBadge = {
  label: string;
  tone?: FinancialCardTone | FinancialCardValueTone;
};

export type FinancialCardMetaItem = {
  label: string;
  value: string;
  tone?: FinancialCardValueTone;
};

export type FinancialCardAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
};

type FinancialEntityCardProps = {
  tone: FinancialCardTone;
  title: string;
  subtitle?: string;
  badges?: FinancialCardBadge[];
  kpiLabel: string;
  kpiValue: string;
  kpiTone?: FinancialCardValueTone;
  meta?: FinancialCardMetaItem[];
  tags?: FinancialCardBadge[];
  actions?: FinancialCardAction[];
  footer?: ReactNode;
  className?: string;
};

const toneClass: Record<FinancialCardTone, string> = {
  asset: 'financial-card--asset',
  liability: 'financial-card--liability',
  income: 'financial-card--income',
  expense: 'financial-card--expense',
  neutral: 'financial-card--neutral'
};

const valueToneClass: Record<FinancialCardValueTone, string> = {
  default: 'financial-card__value--default',
  positive: 'financial-card__value--positive',
  negative: 'financial-card__value--negative',
  warning: 'financial-card__value--warning'
};

export function FinancialEntityCard({
  tone,
  title,
  subtitle,
  badges = [],
  kpiLabel,
  kpiValue,
  kpiTone = 'default',
  meta = [],
  tags = [],
  actions = [],
  footer,
  className
}: FinancialEntityCardProps) {
  const visibleBadges = badges.slice(0, 2);
  const visibleMeta = meta.slice(0, 4);
  const visibleTags = tags.slice(0, 4);

  return (
    <AppCard className={cn('financial-card', toneClass[tone], className)}>
      <div className="financial-card__header">
        <div className="min-w-0">
          <div className="financial-card__title-row">
            <h3 className="financial-card__title">{title}</h3>
            {visibleBadges.map((badge) => (
              <FinancialCardPill key={`${badge.label}-${badge.tone ?? 'default'}`} badge={badge} />
            ))}
          </div>
          {subtitle ? <p className="financial-card__subtitle">{subtitle}</p> : null}
        </div>

        {actions.length > 0 ? <FinancialCardActions actions={actions} /> : null}
      </div>

      <div className="financial-card__kpi">
        <p className="financial-card__kpi-label">{kpiLabel}</p>
        <p className={cn('financial-card__kpi-value', valueToneClass[kpiTone])}>{kpiValue}</p>
      </div>

      {visibleMeta.length > 0 ? (
        <div className="financial-card__meta-grid">
          {visibleMeta.map((item) => (
            <div key={item.label} className="financial-card__meta-item">
              <p className="financial-card__meta-label">{item.label}</p>
              <p className={cn('financial-card__meta-value', valueToneClass[item.tone ?? 'default'])}>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {visibleTags.length > 0 ? (
        <div className="financial-card__tags">
          {visibleTags.map((tag) => (
            <FinancialCardPill key={`${tag.label}-${tag.tone ?? 'default'}`} badge={tag} subtle />
          ))}
        </div>
      ) : null}

      {footer ? <div className="financial-card__footer">{footer}</div> : null}
    </AppCard>
  );
}

function FinancialCardPill({ badge, subtle = false }: { badge: FinancialCardBadge; subtle?: boolean }) {
  return <span className={cn('financial-card__pill', subtle && 'financial-card__pill--subtle', badge.tone ? `financial-card__pill--${badge.tone}` : undefined)}>{badge.label}</span>;
}

function FinancialCardActions({ actions }: { actions: FinancialCardAction[] }) {
  return (
    <details className="financial-card__actions">
      <summary aria-label="Acciones" className="financial-card__actions-trigger">
        <span aria-hidden>•••</span>
      </summary>
      <div className="financial-card__actions-menu">
        {actions.map((action) => {
          const className = cn('financial-card__action-item', action.destructive && 'financial-card__action-item--destructive');

          if (action.href) {
            return (
              <Link key={action.label} href={action.href} className={className} aria-disabled={action.disabled}>
                {action.label}
              </Link>
            );
          }

          return (
            <button key={action.label} type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
              {action.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
