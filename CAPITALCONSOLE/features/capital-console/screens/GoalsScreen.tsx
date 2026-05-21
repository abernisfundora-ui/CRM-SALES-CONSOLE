'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import type { GoalItem } from '@/types/goals';

type GoalStatus = 'en progreso' | 'cerca' | 'atrasada' | 'completada';
type GoalFilter = 'activas' | 'completadas' | 'atrasadas' | 'corto plazo' | 'largo plazo';

const filters: GoalFilter[] = ['activas', 'completadas', 'atrasadas', 'corto plazo', 'largo plazo'];
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

function safeDate(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(date: string) {
  const target = safeDate(date);
  if (!target) return null;
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string) {
  const parsed = safeDate(date);
  return parsed ? dateFmt.format(parsed) : 'Sin fecha';
}

function goalProgress(goal: GoalItem) {
  return goal.objetivo > 0 ? Math.min(100, Math.max(0, (goal.actual / goal.objetivo) * 100)) : 0;
}

function goalStatus(goal: GoalItem): GoalStatus {
  const progress = goalProgress(goal);
  const days = daysUntil(goal.fechaObjetivo);
  if (progress >= 100) return 'completada';
  if (days !== null && days < 0) return 'atrasada';
  if (progress >= 75 || (days !== null && days <= 45)) return 'cerca';
  return 'en progreso';
}

function monthsRemaining(goal: GoalItem) {
  const days = daysUntil(goal.fechaObjetivo);
  if (days === null || days <= 0) return 0;
  return Math.max(1, Math.ceil(days / 30));
}

function monthlyNeeded(goal: GoalItem) {
  const remaining = Math.max(0, goal.objetivo - goal.actual);
  const months = monthsRemaining(goal);
  return months > 0 ? remaining / months : remaining;
}

function statusClasses(status: GoalStatus) {
  switch (status) {
    case 'completada':
      return 'bg-emerald-600 text-white';
    case 'atrasada':
      return 'bg-rose-600 text-white';
    case 'cerca':
      return 'bg-amber-500 text-white';
    default:
      return 'bg-[#4A5D32] text-white';
  }
}

function goalInsight(goal: GoalItem, cashFlow: number) {
  const needed = monthlyNeeded(goal);
  const status = goalStatus(goal);
  if (status === 'completada') return 'Meta completada. Puedes reasignar este capital a un nuevo objetivo.';
  if (status === 'atrasada') return `Tu meta está atrasada. Necesitas ahorrar ${money.format(needed)}/mes para recuperarla.`;
  if (cashFlow > needed) return `Vas bien: tu cash flow mensual cubre el aporte sugerido de ${money.format(needed)}.`;
  return `Reduciendo gastos o aumentando ingresos podrías liberar ${money.format(Math.max(0, needed - cashFlow))}/mes adicionales.`;
}

export function GoalsScreen() {
  const goals = useCapitalStore(capitalSelectors.goals);
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const [activeFilter, setActiveFilter] = useState<GoalFilter>('activas');

  const cashFlow = useMemo(
    () => incomes.reduce((acc, item) => acc + item.montoMensual, 0) - expenses.reduce((acc, item) => acc + item.montoMensual, 0),
    [expenses, incomes]
  );

  const summary = useMemo(() => {
    const active = goals.filter((goal) => goalStatus(goal) !== 'completada');
    const target = goals.reduce((acc, goal) => acc + goal.objetivo, 0);
    const current = goals.reduce((acc, goal) => acc + goal.actual, 0);
    const avg = goals.length ? goals.reduce((acc, goal) => acc + goalProgress(goal), 0) / goals.length : 0;
    return { active: active.length, target, current, avg };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const status = goalStatus(goal);
      const days = daysUntil(goal.fechaObjetivo);
      if (activeFilter === 'activas') return status !== 'completada';
      if (activeFilter === 'completadas') return status === 'completada';
      if (activeFilter === 'atrasadas') return status === 'atrasada';
      if (activeFilter === 'corto plazo') return status !== 'completada' && days !== null && days <= 180;
      return status !== 'completada' && (days === null || days > 180);
    });
  }, [activeFilter, goals]);

  return (
    <div className="w-full space-y-4 text-[#10170D]">
      <section className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Metas activas" value={String(summary.active)} />
        <SummaryCard label="Capital objetivo total" value={money.format(summary.target)} />
        <SummaryCard label="Capital acumulado" value={money.format(summary.current)} tone="income" />
        <SummaryCard label="Progreso promedio" value={`${summary.avg.toFixed(1)}%`} />
      </section>

      <section className="w-full rounded-[24px] border border-[rgba(47,61,31,0.10)] bg-white/70 p-4 shadow-[0_12px_28px_rgba(47,61,31,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[rgba(47,61,31,0.66)]">Filtros</p>
            <p className="mt-1 text-sm text-[rgba(16,23,13,0.60)]">Organiza tus metas por estado y horizonte.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold capitalize transition ${activeFilter === filter ? 'border-[#4A5D32] bg-[#4A5D32] text-white' : 'border-[rgba(47,61,31,0.14)] bg-[rgba(47,61,31,0.06)] text-[#2F3D1F] hover:bg-[rgba(47,61,31,0.10)]'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {goals.length === 0 ? (
        <section className="w-full rounded-[24px] border border-[rgba(47,61,31,0.10)] bg-white/75 p-8 text-center shadow-[0_12px_28px_rgba(47,61,31,0.08)]">
          <p className="text-lg font-extrabold text-[#10170D]">Aún no tienes metas financieras.</p>
          <p className="mt-2 text-sm text-[rgba(16,23,13,0.62)]">Crea tu primera meta para comenzar a medir progreso, aportes y proyección.</p>
          <Link href="/create/goal" className="ds-btn-primary mx-auto mt-5 w-fit px-5">Crear meta</Link>
        </section>
      ) : filteredGoals.length === 0 ? (
        <section className="w-full rounded-[24px] border border-[rgba(47,61,31,0.10)] bg-white/75 p-8 text-center shadow-[0_12px_28px_rgba(47,61,31,0.08)]">
          <p className="text-lg font-extrabold text-[#10170D]">No hay metas para este filtro.</p>
          <p className="mt-2 text-sm text-[rgba(16,23,13,0.62)]">Prueba con otra categoría para revisar tus objetivos.</p>
        </section>
      ) : (
        <section className="grid w-full gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} cashFlow={cashFlow} />
          ))}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: 'income' }) {
  return (
    <div className={`rounded-[22px] border p-5 shadow-[0_12px_28px_rgba(47,61,31,0.08)] ${tone === 'income' ? 'border-emerald-500/20 bg-emerald-50/80' : 'border-[rgba(47,61,31,0.10)] bg-white/75'}`}>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[rgba(16,23,13,0.58)]">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${tone === 'income' ? 'text-emerald-700' : 'text-[#10170D]'}`}>{value}</p>
    </div>
  );
}

function GoalCard({ goal, cashFlow }: { goal: GoalItem; cashFlow: number }) {
  const progress = goalProgress(goal);
  const status = goalStatus(goal);
  const remaining = Math.max(0, goal.objetivo - goal.actual);
  const needed = monthlyNeeded(goal);

  return (
    <Link href={`/create/goal?id=${goal.id}`} className="group flex h-full flex-col rounded-[26px] border border-[rgba(47,61,31,0.10)] bg-white/75 p-5 text-[#10170D] shadow-[0_12px_28px_rgba(47,61,31,0.08)] transition-shadow hover:shadow-[0_18px_38px_rgba(47,61,31,0.14)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold text-[#10170D]">{goal.nombre}</p>
          <p className="mt-1 text-xs font-semibold text-[rgba(16,23,13,0.58)]">Fecha objetivo · {formatDate(goal.fechaObjetivo)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${statusClasses(status)}`}>{status}</span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold text-[rgba(16,23,13,0.62)]">
          <span>Progreso</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[rgba(47,61,31,0.12)]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#8FA85A] to-[#4A5D32] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MiniStat label="Objetivo" value={money.format(goal.objetivo)} />
        <MiniStat label="Actual" value={money.format(goal.actual)} />
        <MiniStat label="Restante" value={money.format(remaining)} />
      </div>

      <div className="mt-5 rounded-[18px] border border-[rgba(47,61,31,0.10)] bg-[rgba(47,61,31,0.04)] p-4">
        <p className="text-xs font-bold text-[rgba(16,23,13,0.66)]">Insight automático</p>
        <p className="mt-1 text-sm font-semibold leading-5 text-[#2F3D1F]">{goalInsight(goal, cashFlow)}</p>
        <p className="mt-2 text-xs text-[rgba(16,23,13,0.52)]">Aporte sugerido: {money.format(needed)}/mes</p>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[rgba(47,61,31,0.10)] bg-white/80 p-3">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.10em] text-[rgba(16,23,13,0.50)]">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-[#10170D]">{value}</p>
    </div>
  );
}

export const goalAnalytics = {
  daysUntil,
  formatDate,
  goalInsight,
  goalProgress,
  goalStatus,
  money,
  monthlyNeeded,
  monthsRemaining,
  statusClasses
};
