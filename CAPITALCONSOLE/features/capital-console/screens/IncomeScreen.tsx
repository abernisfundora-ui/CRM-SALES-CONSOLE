'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchBar } from '@/features/capital-console/components/SearchBar';
import { IncomeSummary } from '@/features/capital-console/components/IncomeSummary';
import { IncomeCard } from '@/features/capital-console/components/IncomeCard';
import { useCapitalStore } from '@/store/useCapitalStore';

const sourceFilters = [
  { id: 'all', label: 'Todos' },
  { id: 'manual', label: 'Ingreso manual' },
  { id: 'derived_asset', label: 'Generado desde activos' }
] as const;

export function IncomeScreen() {
  const router = useRouter();
  const incomes = useCapitalStore((state) => state.incomes);
  const deleteIncome = useCapitalStore((state) => state.deleteIncome);
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<(typeof sourceFilters)[number]['id']>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return incomes.filter((income) => {
      const bySource = sourceFilter === 'all' ? true : income.sourceType === sourceFilter;
      const bySearch =
        term.length === 0
          ? true
          : income.nombre.toLowerCase().includes(term) ||
            (income.descripcion?.toLowerCase().includes(term) ?? false) ||
            (income.assetOriginName?.toLowerCase().includes(term) ?? false);

      return bySource && bySearch;
    });
  }, [incomes, query, sourceFilter]);

  return (
    <div className="space-y-3.5 pb-1">
      <IncomeSummary incomes={incomes} />

      <FilterBar className="md:grid-cols-[minmax(220px,0.75fr)_minmax(0,1.25fr)]">
        <SearchBar value={query} onChange={setQuery} />
        <div className="ds-chip-row">
          {sourceFilters.map((filter) => {
            const active = sourceFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSourceFilter(filter.id)}
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
        {filtered.map((income) => (
          <IncomeCard key={income.id} income={income} onEdit={(item) => router.push(`/create/income?id=${item.id}`)} onDelete={deleteIncome} />
        ))}
        {filtered.length === 0 ? (
          <EmptyState title="Sin ingresos visibles" description="Ajusta los filtros o registra un ingreso para mantener completo tu cash flow." />
        ) : null}
      </section>
    </div>
  );
}
