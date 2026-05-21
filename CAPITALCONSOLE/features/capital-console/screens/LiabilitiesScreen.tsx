'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/ui/FilterBar';
import { LiabilitiesSummary } from '@/features/capital-console/components/LiabilitiesSummary';
import { SearchBar } from '@/features/capital-console/components/SearchBar';
import { LiabilityCard } from '@/features/capital-console/components/LiabilityCard';
import type { LiabilityType } from '@/types/liabilities';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';

const typeFilters: Array<{ id: 'all' | LiabilityType; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'Tarjeta de crédito', label: 'Tarjeta' },
  { id: 'Préstamo', label: 'Préstamo' },
  { id: 'Hipoteca', label: 'Hipoteca' },
  { id: 'Leasing', label: 'Leasing' },
  { id: 'Impuesto', label: 'Impuesto' }
];

export function LiabilitiesScreen() {
  const router = useRouter();
  const liabilitiesState = useCapitalStore(capitalSelectors.liabilities);
  const deleteLiability = useCapitalStore((state) => state.deleteLiability);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]['id']>('all');
  const [expenseOnly, setExpenseOnly] = useState(false);

  const liabilities = useMemo(() => {
    const term = query.trim().toLowerCase();

    return liabilitiesState.filter((item) => {
      const byType = typeFilter === 'all' ? true : item.tipo === typeFilter;
      const byExpense = expenseOnly ? item.generaGasto : true;
      const bySearch =
        term.length === 0
          ? true
          : item.nombre.toLowerCase().includes(term) || item.tipo.toLowerCase().includes(term);

      return byType && byExpense && bySearch;
    });
  }, [expenseOnly, liabilitiesState, query, typeFilter]);

  return (
    <div className="space-y-3.5 pb-1">
      <LiabilitiesSummary liabilities={liabilitiesState} />

      <FilterBar>
        <SearchBar value={query} onChange={setQuery} />

        <div className="ds-chip-row">
          {typeFilters.map((filter) => {
            const active = filter.id === typeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                className="ds-chip"
                data-active={active}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setExpenseOnly((prev) => !prev)}
          className="ds-chip"
          data-active={expenseOnly}
        >
          Solo pasivos que generan gasto
        </button>
      </FilterBar>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {liabilities.map((liability) => (
          <LiabilityCard
            key={liability.id}
            liability={liability}
            onEdit={(item) => router.push(`/create/liability?id=${item.id}`)}
            onDelete={deleteLiability}
          />
        ))}
        {liabilities.length === 0 ? (
          <EmptyState title="Sin pasivos visibles" description="Ajusta los filtros o registra una obligación para monitorear deuda y pagos." />
        ) : null}
      </section>
    </div>
  );
}
