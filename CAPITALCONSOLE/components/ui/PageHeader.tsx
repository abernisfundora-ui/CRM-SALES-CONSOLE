import type { ReactNode } from 'react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  actionLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  description,
  eyebrow = 'Dashboard',
  actionLabel,
  actions
}: PageHeaderProps) {
  const resolvedActions = actions ??
    (actionLabel ? (
      <button
        type="button"
        className="rounded-2xl border border-[rgba(143,168,90,0.24)] bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white"
      >
        {actionLabel}
      </button>
    ) : undefined);

  return (
    <ScreenHeader
      eyebrow={eyebrow}
      title={title}
      description={description ?? subtitle ?? ''}
      actions={resolvedActions}
    />
  );
}
