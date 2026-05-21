'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { resolveMainNavigationItem } from '@/lib/config/main-navigation';
import { CreateFab } from '@/components/create/CreateFab';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';

type MainAppLayoutProps = {
  children: ReactNode;
};

export function MainAppLayout({ children }: MainAppLayoutProps) {
  const pathname = usePathname();
  const current = resolveMainNavigationItem(pathname);
  const hideFab = pathname.startsWith('/create');

  return (
    <div className="dashboard-bg flex h-screen overflow-hidden">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderBar module={current.module} />
        <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+7.2rem)] pt-3 md:px-6 md:pt-4 lg:max-w-[1760px] lg:px-6 lg:pb-8 lg:pt-5 xl:px-6 2xl:px-8">
          <div className="main-dashboard min-h-full">
            {children}
          </div>
        </main>
      </div>
      {!hideFab ? <CreateFab /> : null}
      <BottomNav />
    </div>
  );
}
