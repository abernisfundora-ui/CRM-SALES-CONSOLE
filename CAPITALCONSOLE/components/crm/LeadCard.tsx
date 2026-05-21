import { AppCard } from '@/components/ui/AppCard';
import { Badge } from '@/components/ui/Badge';
import type { Lead, TeamMember } from '@/types/crm';

export function LeadCard({ lead, owner }: { lead: Lead; owner?: TeamMember }) {
  return <AppCard className="space-y-2 border border-[rgba(143,168,90,0.16)]"><div className="flex items-center justify-between"><h4 className="font-semibold text-slate-900">{lead.name}</h4><Badge>{lead.stage}</Badge></div><p className="text-sm text-slate-600">{lead.phone} · {lead.source}</p><p className="text-sm text-slate-600">Follow-up: {lead.nextFollowUpAt}</p><p className="text-sm text-slate-600">Owner: {owner?.name ?? '—'}</p><div className="flex items-center justify-between"><p className="font-semibold text-emerald-700">${lead.estimatedValue.toLocaleString()}</p><button className="rounded-xl border px-3 py-1 text-sm">Ver detalle</button></div></AppCard>;
}
