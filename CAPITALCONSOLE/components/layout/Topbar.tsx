import { Breadcrumbs } from './Breadcrumbs';
import RoleSwitcherDev from './RoleSwitcherDev';

export function Topbar() {
  return (
    <header className="glass-card mb-5 flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <Breadcrumbs />
        <div>
          <p className="subtle-label">Premium UI Shell</p>
          <h1>Dashboard</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-xs text-slate-300 md:block">
          Dev role switch
        </div>
        <RoleSwitcherDev />
      </div>
    </header>
  );
}
