import type { ReactNode } from 'react';

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <section className="rounded-2xl border border-[rgba(31,42,23,0.10)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,247,238,0.80))] p-4 shadow-soft">
      <h2 className="text-base font-semibold text-[#1F2A17]">{title}</h2>
      <div className="mt-3 text-sm text-[rgba(31,42,23,0.62)]">{children}</div>
    </section>
  );
}
