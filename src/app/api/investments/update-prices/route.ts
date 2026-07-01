import { NextRequest, NextResponse } from 'next/server';

import { adminDb } from '@/lib/firebase-admin';
import type { Investment } from '@/services/firestore/types';

type BrapiQuoteResult = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketTime?: string;
};

type BrapiCryptoResult = {
  coin?: string;
  currency?: string;
  regularMarketPrice?: number;
  price?: number;
};

const BRAPI_BASE_URL = 'https://brapi.dev/api';

function getBrapiToken() {
  return process.env.BRAPI_TOKEN || process.env.BRAPI_API_TOKEN || '';
}

function buildHeaders(): Record<string, string> {
  const token = getBrapiToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function normalizeBrapiTicker(ticker: string, type?: string) {
  const t = String(ticker || '').trim().toUpperCase();

  if (!t) return '';

  // ações/FIIs brasileiras → adicionar .SA
  if (!t.includes('.') && !t.includes('-') && !(type || '').toLowerCase().includes('internacional')) {
    return t + '.SA';
  }

  return t;
}

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

async function getBrapiQuotePrice(ticker: string, type?: string) {
  const normalized = normalizeBrapiTicker(ticker, type);
  if (!normalized) return null;

  const url = `${BRAPI_BASE_URL}/quote/${encodeURIComponent(normalized)}`;

  const response = await fetch(url, {
    headers: buildHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const result = data?.results?.[0] as BrapiQuoteResult | undefined;
  const price = Number(result?.regularMarketPrice || 0);

  return price > 0 ? price : null;
}

async function getBrapiCryptoPrice(ticker: string) {
  const normalized = normalizeTicker(ticker).replace('-USD', '').replace('-BRL', '');
  if (!normalized) return null;

  const url = `${BRAPI_BASE_URL}/v2/crypto?coin=${encodeURIComponent(normalized)}&currency=BRL`;

  const response = await fetch(url, {
    headers: buildHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const result = (data?.coins?.[0] || data?.results?.[0]) as BrapiCryptoResult | undefined;
  const price = Number(result?.regularMarketPrice || result?.price || 0);

  return price > 0 ? price : null;
}

async function getMarketPrice(input: { ticker?: string; type?: string }) {
  const ticker = normalizeTicker(input.ticker || '');

  if (!ticker) return null;

  if (isFixedIncome(input.type, ticker)) {
    return null;
  }

  if (isCrypto(input.type)) {
    return getBrapiCryptoPrice(ticker);
  }

  return getBrapiQuotePrice(ticker, input.type);
}

export async function POST(req: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET;
  
  if (!CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection('investments')
      .where('quantity', '>', 0)
      .get();
    const investments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Investment[];

    const candidates = investments.filter(
      (item) => item.id && item.ticker && Number(item.quantity || 0) > 0
    );

    const results = [];

    for (const item of candidates) {
      const marketPrice = await getMarketPrice({
        ticker: item.ticker,
        type: item.type,
      });

      const currentPrice = Number(marketPrice || item.currentPrice || 0);
      const quantity = Number(item.quantity || 0);

      if (!currentPrice || !quantity || !item.id) {
        results.push({
          ticker: item.ticker,
          type: item.type,
          status: 'skipped',
          reason: marketPrice ? 'missing_quantity' : 'market_price_not_found',
        });
        continue;
      }

      const currentValue = quantity * currentPrice;

      // salvar histórico
      await adminDb.collection('investment_price_history').add({
        investmentId: item.id,
        ticker: item.ticker,
        price: currentPrice,
        createdAt: new Date().toISOString(),
      });

      await adminDb.collection('investments').doc(item.id).update({
        currentPrice,
        currentValue,
        lastUpdate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      results.push({
        ticker: item.ticker,
        type: item.type,
        status: marketPrice ? 'updated_from_brapi' : 'updated_from_saved_price',
        currentPrice,
        currentValue,
      });
    }

    return NextResponse.json({
      ok: true,
      provider: 'brapi',
      hasToken: Boolean(getBrapiToken()),
      total: investments.length,
      candidates: candidates.length,
      results,
    });
  } catch (error) {
    console.error('Erro ao atualizar preços:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'update_prices_failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
