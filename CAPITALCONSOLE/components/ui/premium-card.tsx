import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PremiumCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-colors transition-shadow duration-200 hover:border-emerald-400/30',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.15),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-32 w-full bg-[radial-gradient(circle_at_bottom,rgba(148,163,184,0.08),transparent_62%)]" />
      {children}
    </div>
  );
}
