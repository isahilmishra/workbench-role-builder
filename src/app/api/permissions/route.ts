import { NextResponse } from 'next/server';
import { PERMISSION_MATRIX } from '@/lib/db';

export async function GET() {
  return NextResponse.json(PERMISSION_MATRIX);
}
