import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getCNPJ } from '@/services/free-apis/brasilapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj')?.replace(/\D/g, '');

  if (!cnpj || cnpj.length !== 14) {
    return NextResponse.json({ ok: false, error: 'CNPJ inválido. Informe 14 dígitos.' }, { status: 400 });
  }

  try {
    const data = await getCNPJ(cnpj);
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
  }
}
