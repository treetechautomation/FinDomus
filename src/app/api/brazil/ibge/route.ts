import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getIBGEStates, getIBGECities } from '@/services/free-apis/brasilapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state')?.toUpperCase();

  try {
    if (state) {
      const cities = await getIBGECities(state);
      return NextResponse.json({ ok: true, type: 'cities', state, cities });
    }

    const states = await getIBGEStates();
    return NextResponse.json({ ok: true, type: 'states', states });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
}
