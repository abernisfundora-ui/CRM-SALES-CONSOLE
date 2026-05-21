'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/providers/LanguageProvider';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useFloatingLayer({ open, onOpenChange: setOpen, refs: [menuRef] });

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-10 items-center gap-1.5 rounded-full border border-[rgba(2,21,38,0.08)] bg-white px-3 text-[10px] font-black tracking-[0.1em] text-[#071827] shadow-[0_2px_12px_rgba(2,21,38,0.05)] transition hover:border-[rgba(2,21,38,0.14)] hover:bg-[#FAFAF8] ds-focus'
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t(language === 'es' ? 'language.es' : 'language.en')}
      >
        <span aria-hidden>🌐</span>
        <span>{language.toUpperCase()}</span>
        <span className={cn('text-[9px] text-[#66717A] transition', open ? 'rotate-180' : '')}>▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[5.25rem] rounded-xl border border-[rgba(2,21,38,0.08)] bg-white/95 p-1 text-[#071827] backdrop-blur-md shadow-soft">
          {(['es', 'en'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setLanguage(value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2 py-1 text-[10px] font-semibold tracking-[0.08em] transition ds-focus',
                language === value ? 'bg-[#F3F4F0] text-[#071827]' : 'text-[#51606D] hover:bg-[#F7F7F4]'
              )}
            >
              <span>{value.toUpperCase()}</span>
              <span className="text-[9px]">{value === 'es' ? t('language.es') : t('language.en')}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
