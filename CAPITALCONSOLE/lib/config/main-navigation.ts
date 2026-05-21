import type { ModuleKind } from '@/types/design-system';
import type { TranslationKey } from '@/lib/i18n/dictionary';

export type MainNavItem = {
  labelKey: TranslationKey;
  href: '/' | '/assets' | '/liabilities' | '/income' | '/expenses' | '/goals' | '/calendar';
  module: ModuleKind;
  newLabelKey: TranslationKey;
};

export const mainNavigation: MainNavItem[] = [
  { labelKey: 'nav.home', href: '/', module: 'calendar', newLabelKey: 'action.new' },
  { labelKey: 'nav.assets', href: '/assets', module: 'assets', newLabelKey: 'action.newAsset' },
  { labelKey: 'nav.liabilities', href: '/liabilities', module: 'liabilities', newLabelKey: 'action.newLiability' },
  { labelKey: 'nav.income', href: '/income', module: 'income', newLabelKey: 'action.newIncome' },
  { labelKey: 'nav.expenses', href: '/expenses', module: 'expenses', newLabelKey: 'action.newExpense' },
  { labelKey: 'nav.goals', href: '/goals', module: 'calendar', newLabelKey: 'action.newEvent' },
  { labelKey: 'nav.calendar', href: '/calendar', module: 'calendar', newLabelKey: 'action.newEvent' }
];

export function getActiveMainNavigationHref(pathname: string): MainNavItem['href'] | null {
  if (pathname === '/') return mainNavigation[0].href;

  const matched = mainNavigation.find((item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
  return matched?.href ?? null;
}

export function resolveMainNavigationItem(pathname: string): MainNavItem {
  const activeHref = getActiveMainNavigationHref(pathname);
  return mainNavigation.find((item) => item.href === activeHref) ?? mainNavigation[0];
}
