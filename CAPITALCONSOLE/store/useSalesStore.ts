'use client';

import { create } from 'zustand';
import { appointmentsMock, candidatesMock, contactsMock, leadsMock, teamMock, trainingMock } from '@/lib/mock/sales-crm';
import type { Lead, LeadStage } from '@/types/crm';

type SalesStore = {
  leads: Lead[];
  contacts: typeof contactsMock;
  appointments: typeof appointmentsMock;
  team: typeof teamMock;
  candidates: typeof candidatesMock;
  training: typeof trainingMock;
  search: string;
  setSearch: (value: string) => void;
  moveLeadStage: (leadId: string, stage: LeadStage) => void;
};

export const useSalesStore = create<SalesStore>((set) => ({
  leads: leadsMock,
  contacts: contactsMock,
  appointments: appointmentsMock,
  team: teamMock,
  candidates: candidatesMock,
  training: trainingMock,
  search: '',
  setSearch: (value) => set({ search: value }),
  moveLeadStage: (leadId, stage) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              stage,
              status: stage === 'Cerrado ganado' ? 'won' : stage === 'Cerrado perdido' ? 'lost' : 'active'
            }
          : lead
      )
    }))
}));
