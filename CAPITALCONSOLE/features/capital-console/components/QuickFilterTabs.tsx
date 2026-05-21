'use client';

import type { QuickFilter } from '@/types/home-dashboard';

type QuickFilterTabsProps = {
  filters: QuickFilter[];
  activeId: string;
  onChange: (id: string) => void;
};

export function QuickFilterTabs({ filters, activeId, onChange }: QuickFilterTabsProps) {
  return (
    <div className="ds-chip-row">
      {filters.map((filter) => {
        const isActive = filter.id === activeId;

        return (
          <button key={filter.id} type="button" onClick={() => onChange(filter.id)} className="ds-chip" data-active={isActive}>
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
