import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen gap-4 p-4 lg:grid-cols-[16rem_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <section className="animate-fade-in">
        <Topbar />
        <div className="space-y-4">{children}</div>
      </section>
    </main>
  );
}
