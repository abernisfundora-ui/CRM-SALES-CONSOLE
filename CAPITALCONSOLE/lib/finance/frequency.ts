import type { ExpenseFrequency } from '@/types/expenses';
import type { IncomeDeduction, IncomeFrequency } from '@/types/incomes';
import type { AssetIncomeFrequency } from '@/types/assets';
import type { LiabilityPaymentFrequency } from '@/types/liabilities';

const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;

function monthlyFromFrequency(amount: number, frequency: string): number {
  if (frequency === 'una_vez') return amount;
  if (frequency === 'semanal') return (amount * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
  if (frequency === 'quincenal') return amount * 2;
  if (frequency === 'trimestral') return amount / 3;
  if (frequency === 'anual') return amount / MONTHS_PER_YEAR;
  return amount;
}

export function monthlyFromIncome(amount: number, frequency: IncomeFrequency): number {
  return monthlyFromFrequency(amount, frequency);
}

export function monthlyFromAssetIncome(amount: number, frequency: AssetIncomeFrequency): number {
  return monthlyFromFrequency(amount, frequency);
}

export function monthlyFromExpense(amount: number, frequency: ExpenseFrequency): number {
  return monthlyFromFrequency(amount, frequency);
}

export function monthlyFromLiabilityPayment(amount: number, frequency: LiabilityPaymentFrequency): number {
  return monthlyFromFrequency(amount, frequency);
}

export function deductionAmountForPayment(grossAmount: number, deduction: IncomeDeduction): number {
  const safeGross = Number.isFinite(grossAmount) ? Math.max(0, grossAmount) : 0;
  const safeValue = Number.isFinite(deduction.value) ? Math.max(0, deduction.value) : 0;
  return deduction.mode === 'porcentaje' ? safeGross * (safeValue / 100) : safeValue;
}

export function totalDeductionsForPayment(grossAmount: number, deductions: IncomeDeduction[] = []): number {
  return deductions.reduce((total, deduction) => total + deductionAmountForPayment(grossAmount, deduction), 0);
}

export function netIncomeForPayment(grossAmount: number, deductions: IncomeDeduction[] = []): number {
  return Math.max(0, grossAmount - totalDeductionsForPayment(grossAmount, deductions));
}

export function incomeMonthlyEquivalent(input: { grossAmount: number; frequency: IncomeFrequency; deductions?: IncomeDeduction[] }) {
  const grossPerPayment = Number.isFinite(input.grossAmount) ? Math.max(0, input.grossAmount) : 0;
  const totalDeductionsPerPayment = totalDeductionsForPayment(grossPerPayment, input.deductions ?? []);
  const netPerPayment = Math.max(0, grossPerPayment - totalDeductionsPerPayment);

  return {
    grossPerPayment,
    totalDeductionsPerPayment,
    netPerPayment,
    grossMonthly: monthlyFromIncome(grossPerPayment, input.frequency),
    deductionsMonthly: monthlyFromIncome(totalDeductionsPerPayment, input.frequency),
    netMonthly: monthlyFromIncome(netPerPayment, input.frequency)
  };
}

export function nextIncomeOccurrence(input: { startDate: string; frequency: IncomeFrequency; dayOfWeek?: number; dayOfMonth?: number; from?: Date }): string {
  const fallback = new Date().toISOString().slice(0, 10);
  if (!input.startDate) return fallback;

  const from = input.from ?? new Date();
  let cursor = new Date(`${input.startDate}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) return fallback;

  if (input.frequency === 'una_vez') return cursor.toISOString().slice(0, 10);

  if (input.frequency === 'semanal') {
    const targetDow = input.dayOfWeek ?? cursor.getUTCDay();
    while (cursor.getUTCDay() !== targetDow) cursor.setUTCDate(cursor.getUTCDate() + 1);
    while (cursor < from) cursor.setUTCDate(cursor.getUTCDate() + 7);
    return cursor.toISOString().slice(0, 10);
  }

  if (input.frequency === 'quincenal') {
    while (cursor < from) cursor.setUTCDate(cursor.getUTCDate() + 15);
    return cursor.toISOString().slice(0, 10);
  }

  const monthStep = input.frequency === 'trimestral' ? 3 : input.frequency === 'anual' ? 12 : 1;
  const targetDay = Math.min(28, Math.max(1, input.dayOfMonth ?? cursor.getUTCDate()));
  cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), targetDay));
  while (cursor < from) cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + monthStep, targetDay));
  return cursor.toISOString().slice(0, 10);
}

export function buildIncomeOccurrences(input: { startDate: string; frequency: IncomeFrequency; count?: number; dayOfWeek?: number; dayOfMonth?: number; from?: Date }): string[] {
  const count = input.count ?? 6;
  const dates: string[] = [];
  let cursor = new Date(`${nextIncomeOccurrence(input)}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) return dates;

  for (let index = 0; index < count; index += 1) {
    dates.push(cursor.toISOString().slice(0, 10));
    if (input.frequency === 'una_vez') break;
    if (input.frequency === 'semanal') cursor.setUTCDate(cursor.getUTCDate() + 7);
    else if (input.frequency === 'quincenal') cursor.setUTCDate(cursor.getUTCDate() + 15);
    else {
      const monthStep = input.frequency === 'trimestral' ? 3 : input.frequency === 'anual' ? 12 : 1;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + monthStep, cursor.getUTCDate()));
    }
  }

  return dates;
}
