import { NextResponse } from 'next/server';
import type { ReminderOption } from '@/types/calendar';
import { createGoogleEvent } from '@/lib/google-calendar/mock';

type CreateEventPayload = {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  allDay: boolean;
  reminderConfig: ReminderOption;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateEventPayload>;

  if (!body.id || !body.title || !body.startDateTime) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const event = createGoogleEvent({
      id: body.id,
      title: body.title,
      description: body.description,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      allDay: body.allDay ?? false,
      reminderConfig: body.reminderConfig ?? 'none'
    });

    return NextResponse.json({ eventId: event.id, status: 'synced', updatedAt: event.updatedAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync event.' },
      { status: 502 }
    );
  }
}
