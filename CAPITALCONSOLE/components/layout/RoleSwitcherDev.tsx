'use client';

import { usePathname, useRouter } from 'next/navigation';

const ROLE_ROUTES = {
  agent: '/dashboard/agent',
  secretary: '/dashboard/secretary',
  manager: '/dashboard/manager',
  regional: '/dashboard/regional',
  owner: '/dashboard/owner',
  admin: '/dashboard/admin'
} as const;

type RoleKey = keyof typeof ROLE_ROUTES;

const routeToRole = (pathname: string): RoleKey => {
  const matched = (Object.entries(ROLE_ROUTES) as Array<[RoleKey, string]>).find(([, route]) => pathname.startsWith(route));
  return matched?.[0] ?? 'agent';
};

export default function RoleSwitcherDev() {
  const router = useRouter();
  const pathname = usePathname();
  const currentRole = routeToRole(pathname);

  return (
    <label className="flex items-center gap-2 text-xs text-slate-300">
      <span className="hidden md:inline">Role</span>
      <select
        aria-label="Switch dashboard role"
        className="rounded-lg border border-white/20 bg-brand-700 px-3 py-2 text-sm capitalize outline-none transition-colors focus:border-brand-400"
        value={currentRole}
        onChange={(e) => {
          const key = e.target.value as RoleKey;
          router.push(ROLE_ROUTES[key]);
        }}
      >
        {(Object.keys(ROLE_ROUTES) as RoleKey[]).map((role) => (
          <option key={role} value={role} className="capitalize">
            {role}
          </option>
        ))}
      </select>
    </label>
  );
}
