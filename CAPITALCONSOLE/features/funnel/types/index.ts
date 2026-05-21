export type PlanType = 'flat' | 'free-hours';

export type BasePlanConfig = {
  id: string;
  name: string;
  description: string;
  oncorRate: number;
  baseCharge: number;
  taxRate: number;
};

export type FlatPlanConfig = BasePlanConfig & {
  type: 'flat';
  energyRate: number;
};

export type FreeHoursPlanConfig = BasePlanConfig & {
  type: 'free-hours';
  paidEnergyRate: number;
  freePeriodLabel: string;
};

export type PlanConfig = FlatPlanConfig | FreeHoursPlanConfig;

export type EstimateBreakdown = {
  energyCost: number;
  oncorCost: number;
  baseCharge: number;
  taxes: number;
  subtotal: number;
  total: number;
  averageRate: number;
  freeUsage: number;
  paidUsage: number;
  freeCreditDisplay: number;
};

export type EstimateResult = {
  planId: string;
  planName: string;
  usage: number;
  freeUsagePercent: number;
  breakdown: EstimateBreakdown;
};

export type LeadFormValues = {
  name: string;
  phone: string;
  email?: string;
};

export type TrackingPayload = Record<string, string | number | boolean | null | undefined>;
