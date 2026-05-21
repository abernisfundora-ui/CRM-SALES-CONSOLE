import { NextResponse } from 'next/server';
import { dataClient } from '@/data/client';

export function GET() {
  return NextResponse.json(dataClient.dashboard());
}
