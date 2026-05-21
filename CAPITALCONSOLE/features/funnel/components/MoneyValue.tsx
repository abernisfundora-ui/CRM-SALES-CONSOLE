import { formatCurrency } from '@/features/funnel/lib/format';

export function MoneyValue({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{formatCurrency(value)}</span>;
}
