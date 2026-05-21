import type { ReactNode } from 'react';

export function SectionContainer({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </section>
  );
}
