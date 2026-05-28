import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getCurrencyRates, getHistoricalRates } from '@/services/free-apis/awesomeapi';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const currencies = searchParams.get('currencies')?.split(',').map(c => c.trim().toUpperCase()) || ['USD', 'EUR', 'GBP', 'ARS', 'BTC'];
  const history = searchParams.get('history');
  const currency = searchParams.get('currency')?.toUpperCase();

  try {
    if (history && currency) {
      const days = Math.min(Math.max(Number(history) || 30, 1), 365);
      const historical = await getHistoricalRates(currency, days);
      return NextResponse.json({ ok: true, currency, days, historical });
    }

    const rates = await getCurrencyRates(currencies);
    return NextResponse.json({ ok: true, rates });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }
}
