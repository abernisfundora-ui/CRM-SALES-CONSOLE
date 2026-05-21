import type { Role } from './routes';

export const uiPolicies: Record<Role, string[]> = {
  agent: ['sales:read', 'calendar:read', 'profile:read'],
  secretary: ['calendar:read', 'calendar:update', 'tasks:read'],
  manager: ['team:read', 'recruiting:read', 'reports:read'],
  regional: ['region:read', 'map:read', 'comparison:read'],
  owner: ['org:read', 'finance:read'],
  admin: ['all:read']
};
