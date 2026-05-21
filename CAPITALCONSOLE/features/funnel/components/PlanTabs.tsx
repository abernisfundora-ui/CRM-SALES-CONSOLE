import { cn } from '@/lib/cn';
import type { PlanConfig } from '@/features/funnel/types';

type PlanTabsProps = {
  plans: PlanConfig[];
  selectedPlanId: string;
  onSelect: (planId: string) => void;
};

export function PlanTabs({ plans, selectedPlanId, onSelect }: PlanTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {plans.map((plan) => {
        const selected = plan.id === selectedPlanId;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan.id)}
            className={cn(
              'rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077c8]/40',
              selected
                ? 'border-[#0077c8] bg-[#e6f2fb] shadow-sm'
                : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40'
            )}
            aria-pressed={selected}
          >
            <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
            <p className="mt-1 text-xs text-slate-600">{plan.description}</p>
          </button>
        );
      })}
    </div>
  );
}
