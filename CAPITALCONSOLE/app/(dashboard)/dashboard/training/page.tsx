import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';
import { AppCard } from '@/components/ui/AppCard';
export default function TrainingPage(){const modules=useSalesStore.getState().training;return <div className="space-y-4"><PageHeader title="Training" subtitle="Capacitación comercial por módulos y progreso." actionLabel="Asignar módulo" /><div className="grid gap-3 md:grid-cols-2">{modules.map((m)=><AppCard key={m.id}><p className="font-semibold">{m.title}</p><p className="text-sm text-slate-600">{m.status} · {m.progress}%</p><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-amber-400" style={{width:`${m.progress}%`}} /></div></AppCard>)}</div></div>}
