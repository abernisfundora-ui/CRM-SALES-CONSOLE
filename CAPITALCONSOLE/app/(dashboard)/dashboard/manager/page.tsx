import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';
import { RepPerformanceCard } from '@/components/team/RepPerformanceCard';
import { SalesSummary } from '@/components/sales/SalesSummary';

export default function ManagerDashboardPage() {
  const reps = useSalesStore.getState().team;
  return <div className="space-y-4"><PageHeader title="Manager Console" subtitle="Rendimiento comercial del equipo y seguimiento operativo." actionLabel="Asignar lead" /><SalesSummary /><div className="grid gap-3 md:grid-cols-2">{reps.map((rep)=><RepPerformanceCard key={rep.id} rep={rep} />)}</div></div>;
}
