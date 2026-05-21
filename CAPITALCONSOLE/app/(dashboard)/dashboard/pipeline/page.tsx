import { PageHeader } from '@/components/ui/PageHeader';
import { SalesSummary } from '@/components/sales/SalesSummary';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
export default function PipelinePage(){return <div className="space-y-4"><PageHeader title="Pipeline" subtitle="Flujo comercial por etapas con control de cierre." actionLabel="Crear deal" /><SalesSummary /><PipelineBoard /></div>}
