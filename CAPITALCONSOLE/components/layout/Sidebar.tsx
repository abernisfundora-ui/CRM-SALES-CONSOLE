'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { resolveRoleFromPathname, roleRoutes } from '@/lib/routes';

export function Sidebar() {
  const pathname = usePathname();
  const role = resolveRoleFromPathname(pathname);

  return (
    <aside className="glass-card sticky top-4 h-[calc(100vh-2rem)] w-64 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand-200">Piloto Enterprise</h2>
      <p className="mb-5 text-xs text-slate-400">Role: {role}</p>
      <nav className="space-y-1.5">
        {roleRoutes[role].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-xl px-3 py-2 text-sm transition-all duration-200',
                active ? 'bg-brand-500/25 text-white shadow-glow' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
