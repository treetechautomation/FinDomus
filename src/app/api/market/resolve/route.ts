import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { resolveAsset } from '@/lib/market/resolve-asset';
import { lookupPrice } from '@/lib/market/lookup';

function normalizeTicker(ticker: string): string {
  return String(ticker || '').trim().toUpperCase();
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticker = normalizeTicker(searchParams.get('ticker') || '');

  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'missing_ticker' }, { status: 400 });
  }

  const resolved = resolveAsset(ticker);

  if (!resolved) {
    return NextResponse.json({ ok: false, error: 'invalid_ticker' }, { status: 400 });
  }

  const { price, changePercent, source } = await lookupPrice(
    resolved.normalizedSymbol,
    resolved.type
  );

  return NextResponse.json({
    ok: true,
    ticker: resolved.symbol,
    normalizedSymbol: resolved.normalizedSymbol,
    name: resolved.name,
    type: resolved.type,
    exchange: resolved.exchange,
    currency: resolved.currency,
    price,
    changePercent,
    source,
  });
}
