import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ScreenContainerProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return <main className={cn('ds-screen space-y-4 md:space-y-5', className)}>{children}</main>;
}
