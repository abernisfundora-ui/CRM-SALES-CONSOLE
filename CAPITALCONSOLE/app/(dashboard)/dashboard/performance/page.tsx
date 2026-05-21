import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';
import { RepPerformanceCard } from '@/components/team/RepPerformanceCard';
export default function PerformancePage(){const reps=useSalesStore.getState().team;return <div className="space-y-4"><PageHeader title="Performance" subtitle="KPIs por vendedor, manager y equipo." actionLabel="Exportar reporte" /><div className="grid gap-3 md:grid-cols-2">{reps.map((rep)=><RepPerformanceCard key={rep.id} rep={rep} />)}</div></div>}
