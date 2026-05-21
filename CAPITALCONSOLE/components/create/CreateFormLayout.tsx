import type { ReactNode } from 'react';
import Link from 'next/link';

type CreateFormAccent = 'asset' | 'liability' | 'income' | 'expense' | 'goal' | 'event' | 'liquid';

type CreateFormLayoutProps = {
  title: string;
  subtitle: string;
  accent?: CreateFormAccent;
  children: ReactNode;
};

export function CreateFormLayout({ title, subtitle, accent = 'asset', children }: CreateFormLayoutProps) {
  return (
    <section className="create-form-shell" data-accent={accent}>
      <header className="create-form-header">
        <p className="create-form-kicker">Creación dedicada</p>
        <h1 className="create-form-title">{title}</h1>
        <p className="create-form-subtitle">{subtitle}</p>
        <Link href="/" className="create-form-back">
          ← Volver al inicio
        </Link>
      </header>
      <div className="create-form-body">{children}</div>
    </section>
  );
}
