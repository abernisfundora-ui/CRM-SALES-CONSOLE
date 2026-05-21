'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AppCard } from '@/components/ui/AppCard';
import type { TrendPoint } from '@/types/home-dashboard';

type MiniBarChartCardProps = {
  data: TrendPoint[];
};

export function MiniBarChartCard({ data }: MiniBarChartCardProps) {
  const max = data.length > 0 ? Math.max(...data.map((item) => item.amount)) : 0;

  return (
    <AppCard className="h-full">
      <p className="text-xs uppercase tracking-[0.12em] text-ds-muted">Tendencia semanal</p>
      <div className="mt-3 h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <YAxis hide domain={[0, max + 6]} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.amount === max ? '#22D3EE' : 'rgba(255,255,255,0.22)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
}
