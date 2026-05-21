'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { CalendarItem } from '@/types/calendar';
import type { ExpenseFrequency, ExpenseItem, ExpenseType } from '@/types/expenses';
import type { IncomeFrequency, IncomeItem, IncomeKind } from '@/types/incomes';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import { normalizeCalendarItems } from '@/features/capital-console/lib/normalizeCalendarItems';
import { cn } from '@/lib/cn';

type CalendarFilter = 'all' | 'income' | 'expense' | 'debt' | 'asset_review' | 'goal' | 'reminder' | 'manual';
type QuickModal = 'income' | 'expense' | 'reminder' | null;

type CalendarViewEvent = CalendarItem & {
  financialType: CalendarFilter;
};

type DayModel = {
  key: string;
  inMonth: boolean;
  label: number;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarViewEvent[];
  balance: number;
  hasDebt: boolean;
};

type CalendarNavigationDetail = {
  type: 'previous' | 'next' | 'today' | 'month';
  value?: string;
};


const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const longDateFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayFormatter = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const filterChips: Array<{ id: CalendarFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'income', label: 'Ingresos' },
  { id: 'expense', label: 'Gastos' },
  { id: 'goal', label: 'Metas' },
  { id: 'reminder', label: 'Recordatorios' }
];

const eventStyle: Record<CalendarFilter, { dot: string; soft: string; chip: string; text: string; ring: string; label: string; icon: string }> = {
  all: { dot: 'bg-slate-400', soft: 'bg-slate-50', chip: 'border-[rgba(20,40,30,0.08)] bg-white/75', text: 'text-slate-700', ring: 'ring-slate-200', label: 'Todos', icon: '•' },
  income: { dot: 'bg-emerald-500', soft: 'bg-emerald-50', chip: 'border-emerald-500/14 bg-emerald-50/82', text: 'text-emerald-700', ring: 'ring-emerald-500/20', label: 'Ingreso', icon: '↗' },
  expense: { dot: 'bg-rose-500', soft: 'bg-rose-50', chip: 'border-rose-500/14 bg-rose-50/82', text: 'text-rose-700', ring: 'ring-rose-500/20', label: 'Gasto', icon: '↘' },
  debt: { dot: 'bg-amber-500', soft: 'bg-amber-50', chip: 'border-amber-500/16 bg-amber-50/88', text: 'text-amber-800', ring: 'ring-amber-500/22', label: 'Deuda / Pasivo', icon: '◷' },
  asset_review: { dot: 'bg-sky-500', soft: 'bg-sky-50', chip: 'border-sky-500/14 bg-sky-50/82', text: 'text-sky-700', ring: 'ring-sky-500/20', label: 'Activo', icon: '◇' },
  goal: { dot: 'bg-[#D6B25E]', soft: 'bg-[#FBF4DF]', chip: 'border-[#D6B25E]/22 bg-[#FBF4DF]/88', text: 'text-[#6B5520]', ring: 'ring-[#D6B25E]/22', label: 'Meta', icon: '◆' },
  reminder: { dot: 'bg-violet-500', soft: 'bg-violet-50', chip: 'border-violet-500/14 bg-violet-50/84', text: 'text-violet-700', ring: 'ring-violet-500/20', label: 'Recordatorio', icon: '◌' },
  manual: { dot: 'bg-teal-500', soft: 'bg-teal-50', chip: 'border-teal-500/14 bg-teal-50/84', text: 'text-teal-700', ring: 'ring-teal-500/20', label: 'Manual', icon: '✦' }
};

const frequencyLabels: Record<IncomeFrequency | ExpenseFrequency, string> = {
  una_vez: 'Único',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
  anual: 'Anual'
};

function firstDayOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfGrid(monthStart: Date) {
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(monthStart.getUTCDate() - monthStart.getUTCDay());
  return gridStart;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

function monthInputValue(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function safeAmount(value?: number) {
  return Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;
}

function classifyEvent(event: CalendarItem): CalendarFilter {
  if (event.sourceType === 'liability-payment' || event.source === 'liability') return 'debt';
  if (event.source === 'income') return 'income';
  if (event.source === 'expense') return 'expense';
  if (event.source === 'goal' || event.sourceType === 'goal-reminder') return 'goal';
  if (event.source === 'asset' || event.sourceType === 'asset-review') return 'asset_review';
  if (event.source === 'manual' && event.type === 'recordatorio') return 'reminder';
  if (event.source === 'manual' && event.type === 'ingreso') return 'income';
  if (event.source === 'manual' && event.type === 'gasto') return 'expense';
  return 'manual';
}

function eventOrigin(event: CalendarViewEvent) {
  if (event.sourceType === 'derived-income') return 'Ingreso recurrente';
  if (event.sourceType === 'derived-expense') return 'Gasto derivado';
  if (event.sourceType === 'liability-payment') return 'Pasivo';
  if (event.sourceType === 'goal-reminder') return 'Meta financiera';
  if (event.sourceType === 'asset-review') return 'Revisión de activo';
  if (event.sourceType === 'google-synced') return 'Google Calendar';
  if (event.source === 'income') return 'Ingreso';
  if (event.source === 'expense') return 'Gasto';
  return event.source === 'manual' ? 'Evento manual' : event.source;
}

function eventTime(event: CalendarItem) {
  if (!event.startDateTime || event.allDay) return 'Todo el día';
  const date = new Date(event.startDateTime);
  if (Number.isNaN(date.getTime())) return 'Todo el día';
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(date);
}

function eventImpact(event: CalendarViewEvent) {
  if (event.financialType === 'income') return safeAmount(event.amount);
  if (event.financialType === 'expense' || event.financialType === 'debt') return -safeAmount(event.amount);
  return 0;
}

function calculateDayBalance(events: CalendarViewEvent[]) {
  return events.reduce((total, event) => total + eventImpact(event), 0);
}

function statusForEvent(event: CalendarViewEvent) {
  const today = toDateKey(new Date());
  if (event.date === today) return 'Hoy';
  if (event.date > today) return 'Próximo';
  return 'Histórico';
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CalendarScreen() {
  const router = useRouter();
  const assets = useCapitalStore(capitalSelectors.assets);
  const liabilities = useCapitalStore(capitalSelectors.liabilities);
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const goals = useCapitalStore(capitalSelectors.goals);
  const manualEvents = useCapitalStore(capitalSelectors.manualEvents);
  const addIncome = useCapitalStore((state) => state.addIncome);
  const addExpense = useCapitalStore((state) => state.addExpense);
  const addEvent = useCapitalStore((state) => state.addEvent);
  const deleteEvent = useCapitalStore((state) => state.deleteEvent);

  const [typeFilter, setTypeFilter] = useState<CalendarFilter>('all');
  const [quickModal, setQuickModal] = useState<QuickModal>(null);
  const [success, setSuccess] = useState('');
  const [monthCursor, setMonthCursor] = useState(() => firstDayOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const calendarItems = useMemo<CalendarViewEvent[]>(
    () => normalizeCalendarItems({ incomes, expenses, assets, liabilities, goals, manualEvents }).map((event) => ({ ...event, financialType: classifyEvent(event) })),
    [assets, expenses, goals, incomes, liabilities, manualEvents]
  );

  const monthKey = monthInputValue(monthCursor);
  const monthEvents = useMemo(() => calendarItems.filter((event) => event.date.startsWith(monthKey)), [calendarItems, monthKey]);
  const filteredItems = useMemo(() => (typeFilter === 'all' ? calendarItems : calendarItems.filter((event) => event.financialType === typeFilter)), [calendarItems, typeFilter]);
  const filteredMonthEvents = useMemo(() => filteredItems.filter((event) => event.date.startsWith(monthKey)), [filteredItems, monthKey]);
  const selectedAllEvents = useMemo(() => calendarItems.filter((event) => event.date === selectedDate), [calendarItems, selectedDate]);
  const selectedEvents = useMemo(() => filteredItems.filter((event) => event.date === selectedDate), [filteredItems, selectedDate]);
  const selectedBalance = calculateDayBalance(selectedAllEvents);
  const upcomingTasks = useMemo(() => {
    const today = toDateKey(new Date());
    const sevenDaysAheadDate = new Date();
    sevenDaysAheadDate.setUTCDate(sevenDaysAheadDate.getUTCDate() + 7);
    const sevenDaysAhead = toDateKey(sevenDaysAheadDate);
    const includedTypes: CalendarFilter[] = ['income', 'expense', 'goal', 'reminder'];

    return calendarItems
      .filter((event) => includedTypes.includes(event.financialType) && event.date >= today && event.date <= sevenDaysAhead)
      .sort((a, b) => (a.startDateTime ?? a.date).localeCompare(b.startDateTime ?? b.date));
  }, [calendarItems]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarViewEvent[]>();
    for (const item of filteredItems) {
      const bucket = map.get(item.date) ?? [];
      bucket.push(item);
      map.set(item.date, bucket);
    }
    for (const [date, events] of map.entries()) {
      map.set(date, events.sort((a, b) => (a.startDateTime ?? a.date).localeCompare(b.startDateTime ?? b.date)));
    }
    return map;
  }, [filteredItems]);

  const allEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarViewEvent[]>();
    for (const item of calendarItems) map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return map;
  }, [calendarItems]);

  const gridDays = useMemo<DayModel[]>(() => {
    const start = startOfGrid(monthCursor);
    return Array.from({ length: 42 }).map((_, index) => {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + index);
      const key = toDateKey(day);
      const events = eventsByDate.get(key) ?? [];
      const allEvents = allEventsByDate.get(key) ?? [];
      return {
        key,
        inMonth: day.getUTCMonth() === monthCursor.getUTCMonth(),
        label: day.getUTCDate(),
        isToday: key === toDateKey(new Date()),
        isSelected: key === selectedDate,
        events,
        balance: calculateDayBalance(allEvents),
        hasDebt: allEvents.some((event) => event.financialType === 'debt')
      };
    });
  }, [allEventsByDate, eventsByDate, monthCursor, selectedDate]);


  const goToToday = () => {
    const now = new Date();
    setMonthCursor(firstDayOfMonth(now));
    setSelectedDate(toDateKey(now));
  };


  const handleMonthInput = (value: string) => {
    if (!value) return;
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) return;
    const next = new Date(Date.UTC(year, month - 1, 1));
    setMonthCursor(next);
    setSelectedDate(toDateKey(next));
  };

  useEffect(() => {
    const handleCalendarNavigation = (event: Event) => {
      const { type, value } = (event as CustomEvent<CalendarNavigationDetail>).detail;
      if (type === 'today') return goToToday();
      if (value) handleMonthInput(value);
    };

    window.addEventListener('capital-calendar:navigate', handleCalendarNavigation);
    return () => window.removeEventListener('capital-calendar:navigate', handleCalendarNavigation);
  }, []);

  const handleDeleteEvent = async (event: CalendarItem) => {
    if (event.syncToGoogleCalendar) await fetch(`/api/google-calendar/events/${event.id}`, { method: 'DELETE' });
    deleteEvent(event.id);
  };

  return (
    <div className="cc-integrated space-y-3 pb-4 text-[#071827] lg:space-y-4">
      <section className="rounded-[28px] border border-[rgba(20,40,30,0.08)] bg-[rgba(255,255,255,0.78)] p-3 shadow-[0_12px_30px_rgba(2,21,38,0.055),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[14px] md:p-3.5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterChips.map((filter) => <FilterButton key={filter.id} filter={filter} active={typeFilter === filter.id} onClick={() => setTypeFilter(filter.id)} />)}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.48fr)_minmax(320px,0.62fr)]">
        <div className="rounded-[30px] border border-[rgba(20,40,30,0.08)] bg-[rgba(255,255,255,0.80)] p-3 shadow-[0_18px_46px_rgba(2,21,38,0.07),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[14px] md:p-5">
          <div className="flex flex-col gap-1.5 border-b border-[rgba(20,40,30,0.08)] pb-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-2xl font-black tracking-[-0.055em] text-[#071827]">{capitalize(monthFormatter.format(monthCursor))}</h2>
            <p className="text-sm font-semibold text-[#66717A]">{filteredMonthEvents.length} movimiento{filteredMonthEvents.length === 1 ? '' : 's'} visible{filteredMonthEvents.length === 1 ? '' : 's'}</p>
          </div>

          <FinancialMonthGrid days={gridDays} onSelectDate={setSelectedDate} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <DayAgendaPanel
            selectedDate={selectedDate}
            selectedEvents={selectedEvents}
            selectedBalance={selectedBalance}
            onQuickAction={setQuickModal}
            onEdit={(event) => router.push(`/create/event?id=${event.id}`)}
            onDelete={(event) => void handleDeleteEvent(event)}
          />
          <UpcomingTasksPanel
            events={upcomingTasks}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setMonthCursor(firstDayOfMonth(dateFromKey(date)));
            }}
          />
        </aside>
      </section>

      {monthEvents.length === 0 ? (
        <section className="rounded-[26px] border border-dashed border-[rgba(20,40,30,0.14)] bg-white/70 p-6 text-center">
          <p className="text-base font-black text-[#071827]">No hay movimientos registrados este mes.</p>
          <p className="mt-1 text-sm font-semibold text-[#66717A]">Agrega ingresos, gastos o recordatorios para construir tu calendario financiero.</p>
        </section>
      ) : null}

      {success ? <div className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-emerald-300/20 bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(16,185,129,0.30)]">{success}</div> : null}

      {quickModal === 'income' ? <QuickIncomeModal date={selectedDate} onClose={() => setQuickModal(null)} onSave={(payload) => { addIncome(payload); setQuickModal(null); setSuccess('Ingreso rápido guardado.'); window.setTimeout(() => setSuccess(''), 2200); }} /> : null}
      {quickModal === 'expense' ? <QuickExpenseModal date={selectedDate} onClose={() => setQuickModal(null)} onSave={(payload) => { addExpense(payload); setQuickModal(null); setSuccess('Gasto rápido guardado.'); window.setTimeout(() => setSuccess(''), 2200); }} /> : null}
      {quickModal === 'reminder' ? <QuickReminderModal date={selectedDate} onClose={() => setQuickModal(null)} onSave={(payload) => { addEvent(payload); setQuickModal(null); setSuccess('Recordatorio creado.'); window.setTimeout(() => setSuccess(''), 2200); }} /> : null}
    </div>
  );
}

function FilterButton({ filter, active, onClick }: { filter: { id: CalendarFilter; label: string }; active: boolean; onClick: () => void }) {
  const style = eventStyle[filter.id];
  return (
    <button type="button" onClick={onClick} className={cn('flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-px', active ? `${style.chip} ${style.text} shadow-[0_10px_22px_rgba(2,21,38,0.06)]` : 'border-[rgba(20,40,30,0.08)] bg-white/65 text-[#51606D] hover:border-[#8FA85A]/24 hover:bg-white hover:text-[#071827]')}>
      <span className={cn('h-2 w-2 rounded-full', style.dot)} />{filter.label}
    </button>
  );
}

function FinancialMonthGrid({ days, onSelectDate }: { days: DayModel[]; onSelectDate: (date: string) => void }) {
  return (
    <>
      <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase tracking-[0.08em] text-[#79838B] md:gap-2 md:text-[11px]">
        {weekdayLabels.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5 md:gap-2">
        {days.map((day) => <FinancialDayCell key={day.key} day={day} onSelect={() => onSelectDate(day.key)} />)}
      </div>
    </>
  );
}

function FinancialDayCell({ day, onSelect }: { day: DayModel; onSelect: () => void }) {
  const balanceTone = day.balance > 0 ? 'border-emerald-500/16 bg-emerald-50/72' : day.balance < 0 ? 'border-rose-500/16 bg-rose-50/72' : day.hasDebt ? 'border-amber-500/18 bg-amber-50/78' : 'border-[rgba(20,40,30,0.08)] bg-white/70';
  return (
    <button type="button" onClick={onSelect} className={cn('min-h-[82px] rounded-[18px] border p-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-200 hover:-translate-y-0.5 hover:border-[#8FA85A]/28 hover:bg-white hover:shadow-[0_12px_24px_rgba(2,21,38,0.07),inset_0_1px_0_rgba(255,255,255,0.88)] md:min-h-[116px] md:p-2', balanceTone, !day.inMonth ? 'opacity-45' : '', day.isToday ? 'ring-2 ring-emerald-500/18' : '', day.isSelected ? 'border-[#8FA85A]/45 bg-[#F7FAF1] shadow-[0_0_0_2px_rgba(143,168,90,0.12),0_18px_36px_rgba(47,61,31,0.10)]' : '')}>
      <div className="flex items-start justify-between gap-1">
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-black md:h-7 md:w-7', day.isSelected ? 'bg-[#2F3D1F] text-white' : day.isToday ? 'bg-emerald-50 text-emerald-700' : 'text-[#334155]')}>{day.label}</span>
        <div className="flex flex-col items-end gap-1">
          {day.isToday ? <span className="hidden rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 md:inline">Hoy</span> : null}
          {day.events.length > 0 ? <span className="text-[10px] font-black text-[#8A949B]">{day.events.length}</span> : null}
        </div>
      </div>
      {day.balance !== 0 ? <p className={cn('mt-1 truncate text-[10px] font-black md:text-[11px]', day.balance >= 0 ? 'text-emerald-700' : 'text-rose-700')}>{day.balance > 0 ? '+' : ''}{money.format(day.balance)}</p> : null}
      <div className="mt-1.5 space-y-1">
        {day.events.slice(0, 2).map((event) => {
          const style = eventStyle[event.financialType];
          return <div key={event.id} className={cn('flex items-center gap-1 rounded-lg border px-1.5 py-1', style.chip)}><span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} /><span className={cn('truncate text-[9px] font-bold md:text-[10px]', style.text)}>{event.title}</span></div>;
        })}
        {day.events.length > 2 ? <p className="pl-1 text-[10px] font-black text-[#79838B]">+{day.events.length - 2} más</p> : null}
      </div>
    </button>
  );
}

function DayAgendaPanel({ selectedDate, selectedEvents, selectedBalance, onQuickAction, onEdit, onDelete }: { selectedDate: string; selectedEvents: CalendarViewEvent[]; selectedBalance: number; onQuickAction: (modal: QuickModal) => void; onEdit: (event: CalendarViewEvent) => void; onDelete: (event: CalendarViewEvent) => void }) {
  const groups: Array<{ type: CalendarFilter; title: string; events: CalendarViewEvent[] }> = [
    { type: 'income', title: 'Ingresos', events: selectedEvents.filter((event) => event.financialType === 'income') },
    { type: 'expense', title: 'Gastos', events: selectedEvents.filter((event) => event.financialType === 'expense') },
    { type: 'debt', title: 'Deudas / Pasivos', events: selectedEvents.filter((event) => event.financialType === 'debt') },
    { type: 'reminder', title: 'Recordatorios', events: selectedEvents.filter((event) => event.financialType === 'reminder') },
    { type: 'goal', title: 'Metas', events: selectedEvents.filter((event) => event.financialType === 'goal') },
    { type: 'manual', title: 'Otros', events: selectedEvents.filter((event) => ['manual', 'asset_review'].includes(event.financialType)) }
  ];
  return (
    <section className="rounded-[28px] border border-[rgba(20,40,30,0.08)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_18px_44px_rgba(2,21,38,0.07),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[14px] md:p-5">
      <div className="border-b border-[rgba(20,40,30,0.08)] pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#071827]">Agenda del día</p>
            <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#071827]">{capitalize(longDateFormatter.format(dateFromKey(selectedDate)))}</h3>
          </div>
          <span className="rounded-full border border-[rgba(20,40,30,0.08)] bg-white/70 px-2.5 py-1 text-xs font-black text-[#51606D]">{selectedEvents.length}</span>
        </div>
        <div className="mt-4 rounded-[20px] border border-[rgba(20,40,30,0.08)] bg-white/66 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#79838B]">Balance del día</p>
          <p className={cn('mt-1 text-2xl font-black tracking-[-0.05em]', selectedBalance >= 0 ? 'text-emerald-700' : 'text-rose-700')}>{selectedBalance > 0 ? '+' : ''}{money.format(selectedBalance)}</p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <button type="button" className="rounded-full border border-emerald-500/14 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100/70" onClick={() => onQuickAction('income')}>+ Ingreso rápido</button>
          <button type="button" className="rounded-full border border-rose-500/14 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100/70" onClick={() => onQuickAction('expense')}>- Gasto rápido</button>
          <button type="button" className="rounded-full border border-violet-500/14 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 transition hover:bg-violet-100/70" onClick={() => onQuickAction('reminder')}>Recordatorio</button>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {selectedEvents.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[rgba(20,40,30,0.14)] bg-white/64 p-5 text-center">
            <p className="text-sm font-black text-[#071827]">No tienes eventos para este día.</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#66717A]">Registra un ingreso, gasto o recordatorio para mantener visible una fecha importante.</p>
          </div>
        ) : groups.filter((group) => group.events.length > 0).map((group) => <EventGroup key={group.title} group={group} onEdit={onEdit} onDelete={onDelete} />)}
      </div>
    </section>
  );
}


function UpcomingTasksPanel({ events, onSelectDate }: { events: CalendarViewEvent[]; onSelectDate: (date: string) => void }) {
  return (
    <section className="rounded-[28px] border border-[rgba(20,40,30,0.08)] bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_14px_34px_rgba(2,21,38,0.055),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[14px] md:p-5">
      <div className="border-b border-[rgba(20,40,30,0.08)] pb-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-[#071827]">Próximas tareas pendientes</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.10em] text-[#79838B]">Próximos 7 días</p>
      </div>
      <div className="mt-4 space-y-2">
        {events.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[rgba(20,40,30,0.14)] bg-white/64 p-5 text-center">
            <p className="text-sm font-black text-[#071827]">No hay tareas pendientes en los próximos 7 días</p>
          </div>
        ) : events.map((event) => (
          <button key={event.id} type="button" onClick={() => onSelectDate(event.date)} className="w-full text-left">
            <AgendaItem event={event} compact />
          </button>
        ))}
      </div>
    </section>
  );
}

function EventGroup({ group, onEdit, onDelete }: { group: { type: CalendarFilter; title: string; events: CalendarViewEvent[] }; onEdit: (event: CalendarViewEvent) => void; onDelete: (event: CalendarViewEvent) => void }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#79838B]"><span className={cn('h-2 w-2 rounded-full', eventStyle[group.type].dot)} />{group.title}</p>
      <div className="space-y-2">{group.events.map((event) => <AgendaItem key={event.id} event={event} onEdit={() => onEdit(event)} onDelete={() => onDelete(event)} />)}</div>
    </div>
  );
}

function AgendaItem({ event, compact = false, onEdit, onDelete }: { event: CalendarViewEvent; compact?: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const style = eventStyle[event.financialType];
  return (
    <article className={cn('rounded-[18px] border p-3 shadow-[0_8px_18px_rgba(2,21,38,0.055)]', style.chip)}>
      <div className="flex items-start gap-3">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(20,40,30,0.08)] bg-white/70 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]', style.text)}>{style.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn('truncate text-sm font-black', style.text)}>{event.title}</p>
              <p className="mt-0.5 text-xs font-semibold text-[#66717A]">{compact ? dayFormatter.format(dateFromKey(event.date)) : eventTime(event)} · {eventOrigin(event)} · {statusForEvent(event)}</p>
            </div>
            {typeof event.amount === 'number' ? <span className={cn('shrink-0 text-xs font-black', style.text)}>{money.format(event.amount)}</span> : null}
          </div>
          {!compact && event.description ? <p className="mt-2 text-xs font-semibold leading-5 text-[#66717A]">{event.description}</p> : null}
          {!compact && (event.editable || event.deletable) ? (
            <div className="mt-2 flex gap-2">
              {event.editable ? <button type="button" className="rounded-full border border-[rgba(20,40,30,0.08)] bg-white/70 px-2.5 py-1 text-xs font-bold text-[#51606D] hover:bg-white" onClick={onEdit}>Editar</button> : null}
              {event.deletable ? <button type="button" className="rounded-full border border-rose-500/16 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100/70" onClick={onDelete}>Eliminar</button> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ModalShell({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/58 p-3 backdrop-blur-sm md:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,28,0.98),rgba(12,20,30,0.94))] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] md:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(20,40,30,0.08)] pb-4">
          <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#D6B25E]/72">Registro rápido</p><h3 className="mt-1 text-2xl font-black tracking-[-0.055em]">{title}</h3><p className="mt-1 text-sm font-semibold text-white/50">{subtitle}</p></div>
          <button type="button" className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-black text-white/68" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block"><span className="text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}{required ? ' *' : ''}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-white outline-none placeholder:text-white/28 [color-scheme:dark]" /></label>;
}

function SelectField<T extends string>({ label, value, onChange, options, getLabel }: { label: string; value: T; onChange: (value: T) => void; options: T[]; getLabel: (value: T) => string }) {
  return <label className="block"><span className="text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-1 h-11 w-full rounded-2xl border border-white/10 bg-[#101820] px-3 text-sm font-bold text-white outline-none">{options.map((option) => <option key={option} value={option}>{getLabel(option)}</option>)}</select></label>;
}

function QuickIncomeModal({ date, onClose, onSave }: { date: string; onClose: () => void; onSave: (payload: IncomeItem) => void }) {
  const [form, setForm] = useState({ title: '', amount: '', origin: '', kind: 'ingreso_manual' as IncomeKind, date, frequency: 'una_vez' as IncomeFrequency, note: '' });
  const [error, setError] = useState('');
  const submit = () => {
    const amount = Number(form.amount);
    if (!form.title.trim()) return setError('El concepto es requerido.');
    if (!form.date) return setError('La fecha es requerida.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('El monto debe ser mayor a 0.');
    onSave({ id: buildId('income'), nombre: form.title.trim(), montoMensual: amount, fecha: form.date, descripcion: form.note, sourceType: 'manual', frequency: form.frequency, origin: form.origin || 'Ingreso rápido', incomeKind: form.kind, grossAmount: amount, incomeAmount: amount, startDate: form.date, incomeStartDate: form.date, nextDate: form.date, status: 'activo', notes: form.note, isRecurring: form.frequency !== 'una_vez' });
  };
  return <ModalShell title="Ingreso rápido" subtitle="Guarda una entrada ligada al día seleccionado." onClose={onClose}><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Concepto" value={form.title} onChange={(title) => setForm((s) => ({ ...s, title }))} required /><Field label="Monto" type="number" value={form.amount} onChange={(amount) => setForm((s) => ({ ...s, amount }))} required /><Field label="Origen / fuente" value={form.origin} onChange={(origin) => setForm((s) => ({ ...s, origin }))} /><Field label="Fecha" type="date" value={form.date} onChange={(nextDate) => setForm((s) => ({ ...s, date: nextDate }))} required /><SelectField label="Tipo" value={form.kind} onChange={(kind) => setForm((s) => ({ ...s, kind }))} options={['empleo', 'negocio', 'freelance', 'renta', 'ingreso_pasivo', 'ingreso_manual', 'otros']} getLabel={(value) => value.replace('_', ' ')} /><SelectField label="Frecuencia" value={form.frequency} onChange={(frequency) => setForm((s) => ({ ...s, frequency }))} options={['una_vez', 'semanal', 'quincenal', 'mensual']} getLabel={(value) => frequencyLabels[value]} /><div className="sm:col-span-2"><Field label="Nota opcional" value={form.note} onChange={(note) => setForm((s) => ({ ...s, note }))} /></div></div>{error ? <p className="mt-3 text-sm font-bold text-rose-200">{error}</p> : null}<div className="mt-5 flex gap-2"><button type="button" className="calendar-action flex-1" onClick={onClose}>Cancelar</button><button type="button" className="flex-1 rounded-full bg-emerald-400 px-4 py-3 text-sm font-black text-[#062014]" onClick={submit}>Guardar ingreso</button></div></ModalShell>;
}

function QuickExpenseModal({ date, onClose, onSave }: { date: string; onClose: () => void; onSave: (payload: ExpenseItem) => void }) {
  const [form, setForm] = useState({ title: '', amount: '', category: 'variable' as ExpenseType, date, frequency: 'una_vez' as ExpenseFrequency, note: '' });
  const [error, setError] = useState('');
  const submit = () => {
    const amount = Number(form.amount);
    if (!form.title.trim()) return setError('El concepto es requerido.');
    if (!form.date) return setError('La fecha es requerida.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('El monto debe ser mayor a 0.');
    onSave({ id: buildId('expense'), nombre: form.title.trim(), monto: amount, montoMensual: amount, fecha: form.date, frecuencia: form.frequency, tipo: form.category, descripcion: form.note, originType: 'manual' });
  };
  return <ModalShell title="Gasto rápido" subtitle="Registra una salida sin abrir el formulario avanzado." onClose={onClose}><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Concepto" value={form.title} onChange={(title) => setForm((s) => ({ ...s, title }))} required /><Field label="Monto" type="number" value={form.amount} onChange={(amount) => setForm((s) => ({ ...s, amount }))} required /><SelectField label="Categoría" value={form.category} onChange={(category) => setForm((s) => ({ ...s, category }))} options={['fijo', 'variable']} getLabel={(value) => value === 'fijo' ? 'Fijo' : 'Variable'} /><Field label="Fecha" type="date" value={form.date} onChange={(nextDate) => setForm((s) => ({ ...s, date: nextDate }))} required /><SelectField label="Frecuencia" value={form.frequency} onChange={(frequency) => setForm((s) => ({ ...s, frequency }))} options={['una_vez', 'semanal', 'quincenal', 'mensual']} getLabel={(value) => frequencyLabels[value]} /><div className="sm:col-span-2"><Field label="Nota opcional" value={form.note} onChange={(note) => setForm((s) => ({ ...s, note }))} /></div></div>{error ? <p className="mt-3 text-sm font-bold text-rose-200">{error}</p> : null}<div className="mt-5 flex gap-2"><button type="button" className="calendar-action flex-1" onClick={onClose}>Cancelar</button><button type="button" className="flex-1 rounded-full bg-rose-300 px-4 py-3 text-sm font-black text-[#2A0710]" onClick={submit}>Guardar gasto</button></div></ModalShell>;
}

function QuickReminderModal({ date, onClose, onSave }: { date: string; onClose: () => void; onSave: (payload: CalendarItem) => void }) {
  const [form, setForm] = useState({ title: '', date, time: '', note: '' });
  const [error, setError] = useState('');
  const submit = () => {
    if (!form.title.trim()) return setError('El título es requerido.');
    if (!form.date) return setError('La fecha es requerida.');
    const startDateTime = form.time ? `${form.date}T${form.time}:00.000Z` : `${form.date}T00:00:00.000Z`;
    onSave({ id: buildId('reminder'), title: form.title.trim(), date: form.date, description: form.note, type: 'recordatorio', source: 'manual', sourceType: 'manual', editable: true, deletable: true, allDay: !form.time, startDateTime, reminderConfig: 'none', googleCalendarStatus: 'none' });
  };
  return <ModalShell title="Recordatorio" subtitle="Crea un recordatorio simple sin impacto automático en Cash Flow." onClose={onClose}><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Título" value={form.title} onChange={(title) => setForm((s) => ({ ...s, title }))} required /><Field label="Fecha" type="date" value={form.date} onChange={(nextDate) => setForm((s) => ({ ...s, date: nextDate }))} required /><Field label="Hora opcional" type="time" value={form.time} onChange={(time) => setForm((s) => ({ ...s, time }))} /><div className="sm:col-span-2"><Field label="Nota opcional" value={form.note} onChange={(note) => setForm((s) => ({ ...s, note }))} /></div></div>{error ? <p className="mt-3 text-sm font-bold text-rose-200">{error}</p> : null}<p className="mt-3 text-xs font-semibold text-white/45">Repetición no está disponible en el modelo actual; este recordatorio se guardará como evento único.</p><div className="mt-5 flex gap-2"><button type="button" className="calendar-action flex-1" onClick={onClose}>Cancelar</button><button type="button" className="flex-1 rounded-full bg-violet-300 px-4 py-3 text-sm font-black text-[#160A2A]" onClick={submit}>Crear recordatorio</button></div></ModalShell>;
}
