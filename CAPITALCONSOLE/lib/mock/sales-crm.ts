import type { Appointment, Candidate, Contact, Lead, TeamMember, TrainingModule } from '@/types/crm';

export const leadsMock: Lead[] = [
  { id: 'l1', name: 'María Torres', phone: '+1 305 555 1021', email: 'maria@acme.co', source: 'Inbound', status: 'active', stage: 'Calificado', ownerId: 'u1', createdAt: '2026-05-15', lastContactAt: '2026-05-19', nextFollowUpAt: '2026-05-21', notes: 'Busca paquete premium', tags: ['premium'], estimatedValue: 12000 },
  { id: 'l2', name: 'Jorge Acosta', phone: '+1 786 555 8811', email: 'jorge@nova.io', source: 'Referido', status: 'active', stage: 'Negociación', ownerId: 'u2', createdAt: '2026-05-10', lastContactAt: '2026-05-18', nextFollowUpAt: '2026-05-20', notes: 'Esperando propuesta', tags: ['hot'], estimatedValue: 18500 },
  { id: 'l3', name: 'Carla Gómez', phone: '+1 407 555 3300', email: 'carla@zenith.com', source: 'Evento', status: 'won', stage: 'Cerrado ganado', ownerId: 'u1', createdAt: '2026-05-01', lastContactAt: '2026-05-09', nextFollowUpAt: '2026-05-28', notes: 'Onboarding en curso', tags: ['won'], estimatedValue: 9200 }
];
export const contactsMock: Contact[] = leadsMock.map((l) => ({ id: `c-${l.id}`, leadId: l.id, name: l.name, phone: l.phone, email: l.email, ownerId: l.ownerId }));
export const teamMock: TeamMember[] = [
  { id: 'u1', name: 'Ana Vega', role: 'agent', team: 'North', avatar: 'AV', kpis: { sales: 42000, appointments: 18, calls: 92, followUps: 25, conversion: 31, trainingCompleted: 80 } },
  { id: 'u2', name: 'Leo Pérez', role: 'agent', team: 'North', avatar: 'LP', kpis: { sales: 37000, appointments: 15, calls: 80, followUps: 20, conversion: 28, trainingCompleted: 65 } }
];
export const appointmentsMock: Appointment[] = [
  { id: 'a1', leadId: 'l1', title: 'Follow-up María Torres', kind: 'followup', date: '2026-05-20T15:00:00Z', ownerId: 'u1' },
  { id: 'a2', leadId: 'l2', title: 'Demo Jorge Acosta', kind: 'appointment', date: '2026-05-21T14:00:00Z', ownerId: 'u2' },
  { id: 'a3', title: 'Entrevista Sofía Ruiz', kind: 'interview', date: '2026-05-22T16:00:00Z', ownerId: 'u1' }
];
export const candidatesMock: Candidate[] = [{ id: 'can-1', name: 'Sofía Ruiz', phone: '+1 786 111 2233', stage: 'Entrevista', ownerId: 'u1', interviewAt: '2026-05-22T16:00:00Z' }];
export const trainingMock: TrainingModule[] = [
  { id: 't1', title: 'Script inicial', progress: 100, status: 'Completado' },
  { id: 't2', title: 'Objeciones', progress: 65, status: 'En curso' },
  { id: 't3', title: 'Cierre', progress: 20, status: 'En curso' },
  { id: 't4', title: 'Simulación de venta', progress: 0, status: 'Pendiente' },
  { id: 't5', title: 'Seguimiento', progress: 0, status: 'Pendiente' }
];
