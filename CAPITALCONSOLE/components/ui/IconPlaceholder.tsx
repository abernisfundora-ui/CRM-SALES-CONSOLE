import type { ModuleKind } from '@/types/design-system';
import { moduleClasses } from '@/lib/design-tokens';
import { cn } from '@/lib/cn';

type IconPlaceholderProps = {
  module?: ModuleKind;
  label?: string;
};

export function IconPlaceholder({ module = 'calendar', label = 'IC' }: IconPlaceholderProps) {
  return (
    <div
      className={cn(
        'grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.02] text-[11px] font-semibold text-ds-text',
        moduleClasses[module],
        'ds-accent-border ds-accent-glow'
      )}
    >
      {label}
    </div>
  );
}
