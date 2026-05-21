import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export function PremiumSparkline({ points, color = '#10B981' }: { points: number[]; color?: string }) {
  const data = points.map((value, index) => ({ index, value }));
  if (!data.length) return <div className="h-16 w-full rounded-xl border border-white/10 bg-white/[0.02]" />;

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area dataKey="value" type="monotone" stroke={color} strokeWidth={2} fill={`url(#spark-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
