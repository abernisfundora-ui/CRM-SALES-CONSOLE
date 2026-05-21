import type { AssetItem } from '@/types/assets';
import type { CalendarItem, CalendarSourceType } from '@/types/calendar';
import type { ExpenseItem } from '@/types/expenses';
import type { GoalItem } from '@/types/goals';
import type { IncomeItem } from '@/types/incomes';
import type { LiabilityItem } from '@/types/liabilities';
import { buildIncomeOccurrences } from '@/lib/finance/frequency';

type NormalizeCalendarInput = {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  goals?: GoalItem[];
  manualEvents: CalendarItem[];
};

function buildIsoDateTime(date: string): string {
  return `${date}T09:00:00.000Z`;
}


function buildExpenseOccurrences(expense: ExpenseItem): string[] {
  const startDate = expense.fecha;
  if (!startDate) return [];
  const frequency = expense.frecuencia ?? 'una_vez';
  const count = frequency === 'una_vez' ? 1 : 6;
  const dates: string[] = [];
  let cursor = new Date(`${startDate}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) return dates;

  const now = new Date();
  if (frequency === 'semanal') while (cursor < now) cursor.setUTCDate(cursor.getUTCDate() + 7);
  else if (frequency === 'quincenal') while (cursor < now) cursor.setUTCDate(cursor.getUTCDate() + 15);
  else if (frequency !== 'una_vez') {
    const step = frequency === 'trimestral' ? 3 : frequency === 'anual' ? 12 : 1;
    const targetDay = Math.min(28, cursor.getUTCDate());
    cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), targetDay));
    while (cursor < now) cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + step, targetDay));
  }

  for (let index = 0; index < count; index += 1) {
    dates.push(cursor.toISOString().slice(0, 10));
    if (frequency === 'una_vez') break;
    if (frequency === 'semanal') cursor.setUTCDate(cursor.getUTCDate() + 7);
    else if (frequency === 'quincenal') cursor.setUTCDate(cursor.getUTCDate() + 15);
    else {
      const step = frequency === 'trimestral' ? 3 : frequency === 'anual' ? 12 : 1;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + step, cursor.getUTCDate()));
    }
  }

  return dates;
}

function sourceTypeForIncome(income: IncomeItem): CalendarSourceType {
  return income.sourceType === 'derived_asset' ? 'derived-income' : 'manual';
}

function sourceTypeForExpense(expense: ExpenseItem): CalendarSourceType {
  if (expense.originType === 'liability-derived') return 'liability-payment';
  if (expense.originType === 'asset-derived') return 'derived-expense';
  return 'manual';
}

export function normalizeCalendarItems({
  incomes,
  expenses,
  assets,
  liabilities,
  goals = [],
  manualEvents
}: NormalizeCalendarInput): CalendarItem[] {
  const incomeEvents: CalendarItem[] = incomes.flatMap((income) => {
    const frequency = income.frequency ?? income.incomeFrequency ?? 'mensual';
    const dates = income.isRecurring === false
      ? [income.nextDate ?? income.fecha]
      : buildIncomeOccurrences({
        startDate: income.startDate ?? income.incomeStartDate ?? income.fecha,
        frequency,
        count: frequency === 'una_vez' ? 1 : 6,
        dayOfWeek: income.incomeDayOfWeek,
        dayOfMonth: income.incomeDayOfMonth
      });

    return dates.map((eventDate, index) => ({
      id: `income-${income.id}-${index}`,
      date: eventDate,
      title: income.nombre,
      description: income.notes ?? income.descripcion,
      amount: income.netAmount ?? income.montoMensual,
      type: 'ingreso' as const,
      source: 'income' as const,
      sourceType: sourceTypeForIncome(income),
      sourceId: income.id,
      editable: false,
      deletable: false,
      startDateTime: buildIsoDateTime(eventDate)
    }));
  });

  const expenseEvents: CalendarItem[] = expenses.flatMap((expense) => {
    const dates = buildExpenseOccurrences(expense);
    return dates.map((eventDate, index) => ({
      id: `expense-${expense.id}-${index}`,
      date: eventDate,
      title: expense.nombre,
      description: expense.descripcion,
      amount: expense.monto,
      type: 'gasto' as const,
      source: 'expense' as const,
      sourceType: sourceTypeForExpense(expense),
      sourceId: expense.id,
      editable: false,
      deletable: false,
      startDateTime: buildIsoDateTime(eventDate)
    }));
  });

  const assetEvents: CalendarItem[] = assets.map((asset) => ({
    id: `asset-${asset.id}`,
    date: asset.fecha,
    title: `Revisión de activo · ${asset.nombre}`,
    description: asset.descripcion,
    amount: asset.valorActual,
    type: 'evento_financiero',
    source: 'asset',
    sourceType: 'asset-review',
    sourceId: asset.id,
    editable: false,
    deletable: false,
    startDateTime: buildIsoDateTime(asset.fecha)
  }));

  const liabilityEvents: CalendarItem[] = liabilities
    .filter((liability) => !liability.generaGasto)
    .map((liability) => ({
      id: `liability-${liability.id}`,
      date: liability.proximaFechaPago,
      title: `Pago pasivo · ${liability.nombre}`,
      amount: liability.pagoMensual,
      description: 'Pago programado.',
      type: 'recordatorio' as const,
      source: 'liability' as const,
      sourceType: 'liability-payment' as const,
      sourceId: liability.id,
      editable: false,
      deletable: false,
      startDateTime: buildIsoDateTime(liability.proximaFechaPago)
    }));


  const goalEvents: CalendarItem[] = goals.map((goal) => ({
    id: `goal-${goal.id}`,
    date: goal.fechaObjetivo,
    title: `Vencimiento de meta · ${goal.nombre}`,
    description: goal.descripcion,
    amount: goal.objetivo,
    type: 'recordatorio',
    source: 'goal',
    sourceType: 'goal-reminder',
    sourceId: goal.id,
    editable: false,
    deletable: false,
    startDateTime: buildIsoDateTime(goal.fechaObjetivo)
  }));

  const manualNormalized = manualEvents.map((event) => ({
    ...event,
    sourceType: event.sourceType ?? (event.syncToGoogleCalendar ? 'google-synced' : 'manual'),
    editable: event.editable ?? true,
    deletable: event.deletable ?? true,
    googleCalendarStatus: event.googleCalendarStatus ?? 'none',
    reminderConfig: event.reminderConfig ?? 'none',
    startDateTime: event.startDateTime ?? buildIsoDateTime(event.date)
  }));

  const merged = [...manualNormalized, ...incomeEvents, ...expenseEvents, ...assetEvents, ...liabilityEvents, ...goalEvents];

  return merged.sort((a, b) => {
    const left = a.startDateTime ?? `${a.date}T00:00:00.000Z`;
    const right = b.startDateTime ?? `${b.date}T00:00:00.000Z`;
    return left < right ? -1 : 1;
  });
}
