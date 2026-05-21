import '@/styles/globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Capital Console',
  description: 'Dark premium fintech workspace built with Next.js, TypeScript and Tailwind.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
