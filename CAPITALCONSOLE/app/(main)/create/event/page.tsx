import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { EventForm } from '@/features/capital-console/components/forms/EventForm';

export default function CreateEventPage() {
  return (
    <CreateFormLayout accent="event" title="Nuevo evento" subtitle="Agrega recordatorios y notas financieras al calendario.">
      <Suspense fallback={null}>
        <EventForm />
      </Suspense>
    </CreateFormLayout>
  );
}
