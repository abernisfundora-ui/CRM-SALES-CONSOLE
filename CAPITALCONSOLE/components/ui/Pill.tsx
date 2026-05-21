import { moduleBadgeClasses, stateClasses } from '@/lib/design-tokens';
import type { ModuleKind, UIState } from '@/types/design-system';
import { cn } from '@/lib/cn';

type PillProps = {
  children: string;
  module?: ModuleKind;
  state?: UIState;
};

export function Pill({ children, module = 'calendar', state = 'active' }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide',
        moduleBadgeClasses[module],
        stateClasses[state]
      )}
    >
      {children}
    </span>
  );
}
