import type { ReactNode } from 'react';

export type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function ScreenHeader({ eyebrow, title, description, actions }: ScreenHeaderProps) {
  return (
    <header className="ds-page-header">
      <div className="min-w-0">
        <p className="ds-page-eyebrow">{eyebrow}</p>
        <h1 className="ds-page-title">{title}</h1>
        <p className="ds-page-description">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
