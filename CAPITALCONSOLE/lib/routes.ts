export type Role = 'agent' | 'secretary' | 'manager' | 'regional' | 'owner' | 'admin';

export const roleRoutes: Record<Role, { label: string; href: string }[]> = {
  agent: [
    { label: 'Dashboard', href: '/dashboard/agent' },
    { label: 'Calendar', href: '/dashboard/calendar' },
    { label: 'Pipeline', href: '/dashboard/pipeline' },
    { label: 'Contactos', href: '/dashboard/contacts' },
    { label: 'Training', href: '/dashboard/training' },
    { label: 'Profile', href: '/dashboard/profile' }
  ],
  secretary: [
    { label: 'Dashboard', href: '/dashboard/secretary' },
    { label: 'Calendar', href: '/dashboard/calendar' },
    { label: 'Contacts', href: '/dashboard/contacts' }
  ],
  manager: [
    { label: 'Dashboard', href: '/dashboard/manager' },
    { label: 'Performance', href: '/dashboard/performance' },
    { label: 'Recruiting', href: '/dashboard/recruiting' },
    { label: 'Pipeline', href: '/dashboard/pipeline' }
  ],
  regional: [
    { label: 'Dashboard', href: '/dashboard/regional' },
    { label: 'Sales', href: '/dashboard/sales' },
    { label: 'Performance', href: '/dashboard/performance' }
  ],
  owner: [
    { label: 'Dashboard', href: '/dashboard/owner' },
    { label: 'Sales', href: '/dashboard/sales' }
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Training', href: '/dashboard/training' }
  ]
};

export const dashboardRoleMatcher: Array<{ role: Role; path: string }> = [
  { role: 'agent', path: '/dashboard/agent' },
  { role: 'secretary', path: '/dashboard/secretary' },
  { role: 'manager', path: '/dashboard/manager' },
  { role: 'regional', path: '/dashboard/regional' },
  { role: 'owner', path: '/dashboard/owner' },
  { role: 'admin', path: '/dashboard/admin' }
];

export const resolveRoleFromPathname = (pathname: string): Role => {
  const matched = dashboardRoleMatcher.find((item) => pathname.startsWith(item.path));
  return matched?.role ?? 'agent';
};
