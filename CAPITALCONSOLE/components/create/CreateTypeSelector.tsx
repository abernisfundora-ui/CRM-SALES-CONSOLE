'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';

type CreateOption = {
  label: string;
  href: string;
};

type CreateTypeSelectorProps = {
  open: boolean;
  onClose: () => void;
  options: CreateOption[];
};

export function CreateTypeSelector({ open, onClose, options }: CreateTypeSelectorProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useFloatingLayer({ open, onOpenChange: (nextOpen) => { if (!nextOpen) onClose(); }, refs: [sheetRef] });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60" onClick={onClose}>
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-white/[0.18] bg-[linear-gradient(180deg,rgba(31,42,23,0.82),rgba(31,42,23,0.70))] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_22px_50px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[18px] backdrop-saturate-150"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-1 text-sm font-semibold text-ds-text">¿Qué deseas crear?</p>
        <p className="mb-3 text-xs text-ds-muted">Selecciona una categoría para abrir su flujo de alta.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              onClick={onClose}
              className="rounded-xl border border-white/[0.12] bg-white/[0.07] px-3 py-3 text-sm font-semibold text-white/[0.94] transition-colors hover:bg-white/[0.14] ds-focus"
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
