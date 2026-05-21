'use client';

import { AppCard } from '@/components/ui/AppCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';

export default function RecruitingPage() {
  const candidates = useSalesStore((state) => state.candidates);

  return (
    <div className="space-y-4">
      <PageHeader title="Recruiting" subtitle="Pipeline de candidatos comerciales." actionLabel="Nuevo candidato" />
      <div className="grid gap-3 md:grid-cols-2">
        {candidates.map((candidate) => (
          <AppCard key={candidate.id}>
            <p className="font-semibold">{candidate.name}</p>
            <p className="text-sm text-slate-600">{candidate.phone}</p>
            <p className="text-sm text-violet-700">{candidate.stage}</p>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
