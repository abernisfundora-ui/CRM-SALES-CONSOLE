'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AssetItem } from '@/types/assets';
import type { CalendarItem } from '@/types/calendar';
import type { ExpenseItem } from '@/types/expenses';
import type { GoalItem } from '@/types/goals';
import type { IncomeItem, IncomeFrequency } from '@/types/incomes';
import type { LiabilityItem } from '@/types/liabilities';
import type { LiquidAccountItem } from '@/types/liquidAccounts';
import { incomeMonthlyEquivalent, monthlyFromAssetIncome, monthlyFromExpense, monthlyFromIncome, monthlyFromLiabilityPayment, nextIncomeOccurrence } from '@/lib/finance/frequency';

type CapitalState = {
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  manualIncomes: IncomeItem[];
  manualExpenses: ExpenseItem[];
  manualEvents: CalendarItem[];
  liquidAccounts: LiquidAccountItem[];
  goals: GoalItem[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  setAssets: (assets: AssetItem[]) => void;
  setLiabilities: (liabilities: LiabilityItem[]) => void;
  setManualIncomes: (incomes: IncomeItem[]) => void;
  setManualExpenses: (expenses: ExpenseItem[]) => void;
  setLiquidAccounts: (accounts: LiquidAccountItem[]) => void;
  addAsset: (asset: AssetItem) => void;
  updateAsset: (asset: AssetItem) => void;
  deleteAsset: (assetId: string) => void;
  addLiability: (liability: LiabilityItem) => void;
  updateLiability: (liability: LiabilityItem) => void;
  deleteLiability: (liabilityId: string) => void;
  addLiquidAccount: (account: LiquidAccountItem) => void;
  updateLiquidAccount: (account: LiquidAccountItem) => void;
  deleteLiquidAccount: (accountId: string) => void;
  addIncome: (income: IncomeItem) => void;
  updateIncome: (income: IncomeItem) => void;
  deleteIncome: (incomeId: string) => void;
  addExpense: (expense: ExpenseItem) => void;
  updateExpense: (expense: ExpenseItem) => void;
  deleteExpense: (expenseId: string) => void;
  addGoal: (goal: GoalItem) => void;
  updateGoal: (goal: GoalItem) => void;
  deleteGoal: (goalId: string) => void;
  addEvent: (event: CalendarItem) => void;
  updateEvent: (event: CalendarItem) => void;
  deleteEvent: (eventId: string) => void;
  resetData: () => void;
};

type PersistedCapitalSlice = Pick<
  CapitalState,
  'assets' | 'liabilities' | 'manualIncomes' | 'manualExpenses' | 'manualEvents' | 'goals'
  | 'liquidAccounts'
>;

const emptyPersistedSlice: PersistedCapitalSlice = {
  assets: [],
  liabilities: [],
  manualIncomes: [],
  manualExpenses: [],
  manualEvents: [],
  goals: [],
  liquidAccounts: []
};

function nextAssetOccurrenceDate(asset: AssetItem): string {
  const startDate = asset.ingresoFechaInicio ?? asset.fecha;
  if (!startDate) return new Date().toISOString().slice(0, 10);
  const now = new Date();
  let cursor = new Date(`${startDate}T00:00:00.000Z`);
  const frequency = asset.ingresoFrecuencia ?? 'mensual';

  if (frequency === 'semanal') {
    const targetDow = asset.ingresoDiaSemana ?? cursor.getUTCDay();
    while (cursor.getUTCDay() !== targetDow) cursor.setUTCDate(cursor.getUTCDate() + 1);
    while (cursor < now) cursor.setUTCDate(cursor.getUTCDate() + 7);
    return cursor.toISOString().slice(0, 10);
  }

  if (frequency === 'quincenal') {
    while (cursor < now) cursor.setUTCDate(cursor.getUTCDate() + 15);
    return cursor.toISOString().slice(0, 10);
  }

  if (frequency === 'una_vez') {
    return cursor.toISOString().slice(0, 10);
  }

  const targetDom = asset.ingresoDiaMes ?? cursor.getUTCDate();
  const monthStep = frequency === 'trimestral' ? 3 : frequency === 'anual' ? 12 : 1;
  cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), Math.min(28, Math.max(1, targetDom))));
  while (cursor < now) cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + monthStep, Math.min(28, Math.max(1, targetDom))));
  return cursor.toISOString().slice(0, 10);
}

function deriveIncomesFromAssets(assets: AssetItem[]): IncomeItem[] {
  return assets
    .filter((asset) => asset.generaIngreso)
    .map((asset) => ({
      id: asset.ingresoRelacionadoId ?? `derived-inc-${asset.id}`,
      nombre: `Ingreso de ${asset.nombre}`,
      montoMensual: monthlyFromAssetIncome(asset.ingresoMensual ?? 0, asset.ingresoFrecuencia ?? 'mensual'),
      grossAmount: asset.ingresoMensual ?? 0,
      grossMonthlyAmount: monthlyFromAssetIncome(asset.ingresoMensual ?? 0, asset.ingresoFrecuencia ?? 'mensual'),
      netAmount: asset.ingresoMensual ?? 0,
      netMonthlyAmount: monthlyFromAssetIncome(asset.ingresoMensual ?? 0, asset.ingresoFrecuencia ?? 'mensual'),
      totalDeductionsPerPayment: 0,
      totalDeductionsMonthly: 0,
      fecha: nextAssetOccurrenceDate(asset),
      descripcion: 'Generado desde activos.',
      sourceType: 'derived_asset' as const,
      origin: asset.nombre,
      incomeKind: 'ingreso_pasivo' as const,
      status: 'activo' as const,
      isRecurring: (asset.ingresoFrecuencia ?? 'mensual') !== 'una_vez',
      assetOriginId: asset.id,
      assetOriginName: asset.nombre,
      incomeFrequency: asset.ingresoFrecuencia,
      incomeAmount: asset.ingresoMensual,
      incomeStartDate: asset.ingresoFechaInicio,
      incomeDayOfWeek: asset.ingresoDiaSemana,
      incomeDayOfMonth: asset.ingresoDiaMes,
      linkedAssetId: asset.id
    }));
}

function deriveExpensesFromLiabilities(liabilities: LiabilityItem[]): ExpenseItem[] {
  return liabilities
    .filter((liability) => liability.generaGasto)
    .map((liability) => ({
      id: liability.gastoRelacionadoId ?? `derived-exp-${liability.id}`,
      nombre: `Pago de ${liability.nombre}`,
      monto: liability.pagoMensual,
      montoMensual: monthlyFromLiabilityPayment(liability.pagoMensual, liability.frecuenciaPago ?? 'mensual'),
      fecha: liability.proximaFechaPago,
      frecuencia: liability.frecuenciaPago ?? 'mensual',
      tipo: 'fijo' as const,
      descripcion: 'Derivado de pasivo.',
      originType: 'liability-derived' as const,
      liabilityOriginId: liability.id,
      liabilityOriginName: liability.nombre
    }));
}

function deriveExpensesFromAssets(assets: AssetItem[]): ExpenseItem[] {
  return assets
    .filter((asset) => asset.tieneGasto && (asset.gastoMensual ?? 0) > 0)
    .map((asset) => ({
      id: asset.gastoRelacionadoId ?? `derived-asset-exp-${asset.id}`,
      nombre: `Gasto de ${asset.nombre}`,
      monto: asset.gastoMensual ?? 0,
      montoMensual: monthlyFromExpense(asset.gastoMensual ?? 0, 'mensual'),
      fecha: asset.fecha,
      frecuencia: 'mensual' as const,
      tipo: 'fijo' as const,
      descripcion: `Tipo: ${asset.gastoTipo ?? 'mantenimiento'}.`,
      originType: 'asset-derived' as const,
      assetOriginId: asset.id,
      assetOriginName: asset.nombre
    }));
}

function mergeById<T extends { id: string; fecha: string }>(manualItems: T[], derivedItems: T[]): T[] {
  const merged = new Map<string, T>();
  for (const item of derivedItems) merged.set(item.id, item);
  for (const item of manualItems) merged.set(item.id, item);
  return [...merged.values()].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

function normalizeManualIncome(income: IncomeItem): IncomeItem {
  const frequency = income.frequency ?? ('mensual' as IncomeFrequency);
  const grossAmount = income.grossAmount ?? income.incomeAmount ?? income.montoMensual ?? 0;
  const monthly = incomeMonthlyEquivalent({ grossAmount, frequency, deductions: income.deductions ?? [] });
  const startDate = income.startDate ?? income.incomeStartDate ?? income.fecha;
  const nextDate = income.nextDate ?? nextIncomeOccurrence({ startDate, frequency, dayOfWeek: income.incomeDayOfWeek, dayOfMonth: income.incomeDayOfMonth });

  return {
    ...income,
    fecha: nextDate,
    startDate,
    incomeStartDate: startDate,
    nextDate,
    frequency,
    incomeAmount: grossAmount,
    grossAmount,
    grossMonthlyAmount: monthly.grossMonthly,
    netAmount: monthly.netPerPayment,
    netMonthlyAmount: monthly.netMonthly,
    totalDeductionsPerPayment: monthly.totalDeductionsPerPayment,
    totalDeductionsMonthly: monthly.deductionsMonthly,
    montoMensual: monthly.netMonthly,
    sourceType: income.sourceType ?? 'manual',
    origin: income.origin ?? income.employer ?? income.descripcion ?? 'Ingreso manual',
    incomeKind: income.incomeKind ?? 'ingreso_manual',
    status: income.status ?? 'activo',
    isRecurring: income.isRecurring ?? frequency !== 'una_vez'
  };
}

function computeIncomes(assets: AssetItem[], manualIncomes: IncomeItem[]) {
  const normalizedManual = manualIncomes.map(normalizeManualIncome);
  return mergeById(normalizedManual, deriveIncomesFromAssets(assets));
}

function computeExpenses(assets: AssetItem[], liabilities: LiabilityItem[], manualExpenses: ExpenseItem[]) {
  const normalizedManual = manualExpenses.map((expense) => ({
    ...expense,
    montoMensual: monthlyFromExpense(expense.monto, expense.frecuencia)
  }));
  return mergeById(normalizedManual, [...deriveExpensesFromLiabilities(liabilities), ...deriveExpensesFromAssets(assets)]);
}

const buildDerivedState = (base: PersistedCapitalSlice) => ({
  ...base,
  incomes: computeIncomes(base.assets, base.manualIncomes),
  expenses: computeExpenses(base.assets, base.liabilities, base.manualExpenses)
});

export const useCapitalStore = create<CapitalState>()(
  persist(
    (set) => ({
      ...buildDerivedState(emptyPersistedSlice),
      setAssets: (assets) =>
        set((state) => ({ assets, incomes: computeIncomes(assets, state.manualIncomes), expenses: computeExpenses(assets, state.liabilities, state.manualExpenses) })),
      setLiabilities: (liabilities) =>
        set((state) => ({ liabilities, expenses: computeExpenses(state.assets, liabilities, state.manualExpenses) })),
      setManualIncomes: (manualIncomes) =>
        set((state) => ({ manualIncomes, incomes: computeIncomes(state.assets, manualIncomes) })),
      setManualExpenses: (manualExpenses) =>
        set((state) => ({ manualExpenses, expenses: computeExpenses(state.assets, state.liabilities, manualExpenses) })),
      setLiquidAccounts: (liquidAccounts) => set(() => ({ liquidAccounts })),
      addAsset: (asset) =>
        set((state) => {
          const assets = [asset, ...state.assets];
          return { assets, incomes: computeIncomes(assets, state.manualIncomes), expenses: computeExpenses(assets, state.liabilities, state.manualExpenses) };
        }),
      updateAsset: (asset) =>
        set((state) => {
          const assets = state.assets.map((item) => (item.id === asset.id ? asset : item));
          return { assets, incomes: computeIncomes(assets, state.manualIncomes), expenses: computeExpenses(assets, state.liabilities, state.manualExpenses) };
        }),
      deleteAsset: (assetId) =>
        set((state) => {
          const assets = state.assets.filter((item) => item.id !== assetId);
          const liabilities = state.liabilities.filter((item) => !(item.linkedAssetId === assetId && item.isAutoGenerated));
          return { assets, liabilities, incomes: computeIncomes(assets, state.manualIncomes), expenses: computeExpenses(assets, liabilities, state.manualExpenses) };
        }),
      addLiability: (liability) =>
        set((state) => {
          const liabilities = [liability, ...state.liabilities];
          return { liabilities, expenses: computeExpenses(state.assets, liabilities, state.manualExpenses) };
        }),
      updateLiability: (liability) =>
        set((state) => {
          const liabilities = state.liabilities.map((item) => (item.id === liability.id ? liability : item));
          return { liabilities, expenses: computeExpenses(state.assets, liabilities, state.manualExpenses) };
        }),
      deleteLiability: (liabilityId) =>
        set((state) => {
          const liabilities = state.liabilities.filter((item) => item.id !== liabilityId);
          return { liabilities, expenses: computeExpenses(state.assets, liabilities, state.manualExpenses) };
        }),
      addLiquidAccount: (account) => set((state) => ({ liquidAccounts: [account, ...state.liquidAccounts] })),
      updateLiquidAccount: (account) =>
        set((state) => ({ liquidAccounts: state.liquidAccounts.map((item) => (item.id === account.id ? account : item)) })),
      deleteLiquidAccount: (accountId) =>
        set((state) => ({ liquidAccounts: state.liquidAccounts.filter((item) => item.id !== accountId) })),
      addIncome: (income) =>
        set((state) => {
          const manualIncomes = [income, ...state.manualIncomes];
          return { manualIncomes, incomes: computeIncomes(state.assets, manualIncomes) };
        }),
      updateIncome: (income) =>
        set((state) => {
          const manualIncomes = state.manualIncomes.map((item) => (item.id === income.id ? income : item));
          return { manualIncomes, incomes: computeIncomes(state.assets, manualIncomes) };
        }),
      deleteIncome: (incomeId) =>
        set((state) => {
          const manualIncomes = state.manualIncomes.filter((item) => item.id !== incomeId);
          return { manualIncomes, incomes: computeIncomes(state.assets, manualIncomes) };
        }),
      addExpense: (expense) =>
        set((state) => {
          const manualExpenses = [expense, ...state.manualExpenses];
          return { manualExpenses, expenses: computeExpenses(state.assets, state.liabilities, manualExpenses) };
        }),
      updateExpense: (expense) =>
        set((state) => {
          const manualExpenses = state.manualExpenses.map((item) => (item.id === expense.id ? expense : item));
          return { manualExpenses, expenses: computeExpenses(state.assets, state.liabilities, manualExpenses) };
        }),
      deleteExpense: (expenseId) =>
        set((state) => {
          const manualExpenses = state.manualExpenses.filter((item) => item.id !== expenseId);
          return { manualExpenses, expenses: computeExpenses(state.assets, state.liabilities, manualExpenses) };
        }),
      addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
      updateGoal: (goal) => set((state) => ({ goals: state.goals.map((item) => (item.id === goal.id ? goal : item)) })),
      deleteGoal: (goalId) => set((state) => ({ goals: state.goals.filter((item) => item.id !== goalId) })),
      addEvent: (event) => set((state) => ({ manualEvents: [event, ...state.manualEvents] })),
      updateEvent: (event) =>
        set((state) => ({ manualEvents: state.manualEvents.map((item) => (item.id === event.id ? event : item)) })),
      deleteEvent: (eventId) => set((state) => ({ manualEvents: state.manualEvents.filter((item) => item.id !== eventId) })),
      resetData: () => set(() => ({ ...buildDerivedState(emptyPersistedSlice) }))
    }),
    {
      name: 'capital-console-store-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedCapitalSlice => ({
        assets: state.assets,
        liabilities: state.liabilities,
        manualIncomes: state.manualIncomes,
        manualExpenses: state.manualExpenses,
        manualEvents: state.manualEvents,
        goals: state.goals,
        liquidAccounts: state.liquidAccounts
      }),
      merge: (persistedState, currentState) => {
        const maybeWrapped = persistedState as { state?: PersistedCapitalSlice };
        const source = (maybeWrapped?.state ?? (persistedState as PersistedCapitalSlice) ?? {}) as PersistedCapitalSlice;
        const derived = buildDerivedState({
          assets: source.assets ?? currentState.assets,
          liabilities: source.liabilities ?? currentState.liabilities,
          manualIncomes: source.manualIncomes ?? currentState.manualIncomes,
          manualExpenses: source.manualExpenses ?? currentState.manualExpenses,
          manualEvents: source.manualEvents ?? currentState.manualEvents,
          goals: source.goals ?? currentState.goals,
          liquidAccounts: source.liquidAccounts ?? currentState.liquidAccounts
        });

        return { ...currentState, ...derived };
      }
    }
  )
);

export const capitalSelectors = {
  assets: (state: CapitalState) => state.assets,
  liabilities: (state: CapitalState) => state.liabilities,
  incomes: (state: CapitalState) => state.incomes,
  expenses: (state: CapitalState) => state.expenses,
  liquidAccounts: (state: CapitalState) => state.liquidAccounts,
  manualEvents: (state: CapitalState) => state.manualEvents,
  goals: (state: CapitalState) => state.goals
};
