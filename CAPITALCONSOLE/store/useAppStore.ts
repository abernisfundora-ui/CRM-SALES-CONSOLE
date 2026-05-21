'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'dark' | 'light';

type AppState = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme })
    }),
    { name: 'capital-console-app-store' }
  )
);
