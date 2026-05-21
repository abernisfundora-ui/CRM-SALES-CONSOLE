import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { IncomeForm } from '@/features/capital-console/components/forms/IncomeForm';

export default function CreateIncomePage() {
  return (
    <CreateFormLayout accent="income" title="Nuevo ingreso" subtitle="Alta dedicada para ingresos manuales.">
      <Suspense fallback={null}>
        <IncomeForm />
      </Suspense>
    </CreateFormLayout>
  );
}
