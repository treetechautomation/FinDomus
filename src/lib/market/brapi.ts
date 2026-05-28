import { cacheGet, cacheSet } from './cache';

export type BrapiTicker = {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  source: 'BRAPI';
  status: 'live' | 'closed' | 'fallback';
};

const BRAPI_BASE = 'https://brapi.dev/api';

const SYMBOL_NORMALIZE: Record<string, string> = {
  '^BVSP': 'IBOV',
};

const DEFAULT_SYMBOLS = [
  'PETR4.SA',
  'VALE3.SA',
  'ITUB4.SA',
  'BBAS3.SA',
  'MXRF11.SA',
  'HGLG11.SA',
  '^BVSP',
];

const BATCH_SIZE = 20;
const BRA_TTL = 60 * 60 * 1000;

async function fetchBrapiBatch(batch: string[]): Promise<BrapiTicker[]> {
  const token = process.env.BRAPI_TOKEN;
  try {
    const symbols = batch.join(',');
    const res = await fetch(`${BRAPI_BASE}/quote/${symbols}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    const results = json?.results || [];
    return results.map((item: any) => {
      if (!item) return null;
      const rawSymbol = String(item.symbol || '').replace('.SA', '');
      return {
        symbol: SYMBOL_NORMALIZE[rawSymbol] || rawSymbol,
        name: item.shortName || item.longName || item.symbol,
        price: Number(item.regularMarketPrice) || null,
        changePercent: Number(item.regularMarketChangePercent) || null,
        source: 'BRAPI' as const,
        status: 'live' as const,
      };
    }).filter(Boolean) as BrapiTicker[];
  } catch {
    return [];
  }
}

export async function getBrapiTickers(
  symbols: string[] = DEFAULT_SYMBOLS
): Promise<BrapiTicker[]> {
  const cacheKey = 'brapi_tickers';

  const cached = cacheGet<BrapiTicker[]>(cacheKey);
  if (cached && !cached.stale) return cached.data;

  const batches: string[][] = [];
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    batches.push(symbols.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.allSettled(
    batches.map((batch) => fetchBrapiBatch(batch))
  );

  const tickers: BrapiTicker[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      tickers.push(...r.value);
    }
  }

  if (tickers.length > 0) {
    cacheSet(cacheKey, tickers, BRA_TTL);
    return tickers;
  }

  if (cached) return cached.data;
  return [];
}
