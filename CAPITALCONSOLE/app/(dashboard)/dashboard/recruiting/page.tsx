import { PageHeader } from '@/components/ui/PageHeader';
import { AppCard } from '@/components/ui/AppCard';
import { useSalesStore } from '@/store/useSalesStore';
export default function RecruitingPage(){const candidates=useSalesStore.getState().candidates;return <div className="space-y-4"><PageHeader title="Recruiting" subtitle="Pipeline de candidatos comerciales." actionLabel="Nuevo candidato" /><div className="grid gap-3 md:grid-cols-2">{candidates.map((c)=><AppCard key={c.id}><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-600">{c.phone}</p><p className="text-sm text-violet-700">{c.stage}</p></AppCard>)}</div></div>}
