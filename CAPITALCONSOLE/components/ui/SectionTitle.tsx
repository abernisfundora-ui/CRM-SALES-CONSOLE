import { cn } from '@/lib/cn';

type SectionTitleProps = {
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({ label, title, subtitle, className }: SectionTitleProps) {
  return (
    <header className={cn('space-y-1.5', className)}>
      {label ? <p className="text-xs uppercase tracking-[0.14em] text-ds-muted">{label}</p> : null}
      <h1 className="text-xl font-semibold tracking-tight text-ds-text md:text-2xl">{title}</h1>
      {subtitle ? <p className="text-sm text-ds-muted">{subtitle}</p> : null}
    </header>
  );
}
