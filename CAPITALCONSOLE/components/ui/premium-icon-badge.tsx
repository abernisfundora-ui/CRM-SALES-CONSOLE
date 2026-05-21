import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PremiumIconBadge({ icon, tone = 'emerald' }: { icon: ReactNode; tone?: 'emerald' | 'rose' | 'violet' | 'blue' }) {
  const toneClass = {
    emerald: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
    rose: 'border-rose-300/40 bg-rose-300/10 text-rose-200',
    violet: 'border-violet-300/40 bg-violet-300/10 text-violet-200',
    blue: 'border-blue-300/40 bg-blue-300/10 text-blue-200'
  };

  return <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-[0_0_14px_rgba(0,0,0,0.2)]', toneClass[tone])}>{icon}</span>;
}
