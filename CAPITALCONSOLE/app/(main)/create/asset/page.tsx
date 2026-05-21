import { Suspense } from 'react';
import { CreateFormLayout } from '@/components/create/CreateFormLayout';
import { AssetForm } from '@/features/capital-console/components/forms/AssetForm';

export default function CreateAssetPage() {
  return (
    <CreateFormLayout accent="asset" title="Nuevo activo" subtitle="Registra un activo de forma dedicada.">
      <Suspense fallback={null}>
        <AssetForm />
      </Suspense>
    </CreateFormLayout>
  );
}
