'use client';

import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean).slice(1);

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400">
      <span>Dashboard</span>
      {parts.map((part) => (
        <span key={part} className="flex items-center gap-2">
          <span className="text-slate-600">/</span>
          <span className="capitalize text-slate-300">{part.replace('-', ' ')}</span>
        </span>
      ))}
    </nav>
  );
}
