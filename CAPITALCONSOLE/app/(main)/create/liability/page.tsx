import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { LiabilityForm } from '@/features/capital-console/components/forms/LiabilityForm';

export default function CreateLiabilityPage() {
  return (
    <CreateFormLayout accent="liability" title="Nuevo pasivo" subtitle="Registra obligaciones financieras con pago programado.">
      <Suspense fallback={null}>
        <LiabilityForm />
      </Suspense>
    </CreateFormLayout>
  );
}
