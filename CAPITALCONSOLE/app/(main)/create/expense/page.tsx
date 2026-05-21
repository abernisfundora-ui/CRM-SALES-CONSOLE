import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { ExpenseForm } from '@/features/capital-console/components/forms/ExpenseForm';

export default function CreateExpensePage() {
  return (
    <CreateFormLayout accent="expense" title="Nuevo gasto" subtitle="Alta dedicada para gastos manuales.">
      <Suspense fallback={null}>
        <ExpenseForm />
      </Suspense>
    </CreateFormLayout>
  );
}
