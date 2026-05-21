import { NextResponse } from 'next/server';
import type { ReminderOption } from '@/types/calendar';
import { deleteGoogleEvent, updateGoogleEvent } from '@/lib/google-calendar/mock';

type UpdateEventPayload = {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  allDay: boolean;
  reminderConfig: ReminderOption;
};

export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const body = (await request.json()) as Partial<UpdateEventPayload>;

  if (!eventId || !body.title || !body.startDateTime) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const event = updateGoogleEvent(eventId, {
      id: eventId,
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

export async function DELETE(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const deleted = deleteGoogleEvent(eventId);
  return NextResponse.json({ eventId, deleted });
}
