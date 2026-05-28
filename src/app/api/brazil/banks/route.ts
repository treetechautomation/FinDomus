import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getBankList } from '@/services/free-apis/brasilapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const banks = await getBankList();
    return NextResponse.json({ ok: true, banks });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
}
