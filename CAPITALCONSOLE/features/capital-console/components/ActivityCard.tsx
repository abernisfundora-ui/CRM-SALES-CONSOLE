import { moduleBadgeClasses } from '@/lib/design-tokens';
import { cn } from '@/lib/cn';
import type { ActivityItem } from '@/types/home-dashboard';

type ActivityCardProps = {
  item: ActivityItem;
};

export function ActivityCard({ item }: ActivityCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ds-text">{item.title}</p>
          <p className="mt-1 text-xs text-ds-muted">{item.subtitle}</p>
        </div>
        <p className={cn('text-sm font-semibold', item.direction === 'in' ? 'text-module-income' : 'text-module-expenses')}>
          {item.amount}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className={cn('rounded-full border px-2 py-1', moduleBadgeClasses[item.type])}>{item.type}</span>
        <span className="text-ds-inactive">{item.timestamp}</span>
      </div>
    </article>
  );
}
