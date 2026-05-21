import { PageHeader } from '@/components/ui/PageHeader';
import { SalesSummary } from '@/components/sales/SalesSummary';
export default function SalesPage(){return <div className="space-y-4"><PageHeader title="Ventas" subtitle="Seguimiento de cierres y valor comercial." actionLabel="Registrar venta" /><SalesSummary /></div>}
