'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

type KpiTone = 'appointments' | 'conversion' | 'revenue';

type KPIStatCardProps = {
  label: string;
  value: string;
  tone?: KpiTone;
};

const toneByLabel: Record<string, KpiTone> = {
  appointments: 'appointments',
  conversion: 'conversion',
  revenue: 'revenue'
};

const toneStyles: Record<
  KpiTone,
  {
    card: string;
    accent: string;
    value: string;
    trend: string;
  }
> = {
  appointments: {
    card:
      'border-sky-400/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(224,242,254,0.58))] shadow-[0_18px_45px_rgba(14,165,233,0.14)]',
    accent: 'bg-sky-400/80 shadow-[0_0_18px_rgba(56,189,248,0.45)]',
    value: 'text-sky-950',
    trend: 'text-sky-600'
  },
  conversion: {
    card:
      'border-violet-400/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(237,233,254,0.60))] shadow-[0_18px_45px_rgba(139,92,246,0.14)]',
    accent: 'bg-violet-400/80 shadow-[0_0_18px_rgba(167,139,250,0.45)]',
    value: 'text-violet-950',
    trend: 'text-violet-600'
  },
  revenue: {
    card:
      'border-emerald-400/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(220,252,231,0.58))] shadow-[0_18px_45px_rgba(16,185,129,0.14)]',
    accent: 'bg-emerald-400/80 shadow-[0_0_18px_rgba(52,211,153,0.45)]',
    value: 'text-emerald-950',
    trend: 'text-emerald-600'
  }
};

export function KPIStatCard({ label, value, tone }: KPIStatCardProps) {
  const activeTone = tone ?? toneByLabel[label.toLowerCase()] ?? 'revenue';
  const styles = toneStyles[activeTone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('glass-card relative overflow-hidden p-4', styles.card)}
    >
      <div className={cn('absolute right-4 top-4 h-2.5 w-2.5 rounded-full', styles.accent)} />
      <p className="subtle-label pr-6">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold tracking-tight', styles.value)}>{value}</p>
      <p className={cn('mt-2 text-xs font-medium', styles.trend)}>+12.4% vs last week</p>
    </motion.article>
  );
}
