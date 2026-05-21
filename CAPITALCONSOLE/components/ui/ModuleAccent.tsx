import type { ReactNode } from 'react';
import type { ModuleKind } from '@/types/design-system';
import { moduleClasses } from '@/lib/design-tokens';
import { cn } from '@/lib/cn';

type ModuleAccentProps = {
  module: ModuleKind;
  children: ReactNode;
  className?: string;
};

export function ModuleAccent({ module, children, className }: ModuleAccentProps) {
  return (
    <div className={cn(moduleClasses[module], 'rounded-2xl border border-white/10 p-[1px] ds-accent-border', className)}>
      <div className="rounded-2xl">{children}</div>
    </div>
  );
}
