'use client';

import type { ReactNode } from 'react';

type CreateWizardProps = {
  title: string;
  steps: string[];
  step: number;
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
  isLast: boolean;
  nextLabel?: string;
  children: ReactNode;
};

export function CreateWizard({ title, steps, step, onPrev, onNext, canNext, isLast, nextLabel = 'Continuar', children }: CreateWizardProps) {
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="space-y-5">
      <section className="create-stepper">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#10170D]">{title}</p>
            <p className="mt-1 text-xs font-semibold text-[rgba(16,23,13,0.62)]">
              Paso {step + 1} de {steps.length} · {steps[step]}
            </p>
          </div>
          <span className="w-fit rounded-full border border-[rgba(47,61,31,0.12)] bg-[rgba(47,61,31,0.06)] px-3 py-1 text-[11px] font-bold text-[#2F3D1F]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="create-progress-track mt-4">
          <div className="create-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="create-form-section create-form-step create-field-grid">{children}</section>

      <section className="create-actions sticky bottom-[calc(env(safe-area-inset-bottom)+5.6rem)] z-30 rounded-[18px] p-2">
        <div className="flex gap-2">
          <button type="button" className="ds-btn-secondary w-full" onClick={onPrev} disabled={step === 0}>
            Atrás
          </button>
          <button type="button" className="ds-btn-primary w-full" onClick={onNext} disabled={!canNext}>
            {isLast ? 'Guardar' : nextLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
