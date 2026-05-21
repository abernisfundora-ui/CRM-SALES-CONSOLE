import { formatCurrency } from '@/features/funnel/lib/format';

export const WHATSAPP_NUMBER = '17867544325';

export type WhatsappPayload = {
  customerName: string;
  phone: string;
  email?: string;
  usage: number;
  freeUsagePercent: number;
  currentBillAmount: number;
  selectedPlanName: string;
  total: number;
  bestPlanName: string;
  savings: number;
  realSavings: number;
  freeHoursApplies: boolean;
};

export function buildWhatsappMessage(payload: WhatsappPayload) {
  const email = payload.email?.trim() ? payload.email.trim() : 'No indicado';
  const freeHoursText = payload.freeHoursApplies ? `${payload.freeUsagePercent}%` : 'No aplica';

  return `Hola, quiero revisar esta solicitud de cliente.\n\nNombre: ${payload.customerName}\nTeléfono: ${payload.phone}\nEmail: ${email}\nConsumo: ${payload.usage} kWh\nFactura actual: ${formatCurrency(payload.currentBillAmount)}\nPlan solicitado: ${payload.selectedPlanName}\nHoras gratis: ${freeHoursText}\nTotal estimado con este plan: ${formatCurrency(payload.total)}\nAhorro estimado frente a su bill actual: ${formatCurrency(payload.realSavings)}\nMejor plan estimado: ${payload.bestPlanName}\n\nEl cliente quiere comparar su factura actual con este plan. Favor dar seguimiento.`;
}

export function buildWhatsappLink(payload: WhatsappPayload) {
  const message = encodeURIComponent(buildWhatsappMessage(payload));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
