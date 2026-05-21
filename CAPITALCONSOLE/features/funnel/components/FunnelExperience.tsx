'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionContainer } from '@/features/funnel/components/SectionContainer';
import { HeroSection } from '@/features/funnel/components/HeroSection';
import { PLAN_CONFIGS, DEFAULT_PLAN_ID } from '@/features/funnel/config/plans';
import { PlanTabs } from '@/features/funnel/components/PlanTabs';
import { UsageInputs } from '@/features/funnel/components/UsageInputs';
import { calculateAllPlans, calculateByPlan, getBestPlan } from '@/features/funnel/lib/calculations';
import { EstimateBreakdown } from '@/features/funnel/components/EstimateBreakdown';
import { BestPlanCallout } from '@/features/funnel/components/BestPlanCallout';
import { LeadForm } from '@/features/funnel/components/LeadForm';
import { StickyMobileCTA } from '@/features/funnel/components/StickyMobileCTA';
import { WhatsappButton } from '@/features/funnel/components/WhatsappButton';
import { buildWhatsappLink, type WhatsappPayload } from '@/features/funnel/lib/whatsapp';
import {
  trackEstimateCalculated,
  trackLeadSubmitted,
  trackPlanSelected,
  trackSimulatorViewed,
  trackWhatsappClicked
} from '@/features/funnel/lib/tracking';
import type { LeadFormValues } from '@/features/funnel/types';

type ValidationErrors = {
  name?: string;
  phone?: string;
  usage?: string;
  currentBillAmount?: string;
  freeUsagePercent?: string;
};

export function FunnelExperience() {
  const simulatorRef = useRef<HTMLDivElement | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_PLAN_ID);
  const [usageInput, setUsageInput] = useState('1000');
  const [currentBillInput, setCurrentBillInput] = useState('220');
  const [freeUsageInput, setFreeUsageInput] = useState('30');
  const [leadValues, setLeadValues] = useState<LeadFormValues>({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    trackSimulatorViewed();
  }, []);

  const usage = Number(usageInput) || 0;
  const currentBillAmount = Number(currentBillInput) || 0;
  const freeUsagePercent = Math.min(100, Math.max(0, Number(freeUsageInput) || 0));

  const selectedPlan = useMemo(
    () => PLAN_CONFIGS.find((plan) => plan.id === selectedPlanId) ?? PLAN_CONFIGS[0],
    [selectedPlanId]
  );

  const currentEstimate = useMemo(
    () => calculateByPlan(selectedPlan, usage, freeUsagePercent),
    [selectedPlan, usage, freeUsagePercent]
  );

  const allResults = useMemo(() => calculateAllPlans(usage, freeUsagePercent), [usage, freeUsagePercent]);
  const bestPlan = useMemo(() => getBestPlan(allResults), [allResults]);

  const savings = useMemo(() => {
    if (!bestPlan) return 0;
    return Math.max(0, currentEstimate.breakdown.total - bestPlan.breakdown.total);
  }, [bestPlan, currentEstimate.breakdown.total]);

  const realSavings = useMemo(() => currentBillAmount - currentEstimate.breakdown.total, [currentBillAmount, currentEstimate.breakdown.total]);

  const whatsappPayload: WhatsappPayload = useMemo(
    () => ({
      customerName: leadValues.name.trim(),
      phone: leadValues.phone.trim(),
      email: leadValues.email?.trim(),
      usage,
      freeUsagePercent,
      currentBillAmount,
      selectedPlanName: currentEstimate.planName,
      total: currentEstimate.breakdown.total,
      bestPlanName: bestPlan?.planName ?? currentEstimate.planName,
      savings,
      realSavings,
      freeHoursApplies: selectedPlan.type === 'free-hours'
    }),
    [bestPlan?.planName, currentBillAmount, currentEstimate.breakdown.total, currentEstimate.planName, freeUsagePercent, leadValues, realSavings, savings, selectedPlan.type, usage]
  );

  useEffect(() => {
    trackEstimateCalculated({
      usage,
      currentBillAmount,
      freeUsagePercent,
      selectedPlan: selectedPlan.name,
      total: currentEstimate.breakdown.total,
      realSavings
    });
  }, [currentEstimate.breakdown.total, currentBillAmount, freeUsagePercent, realSavings, selectedPlan.name, usage]);

  const validateBeforeWhatsapp = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    if (!leadValues.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!leadValues.phone.trim()) {
      nextErrors.phone = 'El teléfono es obligatorio.';
    }

    if (usage <= 0) {
      nextErrors.usage = 'El consumo debe ser mayor a 0 kWh para continuar.';
    }

    if (currentBillAmount <= 0) {
      nextErrors.currentBillAmount = 'La factura actual debe ser mayor a 0 para comparar ahorro real.';
    }

    if (selectedPlan.type === 'free-hours' && (freeUsagePercent < 0 || freeUsagePercent > 100)) {
      nextErrors.freeUsagePercent = 'El porcentaje de horas gratis debe estar entre 0 y 100.';
    }

    return nextErrors;
  };

  const openWhatsapp = () => {
    const validationErrors = validateBeforeWhatsapp();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSuccessMessage('');
      return;
    }

    window.open(buildWhatsappLink(whatsappPayload), '_blank', 'noopener,noreferrer');
    setSuccessMessage('Listo. Se abrirá WhatsApp con la información del cliente y el plan solicitado.');

    trackLeadSubmitted({
      plan: currentEstimate.planName,
      usage,
      total: currentEstimate.breakdown.total,
      currentBillAmount,
      realSavings
    });
    trackWhatsappClicked({
      plan: currentEstimate.planName,
      usage,
      total: currentEstimate.breakdown.total,
      bestPlan: bestPlan?.planName,
      currentBillAmount,
      realSavings
    });
  };

  const heroPayload = {
    ...whatsappPayload,
    customerName: whatsappPayload.customerName || 'Cliente por definir',
    phone: whatsappPayload.phone || 'No indicado'
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 text-[#1a1a1a] md:pb-8">
      <HeroSection
        onStart={() => simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        whatsappHref={buildWhatsappLink(heroPayload)}
      />

      <SectionContainer id="simulator">
        <div ref={simulatorRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Simulador de factura</h2>
          <p className="mt-2 text-sm text-slate-600">Sigue estos pasos para estimar rápido y enviar datos por WhatsApp sin fricción.</p>

          <ol className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:grid-cols-5">
            <li><span className="font-semibold">Paso 1:</span> Elige un plan</li>
            <li><span className="font-semibold">Paso 2:</span> Ingresa consumo</li>
            <li><span className="font-semibold">Paso 3:</span> Indica horas gratis</li>
            <li><span className="font-semibold">Paso 4:</span> Revisa estimado</li>
            <li><span className="font-semibold">Paso 5:</span> Envía datos</li>
          </ol>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 1 · Elige un plan</p>
              <PlanTabs
                plans={PLAN_CONFIGS}
                selectedPlanId={selectedPlan.id}
                onSelect={(planId) => {
                  setSelectedPlanId(planId);
                  trackPlanSelected(planId);
                }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Paso 2 y 3 · Completa consumo, factura y horas gratis</p>
              <UsageInputs
                usage={usageInput}
                currentBillAmount={currentBillInput}
                freeUsagePercent={freeUsageInput}
                showFreeUsageInput={selectedPlan.type === 'free-hours'}
                freePeriodLabel={selectedPlan.type === 'free-hours' ? selectedPlan.freePeriodLabel : ''}
                onUsageChange={setUsageInput}
                onCurrentBillChange={setCurrentBillInput}
                onFreeUsageChange={setFreeUsageInput}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <EstimateBreakdown estimate={currentEstimate} plan={selectedPlan} currentBillAmount={currentBillAmount} realSavings={realSavings} />
              <BestPlanCallout selected={currentEstimate} best={bestPlan} allResults={allResults} currentBillAmount={currentBillAmount} />
              <div className="hidden md:block">
                <WhatsappButton payload={whatsappPayload} />
              </div>
            </div>
            <LeadForm
              values={leadValues}
              errors={errors}
              successMessage={successMessage}
              onChange={(field, value) => {
                setLeadValues((prev) => ({ ...prev, [field]: value }));
                setErrors({});
                setSuccessMessage('');
              }}
              onSubmit={openWhatsapp}
            />
          </div>
        </div>
      </SectionContainer>

      <StickyMobileCTA payload={whatsappPayload} onClick={openWhatsapp} />
    </main>
  );
}
