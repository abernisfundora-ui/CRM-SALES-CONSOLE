import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';
import { AppCard } from '@/components/ui/AppCard';
export default function ContactsPage(){const contacts=useSalesStore.getState().contacts;return <div className="space-y-4"><PageHeader title="Contactos" subtitle="Base de clientes y leads unificada." actionLabel="Nuevo contacto" /><div className="grid gap-3 md:grid-cols-2">{contacts.map((c)=><AppCard key={c.id}><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-600">{c.phone}</p><p className="text-sm text-slate-600">{c.email}</p></AppCard>)}</div></div>}
