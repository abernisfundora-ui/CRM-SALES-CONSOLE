import type { ModuleKind } from '@/types/design-system';

export type FinancialSummary = {
  balance: number;
  income: number;
  expenses: number;
  net: number;
};

export type TrendPoint = {
  label: string;
  amount: number;
};

export type DistributionPoint = {
  name: string;
  value: number;
  module: ModuleKind;
};

export type MetricCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  module: ModuleKind;
};

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  direction: 'in' | 'out';
  timestamp: string;
  type: ModuleKind;
};

export type QuickFilter = {
  id: string;
  label: string;
  type: ModuleKind | 'all';
};
