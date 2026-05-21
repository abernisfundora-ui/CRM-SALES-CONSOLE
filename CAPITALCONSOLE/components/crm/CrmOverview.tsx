'use client';
import { FilterBar } from '@/components/ui/FilterBar';
import { Input } from '@/components/ui/Input';
import { LeadCard } from '@/components/crm/LeadCard';
import { useSalesStore } from '@/store/useSalesStore';
import { StatCard } from '@/components/ui/StatCard';
export function CrmOverview(){const {leads,team,search,setSearch}=useSalesStore();const filtered=leads.filter(l=>l.name.toLowerCase().includes(search.toLowerCase()));return <div className="space-y-4"><div className="grid gap-3 md:grid-cols-5"><StatCard title="Leads nuevos" value="2" change="Esta semana" module="assets"/><StatCard title="Follow-ups hoy" value="1" change="Pendientes" module="expenses"/><StatCard title="Citas agendadas" value="2" change="Próximas 48h" module="calendar"/><StatCard title="Ventas cerradas" value="1" change="MTD" module="income"/><StatCard title="Conversión" value="33%" change="Lead a ganado" module="goals"/></div><FilterBar><Input placeholder="Buscar lead" value={search} onChange={(e)=>setSearch(e.target.value)} /></FilterBar><div className="grid gap-3 md:grid-cols-2">{filtered.map(lead=><LeadCard key={lead.id} lead={lead} owner={team.find(t=>t.id===lead.ownerId)} />)}</div></div>}
