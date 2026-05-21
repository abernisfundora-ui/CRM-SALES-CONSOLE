'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getActiveMainNavigationHref, mainNavigation } from '@/lib/config/main-navigation';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/providers/LanguageProvider';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const activeSection = getActiveMainNavigationHref(pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.10] bg-[linear-gradient(180deg,#06233A_0%,#04131F_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.22),0_-10px_28px_rgba(47,61,31,0.32)] pb-[calc(env(safe-area-inset-bottom)+0.28rem)] pt-1 backdrop-blur-[10px] lg:hidden">
      <ul className="mx-auto grid w-full max-w-4xl grid-cols-7 gap-1 px-2 md:px-4">
        {mainNavigation.map((item) => {
          const isActive = activeSection === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex min-h-[44px] min-w-0 flex-col items-center justify-end gap-0.5 rounded-xl border px-0.5 pb-0.5 pt-0.5 text-[clamp(9px,2vw,10px)] font-medium transition-colors ds-focus',
                  isActive
                    ? 'border-[#D6B25E]/30 bg-[linear-gradient(180deg,rgba(22,85,57,0.52),rgba(214,178,94,0.10))] text-white shadow-[0_0_18px_rgba(214,178,94,0.12)]'
                    : 'border-transparent bg-transparent text-[#F8FAFC] hover:bg-white/[0.10] hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'flex h-5.5 w-5.5 items-center justify-center',
                    isActive ? 'text-[#D6B25E]' : 'text-[#F8FAFC]'
                  )}
                >
                  <NavIcon route={item.href} />
                </span>
                <span className={cn('min-w-0 text-center leading-[1.1]', isActive ? 'text-white' : 'text-[#F8FAFC]')}>{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavIcon({ route }: { route: string }) {
  const baseProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-5 w-5 drop-shadow-[0_1px_8px_rgba(248,250,252,0.12)]'
  };

  switch (route) {
    case '/':
      return (
        <svg {...baseProps}>
          <path d="M4.5 10.5 12 4l7.5 6.5" />
          <path d="M6.5 9.5V19h11V9.5" />
          <path d="M10 19v-5.5h4V19" />
        </svg>
      );
    case '/assets':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 4.5v7.5l5.5 3.2" />
        </svg>
      );
    case '/liabilities':
      return (
        <svg {...baseProps}>
          <rect x="4.25" y="6.5" width="15.5" height="11" rx="2.25" />
          <path d="M4.75 10.25h14.5" />
          <path d="M8.25 14.25h3.25" />
        </svg>
      );
    case '/income':
      return (
        <svg {...baseProps}>
          <path d="M5.5 16.5h13" />
          <path d="m7.5 14 4-4 3 3 2.5-3" />
          <path d="M17 10h2v2" />
        </svg>
      );
    case '/expenses':
      return (
        <svg {...baseProps}>
          <path d="M5.5 16.5h13" />
          <path d="m7.5 10 4 4 3-3 2.5 3" />
          <path d="M17 14h2v-2" />
        </svg>
      );
    case '/goals':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case '/calendar':
      return (
        <svg {...baseProps}>
          <rect x="4.5" y="5.5" width="15" height="13" rx="2.2" />
          <path d="M8 4.5v2.5M16 4.5v2.5M4.75 9.5h14.5" />
        </svg>
      );
    default:
      return null;
  }
}
