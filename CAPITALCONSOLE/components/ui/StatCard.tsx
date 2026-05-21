import type { ModuleKind, UIState } from '@/types/design-system';
import { cn } from '@/lib/cn';
import { moduleClasses, stateClasses } from '@/lib/design-tokens';
import { AppCard } from '@/components/ui/AppCard';
import { Pill } from '@/components/ui/Pill';
import { IconPlaceholder } from '@/components/ui/IconPlaceholder';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  module: ModuleKind;
  state?: UIState;
};

export function StatCard({ title, value, change, module, state = 'active' }: StatCardProps) {
  return (
    <AppCard className={cn(moduleClasses[module], 'ds-accent-border ds-accent-glow space-y-3')}>
      <div className="flex items-center justify-between gap-3">
        <IconPlaceholder module={module} label={title.slice(0, 2).toUpperCase()} />
        <Pill module={module} state={state}>
          {module}
        </Pill>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-ds-muted">{title}</p>
        <p className={cn('mt-1 text-2xl font-semibold', stateClasses[state])}>{value}</p>
      </div>
      <p className="text-sm text-ds-muted">{change}</p>
    </AppCard>
  );
}
