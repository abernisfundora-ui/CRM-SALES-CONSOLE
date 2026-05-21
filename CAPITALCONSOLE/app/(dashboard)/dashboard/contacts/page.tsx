'use client';

import { AppCard } from '@/components/ui/AppCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSalesStore } from '@/store/useSalesStore';

export default function ContactsPage() {
  const contacts = useSalesStore((state) => state.contacts);

  return (
    <div className="space-y-4">
      <PageHeader title="Contactos" subtitle="Base de clientes y leads unificada." actionLabel="Nuevo contacto" />
      <div className="grid gap-3 md:grid-cols-2">
        {contacts.map((contact) => (
          <AppCard key={contact.id}>
            <p className="font-semibold">{contact.name}</p>
            <p className="text-sm text-slate-600">{contact.phone}</p>
            <p className="text-sm text-slate-600">{contact.email}</p>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
