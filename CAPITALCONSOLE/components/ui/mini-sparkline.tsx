export function MiniSparkline({ points, color = '#34d399' }: { points: number[]; color?: string }) {
  const normalized = points.length ? points : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...normalized, 1);
  const min = Math.min(...normalized, 0);
  const range = max - min || 1;
  const coords = normalized.map((p, i) => ({ x: 6 + i * 24, y: 56 - ((p - min) / range) * 39 }));
  const path = coords.reduce((acc, c, i) => (i === 0 ? `M${c.x} ${c.y}` : `${acc} L${c.x} ${c.y}`), '');

  return (
    <svg width="158" height="64" viewBox="0 0 158 64" className="h-[72px] w-full lg:h-[132px]">
      <path d={path} fill="none" stroke={color} strokeWidth="1.9" />
      {coords.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />)}
    </svg>
  );
}
