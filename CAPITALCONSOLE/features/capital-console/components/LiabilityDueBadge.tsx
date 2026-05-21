import { Pill } from '@/components/ui/Pill';

type LiabilityDueBadgeProps = {
  dueDate: string;
};

export function LiabilityDueBadge({ dueDate }: LiabilityDueBadgeProps) {
  const due = new Date(dueDate);
  const today = new Date('2026-04-21');
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return <Pill module="expenses">Vence pronto</Pill>;
  }

  if (diffDays <= 10) {
    return <Pill module="liabilities">Próximo pago</Pill>;
  }

  return <Pill module="calendar" state="inactive">Programado</Pill>;
}
