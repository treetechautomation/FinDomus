'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

type TickerItem = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  source: string;
  status: string;
};

function isPercent(symbol: string) {
  return ['SELIC', 'CDI', 'IPCA'].includes(symbol);
}

function getDisplayLabel(item: TickerItem) {
  if (item.source === 'BCB') return item.name;
  return item.symbol;
}

function formatPrice(item: TickerItem) {
  if (item.price === null || item.price === undefined) return '---';
  if (isPercent(item.symbol)) {
    return `${item.price.toFixed(2)}%`;
  }
  return item.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatChange(item: TickerItem) {
  const n = item.change;
  if (n === null || n === undefined || isNaN(n)) return null;
  const signal = n >= 0 ? '+' : '';
  return `${signal}${n.toFixed(2)}%`;
}

function getChangeColor(item: TickerItem) {
  const n = item.change;
  if (n === null || n === undefined || isNaN(n) || n === 0) return 'text-muted-foreground';
  return n > 0 ? 'text-emerald-400' : 'text-red-400';
}

function getChangeArrow(item: TickerItem) {
  const n = item.change;
  if (n === null || n === undefined || isNaN(n) || n === 0) return '→';
  return n > 0 ? '▲' : '▼';
}

const MIN_ITEMS = 12;

export function MarketTicker() {
  const { user } = useAuth();
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  async function loadMarket() {
    const currentUser = auth.currentUser;
    if (!currentUser) { setLoading(false); return; }

    try {
      const token = await getIdToken(currentUser);
      const res = await fetch('/api/market/tickers', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (json?.ok && Array.isArray(json.data)) {
        const valid = json.data.filter(
          (d: any) => d && d.symbol && (d.price !== null || true)
        );
        setItems(valid.length ? valid : json.data);
        setUpdatedAt(new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }));
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }

    const now = new Date();
    const hour = Number(now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }));
    const weekday = now.toLocaleString('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).toLowerCase();
    const weekend = weekday.includes('sáb') || weekday.includes('dom');
    setIsMarketOpen(weekend ? false : hour >= 10 && hour < 18);
  }

  useEffect(() => {
    if (!user) return;
    loadMarket();
    const timer = window.setInterval(() => loadMarket(), 60000);
    return () => window.clearInterval(timer);
  }, [user]);

  const marqueeItems = useMemo(() => {
    if (!items.length) return [];

    let base: TickerItem[];

    if (items.length < MIN_ITEMS) {
      const repeated: TickerItem[] = [];
      while (repeated.length < MIN_ITEMS) {
        repeated.push(...items);
      }
      repeated.splice(MIN_ITEMS);
      base = repeated;
    } else {
      base = [...items];
    }

    return [...base, ...base];
  }, [items]);

  const insights = useMemo(() => {
    const valid = items.filter(
      (item) => item.change !== null && item.change !== undefined && !isNaN(item.change) && item.change !== 0
    );
    const best = valid.length ? [...valid].sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0] : null;
    const worst = valid.length ? [...valid].sort((a, b) => (a.change ?? 0) - (b.change ?? 0))[0] : null;
    return { best, worst };
  }, [items]);

  return (
    <div className="border-y border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center overflow-hidden">
        <div className="flex h-full shrink-0 items-center gap-3 border-r border-border/70 px-4">
          <div>
            <div className="text-sm font-bold text-yellow-400">Mercado hoje</div>
            <div className="text-[10px]">
              {loading && <span className="text-muted-foreground">Carregando...</span>}
              {!loading && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-semibold text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.25)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
                  {isMarketOpen ? 'AO VIVO' : 'FECHADO'}{updatedAt ? ` · ${updatedAt}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {insights.best && (
          <div className="hidden h-full shrink-0 items-center gap-2 border-r border-border/70 px-4 text-xs lg:flex">
            <span className="text-muted-foreground">Melhor</span>
            <strong>{getDisplayLabel(insights.best)}</strong>
            <span className="text-emerald-400">{formatChange(insights.best)}</span>
          </div>
        )}

        {insights.worst && (
          <div className="hidden h-full shrink-0 items-center gap-2 border-r border-border/70 px-4 text-xs xl:flex">
            <span className="text-muted-foreground">Maior queda</span>
            <strong>{getDisplayLabel(insights.worst)}</strong>
            <span className="text-red-400">{formatChange(insights.worst)}</span>
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="market-ticker-track flex min-w-max items-center">
            {marqueeItems.map((item, index) => {
              const changeColor = getChangeColor(item);
              const arrow = getChangeArrow(item);
              const changeText = formatChange(item);

              return (
                <div
                  key={`${item.symbol}-${index}`}
                  className="group flex h-12 items-center gap-2 border-l border-border/60 px-5 text-sm transition-colors hover:bg-white/5"
                  title={`${getDisplayLabel(item)}${item.price !== null ? ` · ${formatPrice(item)}` : ''}`}
                >
                  <span className="font-bold text-foreground">{getDisplayLabel(item)}</span>
                  <span className="text-muted-foreground">
                    {formatPrice(item)}
                  </span>
                  {changeText !== null ? (
                    <span className={`font-semibold ${changeColor}`}>
                      {arrow} {changeText}
                    </span>
                  ) : (
                    <span className="font-semibold text-muted-foreground">→ ---</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
