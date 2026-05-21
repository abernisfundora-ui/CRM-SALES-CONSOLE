import type { ExpenseOriginType } from '@/types/expenses';
import { Pill } from '@/components/ui/Pill';

type ExpenseOriginBadgeProps = {
  originType: ExpenseOriginType;
};

export function ExpenseOriginBadge({ originType }: ExpenseOriginBadgeProps) {
  if (originType === 'manual') {
    return <Pill module="expenses">Gasto manual</Pill>;
  }

  if (originType === 'asset-derived') {
    return <Pill module="assets">Derivado de activo</Pill>;
  }

  return <Pill module="liabilities">Generado desde pasivos</Pill>;
}
