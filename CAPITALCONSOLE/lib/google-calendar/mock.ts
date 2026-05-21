import type { ReminderOption } from '@/types/calendar';

type GoogleCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  allDay: boolean;
  reminderConfig: ReminderOption;
  updatedAt: string;
};

const events = new Map<string, GoogleCalendarEvent>();

function maybeFailBasedOnTitle(title: string) {
  if (title.toLowerCase().includes('[sync-fail]')) {
    throw new Error('Google Calendar rejected the request (simulated failure).');
  }
}

export function createGoogleEvent(input: Omit<GoogleCalendarEvent, 'updatedAt'>): GoogleCalendarEvent {
  maybeFailBasedOnTitle(input.title);
  const event = { ...input, updatedAt: new Date().toISOString() };
  events.set(input.id, event);
  return event;
}

export function updateGoogleEvent(eventId: string, input: Omit<GoogleCalendarEvent, 'updatedAt'>): GoogleCalendarEvent {
  maybeFailBasedOnTitle(input.title);
  const event = { ...input, id: eventId, updatedAt: new Date().toISOString() };
  events.set(eventId, event);
  return event;
}

export function deleteGoogleEvent(eventId: string): boolean {
  return events.delete(eventId);
}
