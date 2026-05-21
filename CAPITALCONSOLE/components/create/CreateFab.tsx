'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';

const createOptions = [
  { label: 'Nuevo activo', href: '/create/asset' },
  { label: 'Nuevo pasivo', href: '/create/liability' },
  { label: 'Nuevo ingreso manual', href: '/create/income' },
  { label: 'Nuevo gasto manual', href: '/create/expense' },
  { label: 'Nueva cuenta / efectivo / banco', href: '/create/account' },
  { label: 'Nuevo recordatorio', href: '/create/event' },
  { label: 'Nueva meta', href: '/create/goal' }
];

export function CreateFab() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useFloatingLayer({ open, onOpenChange: setOpen, refs: [triggerRef, sheetRef] });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Crear nuevo registro"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] right-5 z-[80] flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.22] bg-[linear-gradient(180deg,#20B873,#138A45)] text-white shadow-[0_18px_40px_rgba(19,138,69,0.32),inset_0_1px_0_rgba(255,255,255,0.28)] transition-colors transition-shadow duration-150 ease-out lg:hidden"
      >
        <span className="pointer-events-none -mt-[2px] text-[38px] font-light leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.28)]">+</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)}>
          <div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-0 max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-t-[28px] border border-white/[0.18] bg-[linear-gradient(180deg,rgba(6,35,58,0.96),rgba(4,19,31,0.94))] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_-18px_50px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[18px] backdrop-saturate-150"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/22" />
            <p className="text-[17px] font-bold text-white">¿Qué deseas crear?</p>
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {createOptions.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center rounded-[18px] border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-[16px] font-semibold text-white/[0.96] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
