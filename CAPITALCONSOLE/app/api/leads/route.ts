import { NextResponse } from 'next/server';

type LeadPayload = {
  name?: string;
  phone?: string;
  email?: string;
  usage?: number;
  freeUsagePercent?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LeadPayload;

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  if (typeof body.usage !== 'number' || Number.isNaN(body.usage) || body.usage < 0) {
    return NextResponse.json({ success: false, message: 'Invalid usage' }, { status: 400 });
  }

  if (
    typeof body.freeUsagePercent === 'number' &&
    (Number.isNaN(body.freeUsagePercent) || body.freeUsagePercent < 0 || body.freeUsagePercent > 100)
  ) {
    return NextResponse.json({ success: false, message: 'Invalid free usage percent' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
