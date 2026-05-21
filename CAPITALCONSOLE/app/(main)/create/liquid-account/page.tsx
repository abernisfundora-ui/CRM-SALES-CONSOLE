import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { LiquidAccountForm } from '@/features/capital-console/components/forms/LiquidAccountForm';

export default function CreateLiquidAccountPage() {
  return (
    <CreateFormLayout accent="liquid" title="Nueva cuenta / efectivo / banco" subtitle="Registra efectivo disponible, cuenta bancaria o billetera para calcular tu liquidez inmediata.">
      <Suspense fallback={null}>
        <LiquidAccountForm />
      </Suspense>
    </CreateFormLayout>
  );
}
