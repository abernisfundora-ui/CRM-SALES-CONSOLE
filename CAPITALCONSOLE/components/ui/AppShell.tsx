import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">{children}</main>;
}
