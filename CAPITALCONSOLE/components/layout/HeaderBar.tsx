'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { ModuleKind } from '@/types/design-system';
import { capitalSelectors, useCapitalStore } from '@/store/useCapitalStore';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';
import { PremiumFloatingPanel } from '@/components/ui/PremiumFloatingPanel';

type HeaderBarProps = {
  module: ModuleKind;
};

const createOptions = [
  { label: 'Nuevo activo', href: '/create/asset' },
  { label: 'Nuevo pasivo', href: '/create/liability' },
  { label: 'Nuevo ingreso', href: '/create/income' },
  { label: 'Nuevo gasto', href: '/create/expense' },
  { label: 'Nueva cuenta / efectivo / banco', href: '/create/account' },
  { label: 'Nuevo recordatorio', href: '/create/event' },
  { label: 'Nueva meta', href: '/create/goal' }
];

const headerCopyByPath: Record<string, { title: string; subtitle: string }> = {
  '/assets': { title: 'Activos', subtitle: 'Gestiona y monitorea tus activos productivos.' },
  '/liabilities': { title: 'Pasivos', subtitle: 'Controla obligaciones, deuda y pagos mensuales.' },
  '/income': { title: 'Ingresos', subtitle: 'Monitorea entradas activas, pasivas y recurrentes.' },
  '/expenses': { title: 'Gastos', subtitle: 'Organiza salidas, pagos fijos y gastos variables.' },
  '/goals': { title: 'Metas', subtitle: 'Visualiza, organiza y alcanza tus objetivos financieros.' },
  '/calendar': { title: 'Calendario Financiero', subtitle: 'Visualiza ingresos, gastos, obligaciones, metas y recordatorios.' },
  '/reports': { title: 'Reportes', subtitle: 'Consulta, imprime y exporta tus estados financieros.' },
  '/projection': { title: 'Proyección', subtitle: 'Simula escenarios futuros con tus datos reales.' }
};

function getHeaderCopy(pathname: string) {
  if (pathname === '/' || pathname === '/dashboard') {
    return {
      title: 'Bienvenido de vuelta, Rubén 👋',
      subtitle: 'Aquí tienes el resumen de tu situación financiera.',
      isHome: true
    };
  }

  const matchedPath = Object.keys(headerCopyByPath).find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return {
    ...(matchedPath ? headerCopyByPath[matchedPath] : { title: 'Capital Console', subtitle: 'Sistema operativo financiero ejecutivo.' }),
    isHome: false
  };
}

function firstCalendarMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthInputValue(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function emitCalendarNavigation(detail: { type: 'previous' | 'next' | 'today' | 'month'; value?: string }) {
  window.dispatchEvent(new CustomEvent('capital-calendar:navigate', { detail }));
}

export function HeaderBar({ module }: HeaderBarProps) {
  void module;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const pathname = usePathname();
  const createTriggerRef = useRef<HTMLButtonElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [calendarMonth, setCalendarMonth] = useState(() => firstCalendarMonth(new Date()));
  const incomes = useCapitalStore(capitalSelectors.incomes);
  const expenses = useCapitalStore(capitalSelectors.expenses);
  const liabilities = useCapitalStore(capitalSelectors.liabilities);
  const goals = useCapitalStore(capitalSelectors.goals);
  const manualEvents = useCapitalStore(capitalSelectors.manualEvents);

  const notifications = useMemo(() => buildNotifications(incomes, expenses, liabilities, goals, manualEvents), [incomes, expenses, liabilities, goals, manualEvents]);
  const unread = notifications.filter((item) => !dismissed.includes(item.id));

  useFloatingLayer({ open: createOpen, onOpenChange: setCreateOpen, refs: [createTriggerRef, createMenuRef], closeOnRouteChangeKey: pathname });
  useFloatingLayer({ open: notificationsOpen, onOpenChange: setNotificationsOpen, refs: [notificationsTriggerRef, notificationsMenuRef], closeOnRouteChangeKey: pathname });

  const closeAll = () => {
    setNotificationsOpen(false);
    setCreateOpen(false);
  };

  const headerCopy = useMemo(() => getHeaderCopy(pathname), [pathname]);
  const isCalendarTopbar = pathname === '/calendar' || pathname.startsWith('/calendar/');
  const calendarMonthValue = monthInputValue(calendarMonth);

  const navigateCalendar = (type: 'previous' | 'next' | 'today') => {
    if (type === 'today') {
      const today = firstCalendarMonth(new Date());
      setCalendarMonth(today);
      emitCalendarNavigation({ type });
      return;
    }

    setCalendarMonth((current) => {
      const next = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + (type === 'next' ? 1 : -1), 1));
      emitCalendarNavigation({ type, value: monthInputValue(next) });
      return next;
    });
  };

  const selectCalendarMonth = (value: string) => {
    if (!value) return;
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) return;
    setCalendarMonth(new Date(Date.UTC(year, month - 1, 1)));
    emitCalendarNavigation({ type: 'month', value });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(2,21,38,0.075)] bg-[rgba(250,250,248,0.88)] shadow-[0_8px_24px_rgba(2,21,38,0.045)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/80 to-transparent" />
      <div className={isCalendarTopbar ? 'mx-auto flex min-h-[64px] w-full max-w-3xl items-center justify-between gap-2.5 px-4 py-2 md:px-6 lg:max-w-[1760px] lg:flex-nowrap lg:px-10 lg:py-3.5 xl:px-12 2xl:px-14' : 'mx-auto flex min-h-[64px] w-full max-w-3xl items-center justify-between gap-3 px-4 py-2 md:px-6 lg:max-w-[1760px] lg:px-10 lg:py-3.5 xl:px-12 2xl:px-14'}>
        <div className={isCalendarTopbar ? 'min-w-0 flex-1' : 'min-w-0 flex-1'}>
          <p className={headerCopy.isHome ? 'truncate text-[18px] font-bold leading-tight tracking-[-0.035em] text-[#071827] sm:text-[22px] lg:text-[26px]' : 'truncate text-[18px] font-bold leading-tight tracking-[-0.035em] text-[#071827] sm:text-[22px] lg:text-[25px]'}>{headerCopy.title}</p>
          <p className="mt-0.5 truncate text-[12px] font-medium leading-tight text-[#66717A] lg:text-[14px]">{headerCopy.subtitle}</p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:gap-2">
          {isCalendarTopbar ? (
            <div className="hidden flex-wrap items-center gap-1.5 rounded-[22px] border border-[rgba(2,21,38,0.075)] bg-white/72 p-1 shadow-[0_8px_18px_rgba(2,21,38,0.045),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur sm:rounded-full lg:flex">
              <button type="button" className="h-8 rounded-full px-3 text-xs font-bold text-[#2F3D1F] transition hover:bg-[#EEF4E1]" onClick={() => navigateCalendar('previous')}>Anterior</button>
              <input type="month" value={calendarMonthValue} onChange={(event) => selectCalendarMonth(event.target.value)} className="h-8 rounded-full border border-[rgba(47,61,31,0.12)] bg-white px-3 text-xs font-extrabold text-[#10170D] outline-none" />
              <button type="button" className="h-8 rounded-full px-3 text-xs font-bold text-[#2F3D1F] transition hover:bg-[#EEF4E1]" onClick={() => navigateCalendar('next')}>Siguiente</button>
              <button type="button" className="h-8 rounded-full border border-[rgba(47,61,31,0.12)] bg-[#F7F7F4] px-3 text-xs font-extrabold text-[#2F3D1F] transition hover:bg-white" onClick={() => navigateCalendar('today')}>Hoy</button>
              <button type="button" className="h-8 rounded-full bg-[#0B7A35] px-4 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(10,122,47,0.16)] transition hover:bg-[#0E8740]" onClick={() => { closeAll(); router.push('/create/event'); }}>Nuevo evento</button>
            </div>
          ) : (
            <button
              ref={createTriggerRef}
              type="button"
              aria-label="+ Nuevo"
              onClick={() => {
                setCreateOpen((p) => !p);
                setNotificationsOpen(false);
              }}
              className="hidden h-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#D6B25E]/18 bg-[linear-gradient(180deg,#168E4F_0%,#0B7438_100%)] px-5 text-sm font-bold tracking-[0.005em] text-white shadow-[0_12px_26px_rgba(11,116,56,0.24),inset_0_1px_0_rgba(255,255,255,0.22)] transition duration-200 ease-out hover:-translate-y-px hover:bg-[linear-gradient(180deg,#1A9B58_0%,#0C7F3F_100%)] hover:shadow-[0_14px_30px_rgba(11,116,56,0.28),inset_0_1px_0_rgba(255,255,255,0.26)] lg:inline-flex"
            >
              <svg viewBox="0 0 24 24" fill="none" className="mr-2 h-[18px] w-[18px]" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>Nuevo</span>
            </button>
          )}
          <button ref={notificationsTriggerRef} type="button" aria-label="Notificaciones" onClick={() => { setNotificationsOpen((prev) => !prev); setCreateOpen(false); }} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(2,21,38,0.075)] bg-white/92 text-[#071827] shadow-[0_8px_18px_rgba(2,21,38,0.055),inset_0_1px_0_rgba(255,255,255,0.88)] transition hover:border-[rgba(2,21,38,0.14)] hover:bg-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden>
              <path d="M12 4.75a4.1 4.1 0 0 0-4.1 4.1v1.9c0 .8-.26 1.58-.72 2.24L6 14.75h12l-1.18-1.76a4.06 4.06 0 0 1-.72-2.24v-1.9A4.1 4.1 0 0 0 12 4.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.1 17.2a2.1 2.1 0 0 0 3.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {unread.length > 0 ? <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#0A7A2F] shadow-[0_0_8px_rgba(10,122,47,0.35)]" /> : null}
          </button>
        </div>
      </div>

      {createOpen ? (
        <PremiumFloatingPanel ref={createMenuRef} className="absolute right-4 top-[calc(100%+0.7rem)] z-[70] w-[min(24rem,92vw)] p-3.5 lg:right-[calc(2.5rem+3rem)] xl:right-[calc(3rem+3rem)] 2xl:right-[calc(3.5rem+3rem)]">
          <div className="pointer-events-none absolute -top-1.5 right-8 h-3 w-3 rotate-45 border-l border-t border-[rgba(143,168,90,0.18)] bg-[rgba(10,18,28,0.92)] backdrop-blur-[18px]" />
          <div className="mb-3 border-b border-[rgba(143,168,90,0.12)] pb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D6B25E]/75">Crear nuevo registro</p>
            <p className="mt-1 text-xs font-medium leading-5 text-white/58">Selecciona el módulo para capturar datos financieros.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {createOptions.map((option) => (
              <Link key={option.href} href={option.href} onClick={closeAll} className="group rounded-[16px] border border-[rgba(143,168,90,0.10)] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-[#F8FAFC]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-colors transition-shadow hover:border-[rgba(143,168,90,0.24)] hover:bg-[rgba(143,168,90,0.10)] hover:text-white hover:shadow-[0_0_22px_rgba(143,168,90,0.10),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FA85A]">
                <span className="flex items-center justify-between gap-3">
                  <span>{option.label}</span>
                  <span className="text-[13px] text-[#8FA85A]/65 transition-colors group-hover:text-[#D6B25E]/80" aria-hidden>＋</span>
                </span>
              </Link>
            ))}
          </div>
        </PremiumFloatingPanel>
      ) : null}

      {notificationsOpen ? (
        <PremiumFloatingPanel ref={notificationsMenuRef} className="absolute right-4 top-[calc(100%+0.62rem)] z-[70] max-h-[min(420px,calc(100vh-6rem))] w-[min(28rem,92vw)] overflow-y-auto p-4 lg:right-10 xl:right-12 2xl:right-14">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#D6B25E]/12 pb-3">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/92">Notificaciones financieras</p>
            <button type="button" onClick={() => setDismissed(notifications.map((item) => item.id))} className="rounded-full border border-[#D6B25E]/15 bg-[#D6B25E]/10 px-2.5 py-1 text-[10px] font-bold text-[#F2D98A] transition-colors hover:bg-[#D6B25E]/16">Marcar todas</button>
          </div>
          {unread.length === 0 ? <p className="rounded-[16px] border border-[rgba(143,168,90,0.10)] bg-white/[0.045] px-3 py-3 text-xs font-medium text-white/66">No tienes notificaciones pendientes.</p> : null}
          <ul className="space-y-2">
            {unread.map((notification) => (
              <li key={notification.id} className="rounded-[16px] border border-[rgba(143,168,90,0.12)] bg-white/[0.045] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
                <p className="text-[12px] font-semibold leading-5 text-white/92">{notification.title}</p>
                <p className="mt-0.5 text-[11px] font-medium text-white/58">{notification.subtitle}</p>
              </li>
            ))}
          </ul>
        </PremiumFloatingPanel>
      ) : null}
    </header>
  );
}

function buildNotifications(
  incomes: Array<{ id: string; nombre: string; fecha: string }>,
  expenses: Array<{ id: string; nombre: string; fecha: string }>,
  liabilities: Array<{ id: string; nombre: string; fechaCorte?: string; fechaPago?: string }>,
  goals: Array<{ id: string; nombre: string; fechaObjetivo?: string }>,
  events: Array<{ id: string; title: string; date: string }>
) {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);
  const entries = [
    ...incomes.map((item) => ({ id: `inc-${item.id}`, title: `Ingreso programado: ${item.nombre}`, date: item.fecha })),
    ...expenses.map((item) => ({ id: `exp-${item.id}`, title: `Gasto programado: ${item.nombre}`, date: item.fecha })),
    ...liabilities.map((item) => ({ id: `lia-${item.id}`, title: `Pago de pasivo: ${item.nombre}`, date: item.fechaPago || item.fechaCorte || '' })),
    ...goals.map((item) => ({ id: `goal-${item.id}`, title: `Meta próxima: ${item.nombre}`, date: item.fechaObjetivo || '' })),
    ...events.map((item) => ({ id: `evt-${item.id}`, title: `Evento: ${item.title}`, date: item.date }))
  ];

  return entries
    .map((item) => {
      const due = new Date(`${item.date}T00:00:00.000Z`);
      if (!item.date || Number.isNaN(due.getTime())) return null;
      if (due < now || due > maxDate) return null;
      const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { id: item.id, title: item.title, subtitle: days <= 0 ? 'Vence hoy' : `Vence en ${days} día${days === 1 ? '' : 's'}` };
    })
    .filter((item): item is { id: string; title: string; subtitle: string } => item !== null)
    .slice(0, 8);
}
