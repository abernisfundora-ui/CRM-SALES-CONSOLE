import { PLAN_CONFIGS } from '@/features/funnel/config/plans';
import type { EstimateResult, FlatPlanConfig, FreeHoursPlanConfig, PlanConfig } from '@/features/funnel/types';

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const createResult = (plan: PlanConfig, usage: number, freeUsagePercent: number, data: Omit<EstimateResult, 'planId' | 'planName' | 'usage' | 'freeUsagePercent'>): EstimateResult => ({
  planId: plan.id,
  planName: plan.name,
  usage,
  freeUsagePercent,
  ...data
});

export function calculateTexasPowerSaver(usage: number, plan: FlatPlanConfig): EstimateResult {
  const safeUsage = Math.max(0, usage);
  const energyCost = safeUsage * plan.energyRate;
  const oncorCost = safeUsage * plan.oncorRate;
  const subtotal = energyCost + oncorCost + plan.baseCharge;
  const taxes = subtotal * plan.taxRate;
  const total = subtotal + taxes;

  return createResult(plan, safeUsage, 0, {
    breakdown: {
      energyCost,
      oncorCost,
      baseCharge: plan.baseCharge,
      taxes,
      subtotal,
      total,
      averageRate: safeUsage > 0 ? total / safeUsage : 0,
      freeUsage: 0,
      paidUsage: safeUsage,
      freeCreditDisplay: 0
    }
  });
}

export function calculateDaysFree(usage: number, freeUsagePercent: number, plan: FreeHoursPlanConfig): EstimateResult {
  const safeUsage = Math.max(0, usage);
  const safePercent = clampPercent(freeUsagePercent || 0);
  const freeUsage = safeUsage * (safePercent / 100);
  const paidUsage = safeUsage - freeUsage;
  const energyCost = paidUsage * plan.paidEnergyRate;
  const oncorCost = safeUsage * plan.oncorRate;
  const subtotal = energyCost + oncorCost + plan.baseCharge;
  const taxes = subtotal * plan.taxRate;
  const total = subtotal + taxes;

  return createResult(plan, safeUsage, safePercent, {
    breakdown: {
      energyCost,
      oncorCost,
      baseCharge: plan.baseCharge,
      taxes,
      subtotal,
      total,
      averageRate: safeUsage > 0 ? total / safeUsage : 0,
      freeUsage,
      paidUsage,
      freeCreditDisplay: freeUsage * plan.paidEnergyRate
    }
  });
}

export function calculateFreeNights(usage: number, freeUsagePercent: number, plan: FreeHoursPlanConfig): EstimateResult {
  return calculateDaysFree(usage, freeUsagePercent, plan);
}

export function calculateByPlan(plan: PlanConfig, usage: number, freeUsagePercent: number): EstimateResult {
  if (plan.type === 'flat') {
    return calculateTexasPowerSaver(usage, plan);
  }

  if (plan.id === 'free-nights') {
    return calculateFreeNights(usage, freeUsagePercent, plan);
  }

  return calculateDaysFree(usage, freeUsagePercent, plan);
}

export function calculateAllPlans(usage: number, freeUsagePercent: number) {
  return PLAN_CONFIGS.map((plan) => calculateByPlan(plan, usage, freeUsagePercent));
}

export function getBestPlan(results: EstimateResult[]): EstimateResult | null {
  if (!results.length) return null;

  return [...results].sort((a, b) => a.breakdown.total - b.breakdown.total)[0];
}
