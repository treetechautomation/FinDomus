import { cacheGet, cacheSet } from './cache';
import { getCryptoPrices } from './crypto';
import { getBcbIndicators } from './bcb';

const BRAPI_BASE = 'https://brapi.dev/api';

const LOOKUP_TTL: Record<string, number> = {
  'Ações Nacionais': 60 * 60 * 1000,
  'Fundos Imobiliários': 60 * 60 * 1000,
  'Ações Internacionais': 60 * 60 * 1000,
  'Criptomoedas': 5 * 60 * 1000,
};

const BCB_SYMBOLS = new Set(['SELIC', 'CDI', 'IPCA', 'USD/BRL']);

function getTtl(type: string): number {
  return LOOKUP_TTL[type] ?? 60 * 60 * 1000;
}

async function lookupBrapi(symbol: string): Promise<{
  price: number | null;
  changePercent: number | null;
  source: string;
}> {
  const cacheKey = `lookup_brapi_${symbol}`;
  const cached = cacheGet<{ price: number | null; changePercent: number | null; source: string }>(cacheKey);
  if (cached && !cached.stale) return cached.data;

  const token = process.env.BRAPI_TOKEN;
  try {
    const res = await fetch(`${BRAPI_BASE}/quote/${encodeURIComponent(symbol)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return { price: null, changePercent: null, source: 'not_found' };
    const json = await res.json();
    const item = json?.results?.[0];
    if (!item) return { price: null, changePercent: null, source: 'not_found' };
    const result = {
      price: Number(item.regularMarketPrice) || null,
      changePercent: Number(item.regularMarketChangePercent) || null,
      source: 'BRAPI' as const,
    };
    cacheSet(cacheKey, result, 60 * 60 * 1000);
    return result;
  } catch {
    if (cached) return cached.data;
    return { price: null, changePercent: null, source: 'not_found' };
  }
}

export async function lookupPrice(
  normalizedSymbol: string,
  type: string
): Promise<{ price: number | null; changePercent: number | null; source: string }> {
  const cacheKey = `lookup_${normalizedSymbol}`;
  const ttl = getTtl(type);

  const cached = cacheGet<{ price: number | null; changePercent: number | null; source: string }>(cacheKey);
  if (cached && !cached.stale) return cached.data;

  let result: { price: number | null; changePercent: number | null; source: string };

  if (type === 'Criptomoedas') {
    const prices = await getCryptoPrices();
    const found = prices.find((p) => p.symbol === normalizedSymbol);
    result = {
      price: found?.price ?? null,
      changePercent: found?.changePercent ?? null,
      source: found?.source ?? 'not_found',
    };
  } else if (type === 'Fundos Imobiliários' || type === 'Ações Nacionais') {
    result = await lookupBrapi(`${normalizedSymbol}.SA`);
  } else if (type === 'Ações Internacionais') {
    result = await lookupBrapi(`${normalizedSymbol}.US`);
  } else if (BCB_SYMBOLS.has(normalizedSymbol)) {
    const indicators = await getBcbIndicators();
    const found = indicators.find((i) => i.symbol === normalizedSymbol);
    result = {
      price: found?.price ?? null,
      changePercent: null,
      source: found?.source ?? 'not_found',
    };
  } else {
    result = { price: null, changePercent: null, source: 'unknown' };
  }

  if (result.price !== null) {
    cacheSet(cacheKey, result, ttl);
  }

  return result;
}
