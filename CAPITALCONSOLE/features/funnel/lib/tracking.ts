import type { TrackingPayload } from '@/features/funnel/types';

function track(eventName: string, payload?: TrackingPayload) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[tracking] ${eventName}`, payload ?? {});
  }
}

export function trackSimulatorViewed() {
  track('simulator_viewed');
}

export function trackPlanSelected(plan: string) {
  track('plan_selected', { plan });
}

export function trackEstimateCalculated(payload: TrackingPayload) {
  track('estimate_calculated', payload);
}

export function trackLeadSubmitted(payload: TrackingPayload) {
  track('lead_submitted', payload);
}

export function trackWhatsappClicked(payload: TrackingPayload) {
  track('whatsapp_clicked', payload);
}
