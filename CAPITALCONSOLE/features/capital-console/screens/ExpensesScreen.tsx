'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import { ExpensesSummary } from '@/features/capital-console/components/ExpensesSummary';
import { SearchBar } from '@/features/capital-console/components/SearchBar';
import { ExpenseCard } from '@/features/capital-console/components/ExpenseCard';
import type { ExpenseFrequency, ExpenseOriginType } from '@/types/expenses';

const originFilters: Array<{ id: 'all' | ExpenseOriginType; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'manual', label: 'Gasto manual' },
  { id: 'asset-derived', label: 'Derivado de activo' },
  { id: 'liability-derived', label: 'Derivado de pasivo' }
];

const frequencyFilters: Array<{ id: 'all' | ExpenseFrequency; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'mensual', label: 'Mensual' },
  { id: 'trimestral', label: 'Trimestral' },
  { id: 'anual', label: 'Anual' },
  { id: 'quincenal', label: 'Quincenal' },
  { id: 'semanal', label: 'Semanal' }
];

export function ExpensesScreen() {
  const router = useRouter();
  const expensesState = useCapitalStore(capitalSelectors.expenses);
  const deleteExpense = useCapitalStore((state) => state.deleteExpense);
  const [query, setQuery] = useState('');
  const [originFilter, setOriginFilter] = useState<(typeof originFilters)[number]['id']>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<(typeof frequencyFilters)[number]['id']>('all');

  const expenses = useMemo(() => {
    const term = query.trim().toLowerCase();

    return expensesState.filter((item) => {
      const byOrigin = originFilter === 'all' ? true : item.originType === originFilter;
      const byFrequency = frequencyFilter === 'all' ? true : item.frecuencia === frequencyFilter;
      const bySearch =
        term.length === 0
          ? true
          : item.nombre.toLowerCase().includes(term) ||
            item.frecuencia.toLowerCase().includes(term) ||
            (item.descripcion?.toLowerCase().includes(term) ?? false) ||
            (item.liabilityOriginName?.toLowerCase().includes(term) ?? false) ||
            (item.assetOriginName?.toLowerCase().includes(term) ?? false);

      return byOrigin && byFrequency && bySearch;
    });
  }, [expensesState, frequencyFilter, originFilter, query]);

  return (
    <div className="space-y-3.5 pb-1">
      <ExpensesSummary expenses={expensesState} />

      <FilterBar>
        <SearchBar value={query} onChange={setQuery} />

        <div className="ds-chip-row">
          {originFilters.map((filter) => {
            const active = originFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setOriginFilter(filter.id)}
                className="ds-chip"
                data-active={active}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="ds-chip-row">
          {frequencyFilters.map((filter) => {
            const active = frequencyFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFrequencyFilter(filter.id)}
                className="ds-chip"
                data-active={active}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </FilterBar>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} onEdit={(item) => router.push(`/create/expense?id=${item.id}`)} onDelete={deleteExpense} />
        ))}
        {expenses.length === 0 ? (
          <EmptyState title="Sin gastos visibles" description="Ajusta los filtros o registra gastos para entender la presión mensual real." />
        ) : null}
      </section>
    </div>
  );
}
