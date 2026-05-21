import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('filter-bar', className)}>{children}</section>;
}
