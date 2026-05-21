'use client';

import { AppCard } from '@/components/ui/AppCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';

export default function TrainingPage() {
  const modules = useSalesStore((state) => state.training);

  return (
    <div className="space-y-4">
      <PageHeader title="Training" subtitle="Capacitación comercial por módulos y progreso." actionLabel="Asignar módulo" />
      <div className="grid gap-3 md:grid-cols-2">
        {modules.map((module) => (
          <AppCard key={module.id}>
            <p className="font-semibold">{module.title}</p>
            <p className="text-sm text-slate-600">{module.status} · {module.progress}%</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-amber-400" style={{ width: `${module.progress}%` }} />
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
