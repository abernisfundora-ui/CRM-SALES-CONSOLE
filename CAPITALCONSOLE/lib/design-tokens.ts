import type { ModuleKind, UIState } from '@/types/design-system';

export const moduleClasses: Record<ModuleKind, string> = {
  assets: 'ds-module-assets',
  liabilities: 'ds-module-liabilities',
  income: 'ds-module-income',
  expenses: 'ds-module-expenses',
  calendar: 'ds-module-calendar'
};

export const moduleColorHex: Record<ModuleKind, string> = {
  assets: '#22D3EE',
  liabilities: '#FB923C',
  income: '#34D399',
  expenses: '#F87171',
  calendar: '#CBD5E1'
};

export const moduleBadgeClasses: Record<ModuleKind, string> = {
  assets: 'bg-module-assets/15 text-module-assets border-module-assets/40',
  liabilities: 'bg-module-liabilities/15 text-module-liabilities border-module-liabilities/40',
  income: 'bg-module-income/15 text-module-income border-module-income/40',
  expenses: 'bg-module-expenses/15 text-module-expenses border-module-expenses/40',
  calendar: 'bg-module-calendar/15 text-module-calendar border-module-calendar/40'
};

export const stateClasses: Record<UIState, string> = {
  active: 'ds-state-active',
  inactive: 'ds-state-inactive'
};
