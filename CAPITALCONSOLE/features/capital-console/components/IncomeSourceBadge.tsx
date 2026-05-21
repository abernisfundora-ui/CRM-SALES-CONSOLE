import type { IncomeSourceType } from '@/types/incomes';
import { Pill } from '@/components/ui/Pill';

type IncomeSourceBadgeProps = {
  sourceType: IncomeSourceType;
};

export function IncomeSourceBadge({ sourceType }: IncomeSourceBadgeProps) {
  if (sourceType === 'manual') {
    return <Pill module="income">Ingreso manual</Pill>;
  }

  return <Pill module="assets">Ingreso automatizado desde patrimonio</Pill>;
}
