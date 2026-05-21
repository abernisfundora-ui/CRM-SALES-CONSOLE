export type SalesRole = 'agent' | 'secretary' | 'manager' | 'regional' | 'owner' | 'admin';

export type LeadStage =
  | 'Nuevo lead'
  | 'Contactado'
  | 'Calificado'
  | 'Cita agendada'
  | 'Presentación'
  | 'Negociación'
  | 'Cerrado ganado'
  | 'Cerrado perdido';

export type LeadStatus = 'active' | 'on-hold' | 'won' | 'lost';

export type CandidateStage = 'Nuevo candidato' | 'Contactado' | 'Entrevista' | 'Training' | 'Activado' | 'Rechazado';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'Referido' | 'Inbound' | 'Evento' | 'Anuncio';
  status: LeadStatus;
  stage: LeadStage;
  ownerId: string;
  createdAt: string;
  lastContactAt: string;
  nextFollowUpAt: string;
  notes: string;
  tags: string[];
  estimatedValue: number;
};

export type Contact = { id: string; leadId?: string; name: string; phone: string; email: string; company?: string; ownerId: string };
export type Deal = { id: string; leadId: string; ownerId: string; value: number; closedAt: string; status: 'won' | 'lost' | 'open' };
export type Appointment = { id: string; leadId?: string; title: string; kind: 'appointment' | 'followup' | 'interview' | 'task'; date: string; ownerId: string };
export type TeamMember = { id: string; name: string; role: SalesRole; team: string; avatar: string; kpis: { sales: number; appointments: number; calls: number; followUps: number; conversion: number; trainingCompleted: number } };
export type SalesActivity = { id: string; memberId: string; type: 'call' | 'meeting' | 'followup' | 'deal'; date: string; summary: string };
export type Candidate = { id: string; name: string; phone: string; stage: CandidateStage; ownerId: string; interviewAt?: string };
export type TrainingModule = { id: string; title: string; progress: number; status: 'Pendiente' | 'En curso' | 'Completado' };
