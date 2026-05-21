'use client';

import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getActiveMainNavigationHref, mainNavigation } from '@/lib/config/main-navigation';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAppStore } from '@/store/useAppStore';
import { useCapitalStore } from '@/store/useCapitalStore';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';
import { PremiumFloatingPanel } from '@/components/ui/PremiumFloatingPanel';

const CAPITAL_CONSOLE_LOGO_SRC = '/images/capital-console-logo-transparent.webp';

export function DesktopSidebar() {
  const pathname = usePathname();
  const activeSection = getActiveMainNavigationHref(pathname);
  const { t, language, setLanguage } = useLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [logoFailed, setLogoFailed] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const resetData = useCapitalStore((state) => state.resetData);

  useFloatingLayer({ open: profileOpen, onOpenChange: setProfileOpen, refs: [profileMenuRef], closeOnRouteChangeKey: pathname });

  const exportData = () => {
    if (typeof window === 'undefined') return;
    const payload = window.localStorage.getItem('capital-console-store-v2') ?? '{}';
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `capital-console-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File | undefined) => {
    if (!file || typeof window === 'undefined') return;

    try {
      const text = await file.text();
      JSON.parse(text);
      window.localStorage.setItem('capital-console-store-v2', text);
      window.location.reload();
    } catch {
      window.alert('No se pudo importar el archivo. Verifica que sea un JSON válido de Capital Console.');
    }
  };

  const resetLocalData = () => {
    if (typeof window !== 'undefined' && !window.confirm('¿Seguro que quieres reiniciar los datos locales? Esta acción no se puede deshacer.')) return;
    resetData();
    setProfileOpen(false);
  };

  return (
    <aside className="hidden lg:flex lg:h-full lg:w-[248px] lg:min-w-[248px] lg:max-w-[248px] lg:flex-col lg:border-r lg:border-white/[0.08] lg:bg-[linear-gradient(180deg,#04111D_0%,#06233A_48%,#04131F_100%)] lg:px-4 lg:pb-5 lg:pt-5 lg:relative lg:isolate lg:overflow-hidden lg:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04),12px_0_36px_rgba(2,21,38,0.18)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_76%_76%,rgba(78,141,100,0.24),transparent_36%),linear-gradient(115deg,rgba(255,255,255,0.07),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="mb-6 rounded-[24px] border border-white/[0.12] bg-[linear-gradient(145deg,rgba(255,255,255,0.115),rgba(214,178,94,0.045)_48%,rgba(255,255,255,0.035))] px-3 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_36px_rgba(0,0,0,0.22)]">
        {/* Place the final transparent logo manually at /public/images/capital-console-logo-transparent.webp. */}
        {!logoFailed ? (
          <Image
            src={CAPITAL_CONSOLE_LOGO_SRC}
            alt="Capital Console"
            width={144}
            height={144}
            priority
            className="mb-3 h-[78px] w-auto object-contain drop-shadow-[0_14px_30px_rgba(214,178,94,0.16)]"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="mb-3 block text-3xl font-black tracking-[-0.08em] text-[#D6B25E] drop-shadow-[0_14px_30px_rgba(214,178,94,0.16)]" aria-label="Capital Console">
            CC
          </span>
        )}
        <p className="text-[13px] font-black uppercase tracking-[0.15em] text-white">Capital Console</p>
        <p className="mt-1.5 text-[9px] font-bold tracking-[0.14em] text-[#D6B25E]/85 drop-shadow-[0_1px_10px_rgba(214,178,94,0.18)]">Executive Wealth Workspace</p>
      </div>

      <nav className="flex-1">
        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#F8FAFC]/75">Navegación</p>
        <ul className="space-y-1.5">
          {mainNavigation.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex h-11 items-center gap-3 rounded-[16px] border px-3 text-[13.5px] font-semibold tracking-[-0.005em] transition duration-200',
                    isActive
                      ? 'border-[#D6B25E]/35 bg-[linear-gradient(90deg,rgba(22,85,57,0.58),rgba(214,178,94,0.11))] text-white shadow-[0_16px_34px_rgba(4,50,29,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_0_24px_rgba(214,178,94,0.08)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#D6B25E] after:absolute after:inset-[1px] after:rounded-[15px] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)] after:content-[""]'
                      : 'border-transparent text-[#F8FAFC] hover:border-[#D6B25E]/20 hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  <span className={cn('relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] transition', isActive ? 'border border-[#D6B25E]/22 bg-[#D6B25E]/12 text-[#D6B25E] shadow-[0_8px_22px_rgba(214,178,94,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]' : 'text-[#F8FAFC] group-hover:bg-white/[0.08] group-hover:text-[#D6B25E]')}>
                    {iconFor(item.href)}
                  </span>
                  <span className={cn('relative z-10 leading-tight', isActive ? 'text-white' : 'text-[#F8FAFC]')}>{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-6 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#F8FAFC]/75">Inteligencia</p>
        <ul className="space-y-1.5">
          <IntelligenceLink href="/reports" active={pathname === '/reports'} icon={<ReportIcon />} label="Reportes" />
          <IntelligenceLink href="/projection" active={pathname === '/projection'} icon={<ProjectionIcon />} label="Proyección" />
        </ul>
      </nav>

      <div ref={profileMenuRef} className="relative mt-5">
        {profileOpen ? (
          <PremiumFloatingPanel
            role="dialog"
            aria-label="Menú de perfil"
            className="absolute inset-x-0 bottom-[calc(100%+0.72rem)] z-[80] max-h-[min(365px,calc(100vh-8rem))] overflow-y-auto overflow-x-hidden p-3.5"
          >
            <ProfileMenuSection title="Cuenta">
              <div className="rounded-[15px] border border-[#D6B25E]/12 bg-white/[0.045] px-3 py-2.5">
                <p className="truncate text-[13px] font-black text-white/92">Rubén Vargas</p>
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#D6B25E]/72">Executive Member</p>
              </div>
            </ProfileMenuSection>

            <ProfileMenuSection title="Preferencias">
              <ProfileSegmentedControl
                label="Idioma"
                options={[{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }]}
                value={language}
                onChange={(value) => setLanguage(value as 'es' | 'en')}
              />
              <ProfileSegmentedControl
                label="Tema"
                options={[{ label: 'Claro', value: 'light' }, { label: 'Oscuro', value: 'dark' }]}
                value={theme}
                onChange={(value) => setTheme(value as 'light' | 'dark')}
              />
              <div className="flex items-center justify-between gap-3 rounded-[13px] px-2.5 py-1.5 text-[12px] font-bold text-white/88">
                <span>Moneda</span>
                <button type="button" onClick={() => setCurrency('USD')} className="rounded-full border border-[#D6B25E]/24 bg-[#D6B25E]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#F2D98A] transition-colors hover:bg-[#D6B25E]/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B25E]">{currency}</button>
              </div>
            </ProfileMenuSection>

            <ProfileMenuSection title="Datos" isLast>
              <ProfileMenuAction label="Exportar datos" value="JSON" onClick={exportData} />
              <ProfileMenuAction label="Importar datos" value="Archivo" onClick={() => importInputRef.current?.click()} />
              <ProfileMenuAction label="Reiniciar datos locales" value="Confirmar" tone="danger" onClick={resetLocalData} />
            </ProfileMenuSection>
          </PremiumFloatingPanel>
        ) : null}
        <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { void importData(event.target.files?.[0]); event.currentTarget.value = ''; }} />
        <button type="button" aria-haspopup="dialog" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.16] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.055))] p-3 text-left shadow-[0_16px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition hover:border-white/[0.16] hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B25E]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C7A85B]/28 bg-[linear-gradient(145deg,rgba(199,168,91,0.22),rgba(10,122,47,0.18))] text-sm font-black text-[#E8D49A]">RV</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black text-white">Rubén Vargas</span>
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">Executive Member</span>
          </span>
          <span className={cn('text-white/70 transition', profileOpen ? 'rotate-180' : '')}>⌃</span>
        </button>
      </div>
    </aside>
  );
}

function IntelligenceLink({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'group relative flex h-11 items-center gap-3 rounded-[16px] border px-3 text-[13.5px] font-semibold tracking-[-0.005em] transition duration-200',
          active
            ? 'border-[#D6B25E]/35 bg-[linear-gradient(90deg,rgba(22,85,57,0.58),rgba(214,178,94,0.11))] text-white shadow-[0_16px_34px_rgba(4,50,29,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_0_24px_rgba(214,178,94,0.08)] before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#D6B25E] after:absolute after:inset-[1px] after:rounded-[15px] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)] after:content-[""]'
            : 'border-transparent text-[#F8FAFC] hover:border-[#D6B25E]/20 hover:bg-white/[0.08] hover:text-white'
        )}
      >
        <span className={cn('relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] transition', active ? 'border border-[#D6B25E]/22 bg-[#D6B25E]/12 text-[#D6B25E] shadow-[0_8px_22px_rgba(214,178,94,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]' : 'text-[#F8FAFC] group-hover:bg-white/[0.08] group-hover:text-[#D6B25E]')}>
          {icon}
        </span>
        <span className={cn('relative z-10', active ? 'text-white' : 'text-[#F8FAFC]')}>{label}</span>
      </Link>
    </li>
  );
}

function ProfileMenuSection({ title, children, isLast = false }: { title: string; children: ReactNode; isLast?: boolean }) {
  return (
    <section className={cn('space-y-1.5 pb-2.5', isLast ? 'pb-0' : 'mb-2.5 border-b border-[rgba(143,168,90,0.12)]')}>
      <p className="px-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#D6B25E]/62">{title}</p>
      {children}
    </section>
  );
}

function ProfileMenuAction({ label, value, onClick, tone = 'default' }: { label: string; value: string; onClick: () => void; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-[13px] border border-transparent px-2.5 py-2 text-left text-[12px] font-bold text-white/88 transition-colors hover:border-[rgba(143,168,90,0.14)] hover:bg-[rgba(143,168,90,0.08)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B25E]"
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.10em] transition', tone === 'danger' ? 'border-red-300/22 bg-red-400/10 text-red-200 group-hover:bg-red-400/15' : 'border-[#D6B25E]/12 bg-white/[0.045] text-white/58 group-hover:text-[#F2D98A]/86')}>{value}</span>
    </button>
  );
}

function ProfileSegmentedControl({ label, options, value, onChange }: { label: string; options: Array<{ label: string; value: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-[64px_1fr] items-center gap-2 rounded-[14px] px-2 py-1.5">
      <p className="text-[12px] font-bold text-white/88">{label}</p>
      <div className="grid grid-cols-2 gap-1 rounded-[12px] border border-[rgba(143,168,90,0.14)] bg-white/[0.035] p-1">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'min-w-0 rounded-[10px] px-2 py-1.5 text-[11px] font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B25E]',
                active ? 'bg-[#0A7A2F]/90 text-white shadow-[0_6px_14px_rgba(10,122,47,0.20)]' : 'text-white/62 hover:bg-[rgba(143,168,90,0.10)] hover:text-white'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SvgIcon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" className="h-[20px] w-[20px] drop-shadow-[0_1px_8px_rgba(248,250,252,0.12)]" aria-hidden>{children}</svg>;
}

function iconFor(route: string) {
  switch (route) {
    case '/':
      return <SvgIcon><path d="M4.5 11.5 12 5l7.5 6.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></SvgIcon>;
    case '/assets':
      return <SvgIcon><path d="M4 18.5h16M6.5 18.5V9l5.5-3 5.5 3v9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></SvgIcon>;
    case '/liabilities':
      return <SvgIcon><path d="M5 7.5h14v10H5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M5 11h14M8 15h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></SvgIcon>;
    case '/income':
      return <SvgIcon><path d="M5 16.5 10 11l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 7h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></SvgIcon>;
    case '/expenses':
      return <SvgIcon><path d="M5 7.5 10 13l3-3 6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 17h4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></SvgIcon>;
    case '/goals':
      return <SvgIcon><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/></SvgIcon>;
    case '/calendar':
      return <SvgIcon><rect x="4.5" y="5.5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 4v3M16 4v3M4.5 10h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></SvgIcon>;
    default:
      return <SvgIcon><circle cx="12" cy="12" r="2" fill="currentColor" /></SvgIcon>;
  }
}

function ReportIcon() {
  return <SvgIcon><path d="M7 4.5h7l3 3v12H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 4.5V8h3M9.5 12h5M9.5 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></SvgIcon>;
}

function ProjectionIcon() {
  return <SvgIcon><path d="M5 17c3-7 5-7 7-2s4 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 10h3V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></SvgIcon>;
}
