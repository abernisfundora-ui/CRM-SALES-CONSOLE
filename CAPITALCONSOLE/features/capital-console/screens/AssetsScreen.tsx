'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FinancialEntityCard } from '@/components/ui/FinancialEntityCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { AssetsSummary } from '@/features/capital-console/components/AssetsSummary';
import { SearchBar } from '@/features/capital-console/components/SearchBar';
import { AssetCard } from '@/features/capital-console/components/AssetCard';
import type { AssetType } from '@/types/assets';
import type { LiquidAccountItem, LiquidAccountType } from '@/types/liquidAccounts';
import { useCapitalStore } from '@/store/useCapitalStore';

const typeFilters: Array<{ id: 'all' | AssetType | 'other'; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'Propiedad', label: 'Propiedad' },
  { id: 'Vehículo', label: 'Vehículo' },
  { id: 'Inversión', label: 'Inversión' },
  { id: 'Cuenta', label: 'Cuenta' },
  { id: 'other', label: 'Otro' }
];

const accountTypeLabels: Record<LiquidAccountType, string> = {
  cash: 'Efectivo',
  checking: 'Cuenta corriente',
  savings: 'Cuenta de ahorro',
  bank: 'Banco',
  wallet: 'Wallet digital',
  other: 'Otro',
  reserve: 'Reserva'
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('es', { month: 'short', day: 'numeric' });

function isLiquidAccountActive(account: LiquidAccountItem) {
  return (account.estado ?? (account.incluirEnLiquidez ? 'active' : 'inactive')) === 'active' && account.incluirEnLiquidez !== false;
}

function formatOptionalDate(date?: string) {
  if (!date) return undefined;
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? undefined : shortDate.format(parsedDate);
}

export function AssetsScreen() {
  const router = useRouter();
  const assetsState = useCapitalStore((state) => state.assets);
  const liquidAccounts = useCapitalStore((state) => state.liquidAccounts);
  const deleteAsset = useCapitalStore((state) => state.deleteAsset);
  const deleteLiquidAccount = useCapitalStore((state) => state.deleteLiquidAccount);
  const updateLiquidAccount = useCapitalStore((state) => state.updateLiquidAccount);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]['id']>('all');
  const [incomeOnly, setIncomeOnly] = useState(false);

  const visibleLiquidAccounts = useMemo(() => {
    if (incomeOnly || (typeFilter !== 'all' && typeFilter !== 'Cuenta')) return [];
    const term = query.trim().toLowerCase();

    return liquidAccounts.filter((account) => {
      if (!term) return true;
      return account.nombre.toLowerCase().includes(term) ||
        account.tipo.toLowerCase().includes(term) ||
        (account.institucion?.toLowerCase().includes(term) ?? false) ||
        (account.notas?.toLowerCase().includes(term) ?? false);
    });
  }, [incomeOnly, liquidAccounts, query, typeFilter]);

  const assets = useMemo(() => {
    const term = query.trim().toLowerCase();

    return assetsState.filter((asset) => {
      const byType = typeFilter === 'all' ? true : typeFilter === 'other' ? asset.tipo === 'Cripto' || asset.tipo === 'Acciones' : asset.tipo === typeFilter;
      const byIncome = incomeOnly ? asset.generaIngreso : true;
      const bySearch =
        term.length === 0
          ? true
          : asset.nombre.toLowerCase().includes(term) ||
            asset.tipo.toLowerCase().includes(term) ||
            (asset.descripcion?.toLowerCase().includes(term) ?? false) ||
            (asset.notas?.toLowerCase().includes(term) ?? false);

      return byType && byIncome && bySearch;
    });
  }, [assetsState, incomeOnly, query, typeFilter]);

  const hasRegisteredItems = assetsState.length + liquidAccounts.length > 0;
  const hasVisibleItems = assets.length + visibleLiquidAccounts.length > 0;

  return (
    <div className="space-y-4 pb-4 lg:space-y-5">
      <AssetsSummary assets={assetsState} liquidAccounts={liquidAccounts} />

      <FilterBar>
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar" />

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
          onClick={() => setIncomeOnly((prev) => !prev)}
          className="ds-chip"
          data-active={incomeOnly}
        >
          Solo activos que generan ingreso
        </button>
      </FilterBar>

      {hasVisibleItems ? (
        <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visibleLiquidAccounts.map((account) => (
            <LiquidAccountCard
              key={account.id}
              account={account}
              onEdit={(item) => router.push(`/create/account?id=${item.id}`)}
              onDelete={deleteLiquidAccount}
              onToggle={(item) => updateLiquidAccount({ ...item, estado: isLiquidAccountActive(item) ? 'inactive' : 'active', incluirEnLiquidez: !isLiquidAccountActive(item) })}
            />
          ))}
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onEdit={(item) => router.push(`/create/asset?id=${item.id}`)} onDelete={deleteAsset} />
          ))}
        </section>
      ) : (
        <PremiumEmptyState
          title={hasRegisteredItems ? 'Sin activos visibles' : 'Sin activos registrados'}
          description={hasRegisteredItems ? 'Ajusta los filtros para volver a visualizar tu patrimonio.' : 'Agrega tu primer activo para comenzar a construir tu patrimonio.'}
          actionLabel={hasRegisteredItems ? 'Limpiar filtros' : 'Crear activo'}
          onAction={() => {
            if (hasRegisteredItems) {
              setQuery('');
              setTypeFilter('all');
              setIncomeOnly(false);
              return;
            }
            router.push('/create/asset');
          }}
        />
      )}

      <footer className="border-t border-[rgba(47,61,31,0.08)] pt-4 text-center text-[11px] font-semibold text-[#66717A]/72 md:text-left">
        © 2026 Todos los derechos reservados • Desarrollado por Ruben D Hernandez
      </footer>
    </div>
  );
}

function LiquidAccountCard({ account, onEdit, onDelete, onToggle }: { account: LiquidAccountItem; onEdit: (account: LiquidAccountItem) => void; onDelete: (accountId: string) => void; onToggle: (account: LiquidAccountItem) => void }) {
  const active = isLiquidAccountActive(account);
  const updatedAt = formatOptionalDate(account.fechaActualizacion);

  return (
    <FinancialEntityCard
      tone="asset"
      title={account.nombre}
      subtitle={`Cuenta · ${accountTypeLabels[account.tipo]}`}
      badges={[{ label: active ? 'Activa' : 'Inactiva', tone: active ? 'positive' : 'neutral' }]}
      kpiLabel="Saldo actual"
      kpiValue={money.format(account.saldoActual)}
      kpiTone={active ? 'positive' : 'default'}
      meta={[
        { label: 'Liquidez', value: active ? 'Incluida' : 'Excluida', tone: active ? 'positive' : 'default' },
        { label: 'Moneda', value: account.moneda },
        { label: 'Institución', value: account.institucion ?? 'Sin institución' },
        { label: 'Actualizada', value: updatedAt ?? '—' }
      ]}
      tags={[
        { label: 'Líquido' },
        { label: 'No productivo' },
        { label: active ? 'Operativo' : 'Fuera de liquidez', tone: active ? 'positive' : 'neutral' }
      ]}
      actions={[
        { label: 'Editar', onClick: () => onEdit(account) },
        { label: active ? 'Excluir liquidez' : 'Incluir liquidez', onClick: () => onToggle(account) },
        { label: 'Eliminar', onClick: () => onDelete(account.id), destructive: true }
      ]}
      footer={account.notas ? <span>{account.notas}</span> : null}
    />
  );
}

function PremiumEmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <section className="flex min-h-[320px] items-center justify-center rounded-[30px] border border-dashed border-[rgba(47,61,31,0.14)] bg-[linear-gradient(145deg,rgba(255,255,252,0.82),rgba(247,247,244,0.72))] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
      <div className="max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#8FA85A]/20 bg-[#EEF4E1]/72 text-[#2F3D1F] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">◈</div>
        <h2 className="mt-4 text-xl font-black tracking-[-0.045em] text-[#071827]">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#66717A]">{description}</p>
        <button type="button" onClick={onAction} className="mt-5 rounded-full border border-[#D6B25E]/18 bg-[linear-gradient(180deg,#168E4F_0%,#0B7438_100%)] px-5 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(11,116,56,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:shadow-[0_14px_32px_rgba(11,116,56,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]">{actionLabel}</button>
      </div>
    </section>
  );
}
