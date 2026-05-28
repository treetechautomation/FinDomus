import { NextResponse } from 'next/server';

const BRAPI_BASE = 'https://brapi.dev/api';

const MARKET_TICKERS = [
  'IBOV',
  'PETR4.SA',
  'VALE3.SA',
  'ITUB4.SA',
  'BBAS3.SA',
  'WEGE3.SA',
  'MGLU3.SA',
  'MXRF11.SA',
  'AMZN',
  'USDBRL=X',
];

export async function GET() {
  try {
    const url = BRAPI_BASE + '/quote/' + MARKET_TICKERS.join(',');

    const res = await fetch(url, {
      headers: process.env.BRAPI_TOKEN
        ? { Authorization: 'Bearer ' + process.env.BRAPI_TOKEN }
        : {},
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, data: [] });
    }

    const json = await res.json();

    const data = (json.results || []).map((item: any) => ({
      symbol:
        item.symbol === 'USDBRL=X'
          ? 'DOLAR'
          : String(item.symbol || '').replace('.SA', ''),
      name: item.shortName || item.longName || item.symbol,
      price: Number(item.regularMarketPrice || 0),
      change: Number(item.regularMarketChangePercent || 0),
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, data: [] });
  }
}
