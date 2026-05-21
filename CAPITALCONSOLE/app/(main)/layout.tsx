import type { ReactNode } from 'react';
import { MainAppLayout } from '@/components/layout/MainAppLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <MainAppLayout>{children}</MainAppLayout>;
}
