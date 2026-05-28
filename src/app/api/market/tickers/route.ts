import { NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/verify-id-token';
import { getBcbIndicators } from '@/lib/market/bcb';
import { getCryptoPrices } from '@/lib/market/crypto';
import { getBrapiTickers } from '@/lib/market/brapi';

type TickerItem = {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  source: 'BCB' | 'BINANCE' | 'COINGECKO' | 'BRAPI' | 'FALLBACK';
  status: 'live' | 'closed' | 'fallback';
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    await verifyIdToken(authHeader);
  } catch {
    return NextResponse.json({ ok: false, data: [], error: 'unauthorized' }, { status: 401 });
  }

  const sources = await Promise.allSettled([
    getBcbIndicators(),
    getCryptoPrices(),
    getBrapiTickers(),
  ]);

  const tickers: TickerItem[] = [];
  for (const s of sources) {
    if (s.status === 'fulfilled') tickers.push(...s.value);
  }

  const data = tickers.map((item) => ({
    symbol: item.symbol,
    name: item.name,
    price: item.price,
    change: item.changePercent,
    changePercent: item.changePercent,
    source: item.source,
    status: item.status,
  }));

  const minData = ['USD/BRL', 'SELIC', 'CDI', 'IPCA', 'BTC', 'ETH', 'SOL'];
  const existingSymbols = new Set(data.map((d) => d.symbol));
  for (const sym of minData) {
    if (!existingSymbols.has(sym)) {
      data.push({
        symbol: sym,
        name: sym,
        price: null,
        change: null,
        changePercent: null,
        source: 'FALLBACK',
        status: 'fallback',
      });
    }
  }

  return NextResponse.json({ ok: true, data });
}
