import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';

const BRAPI_BASE = 'https://brapi.dev/api';

function normalizeTicker(ticker: string) {
  return String(ticker || '').trim().toUpperCase();
}

function isCrypto(type?: string) {
  const value = String(type || '').toLowerCase();
  return value.includes('cripto') || value.includes('crypto');
}

function isFixedIncome(type?: string, ticker?: string) {
  const value = `${type || ''} ${ticker || ''}`.toLowerCase();
  return (
    value.includes('renda fixa') ||
    value.includes('tesouro') ||
    value.includes('cdb') ||
    value.includes('lci') ||
    value.includes('lca')
  );
}

function normalizeBrapiTicker(ticker: string, type?: string) {
  const t = normalizeTicker(ticker);

  if (!t) return '';

  if (!t.includes('.') && !t.includes('-') && !(type || '').toLowerCase().includes('internacional')) {
    return `${t}.SA`;
  }

  return t;
}

function headers(): Record<string, string> {
  return process.env.BRAPI_TOKEN ? { Authorization: `Bearer ${process.env.BRAPI_TOKEN}` } : {};
}

async function getQuotePrice(ticker: string, type?: string) {
  const symbol = normalizeBrapiTicker(ticker, type);
  if (!symbol) return null;

  const res = await fetch(`${BRAPI_BASE}/quote/${encodeURIComponent(symbol)}`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const json = await res.json();
  const item = json?.results?.[0];
  const price = Number(item?.regularMarketPrice || 0);

  return price > 0 ? price : null;
}

async function getCryptoPrice(ticker: string) {
  const coin = normalizeTicker(ticker).replace('-USD', '').replace('-BRL', '');
  if (!coin) return null;

  const res = await fetch(`${BRAPI_BASE}/v2/crypto?coin=${encodeURIComponent(coin)}&currency=BRL`, {
    headers: headers(),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const json = await res.json();
  const item = json?.coins?.[0] || json?.results?.[0];
  const price = Number(item?.regularMarketPrice || item?.price || 0);

  return price > 0 ? price : null;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticker = normalizeTicker(searchParams.get('ticker') || '');
  const type = searchParams.get('type') || '';

  if (!ticker) {
    return NextResponse.json({ ok: false, error: 'missing_ticker' }, { status: 400 });
  }

  if (isFixedIncome(type, ticker)) {
    return NextResponse.json({
      ok: true,
      ticker,
      type,
      price: null,
      source: 'fixed_income_manual',
      message: 'Renda fixa não possui cotação de mercado automática neste fluxo.',
    });
  }

  const price = isCrypto(type)
    ? await getCryptoPrice(ticker)
    : await getQuotePrice(ticker, type);

  return NextResponse.json({
    ok: Boolean(price),
    ticker,
    type,
    price,
    source: price ? 'brapi' : 'not_found',
    hasToken: Boolean(process.env.BRAPI_TOKEN),
  });
}
