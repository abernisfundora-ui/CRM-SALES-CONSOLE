'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { AppCard } from '@/components/ui/AppCard';
import { moduleColorHex } from '@/lib/design-tokens';
import type { DistributionPoint } from '@/types/home-dashboard';

type DonutSummaryCardProps = {
  data: DistributionPoint[];
};

export function DonutSummaryCard({ data }: DonutSummaryCardProps) {
  return (
    <AppCard className="h-full">
      <p className="text-xs uppercase tracking-[0.12em] text-ds-muted">Distribución</p>
      <div className="mt-3 flex flex-col gap-3 sm:grid sm:grid-cols-[100px_1fr] sm:items-center">
        <div className="mx-auto h-24 w-24 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={24} outerRadius={40} strokeWidth={0}>
                {data.map((item) => (
                  <Cell key={item.name} fill={moduleColorHex[item.module]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-1 sm:gap-y-1.5">
          {data.map((item) => (
            <li key={item.name} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1 text-xs">
              <span className="truncate text-ds-muted">{item.name}</span>
              <span className="shrink-0 font-semibold text-ds-text">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </AppCard>
  );
}
