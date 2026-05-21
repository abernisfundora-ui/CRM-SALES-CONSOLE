import { PageHeader } from '@/components/ui/PageHeader';
import { CrmOverview } from '@/components/crm/CrmOverview';
export default function AgentDashboardPage() {return <div className="space-y-4"><PageHeader title="CRM de Ventas" subtitle="Gestiona leads, seguimiento y citas diarias." actionLabel="Nuevo lead" /><CrmOverview /></div>;}
