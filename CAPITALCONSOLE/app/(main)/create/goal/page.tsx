import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { GoalForm } from '@/features/capital-console/components/forms/GoalForm';

export default function CreateGoalPage() {
  return (
    <CreateFormLayout accent="goal" title="Nueva meta" subtitle="Define objetivos de capital y seguimiento.">
      <Suspense fallback={null}>
        <GoalForm />
      </Suspense>
    </CreateFormLayout>
  );
}
