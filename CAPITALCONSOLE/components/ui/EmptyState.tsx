import { Button } from './Button';

export function EmptyState({ title = 'No data yet', description = 'Connect data source or adjust filters.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[18px] border border-[rgba(47,61,31,0.12)] bg-[radial-gradient(circle,rgba(143,168,90,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.80),rgba(238,242,232,0.70))] p-8 text-center text-[#10170D] shadow-[0_14px_34px_rgba(47,61,31,0.11)] backdrop-blur-[6px]">
      <p className="subtle-label text-[#6B7A45]/55">Empty state</p>
      <h3 className="text-lg font-semibold text-[#10170D]">{title}</h3>
      <p className="max-w-md text-sm text-[rgba(16,23,13,0.62)]">{description}</p>
      <Button variant="ghost">Create first item</Button>
    </div>
  );
}
