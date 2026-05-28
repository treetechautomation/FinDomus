import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getHolidays } from '@/services/free-apis/brasilapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get('year')) || new Date().getFullYear();

  try {
    const holidays = await getHolidays(year);
    return NextResponse.json({ ok: true, year, holidays });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
}
