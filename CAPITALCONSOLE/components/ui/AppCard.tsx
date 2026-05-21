import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppCardProps = {
  children: ReactNode;
  className?: string;
};

export function AppCard({ children, className }: AppCardProps) {
  return (
    <section className={cn('app-card p-4 md:p-4.5', className)}>
      {children}
    </section>
  );
}
