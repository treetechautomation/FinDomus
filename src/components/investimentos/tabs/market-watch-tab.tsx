'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Plus, Search, TrendingUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type GroupDef = {
  key: string;
  label: string;
  badge: string;
  badgeStyle: string;
  tickers: string[];
};

const TICKER_NAMES: Record<string, string> = {
  'USD/BRL': 'Dólar/Real',
  SELIC: 'Taxa Selic',
  CDI: 'CDI',
  IPCA: 'IPCA',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin',
  SOL: 'Solana',
  XRP: 'Ripple',
  ADA: 'Cardano',
  TRX: 'Tron',
  AAVE: 'Aave',
  XLM: 'Stellar',
  MXRF11: 'Maxi Renda',
  KNCR11: 'KCH Real Estate',
  BTRA11: 'Brazil Real Estate',
  SDIL11: 'SDI Logística',
  BTAI11: 'BTG Pactual Imobiliário',
  CVBI11: 'CVI Imóveis',
  HSML11: 'HSI Mall',
  HCTR11: 'HCTR11',
  HGLG11: 'HGLG11',
  VINO11: 'Vino Partners',
  VISC11: 'VISC11',
  BTLG11: 'BTLG11',
  XPML11: 'XP Malls',
  RBRF11: 'RBR Properties',
  ITUB4: 'Itaú Unibanco',
  ITUB3: 'Itaú Unibanco',
  ITSA3: 'Itaúsa',
  ITSA4: 'Itaúsa',
  BBAS3: 'Banco do Brasil',
  BBDC4: 'Bradesco',
  SANB11: 'Santander',
  CSMG3: 'Copasa',
  SAPR4: 'Sanepar',
  PETR4: 'Petrobras',
  VALE3: 'Vale',
  WEGE3: 'WEG',
  MGLU3: 'Magazine Luiza',
  IBOV: 'Ibovespa',
  AMZN: 'Amazon',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'NVIDIA',
  TSLA: 'Tesla',
  GOOG: 'Alphabet',
  META: 'Meta Platforms',
};

const STATIC_GROUPS: GroupDef[] = [
  {
    key: 'macro',
    label: 'Macro / Banco Central',
    badge: 'BCB',
    badgeStyle: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    tickers: ['USD/BRL', 'SELIC', 'CDI', 'IPCA'],
  },
  {
    key: 'crypto',
    label: 'Criptomoedas',
    badge: 'CRYPTO',
    badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    tickers: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'ADA', 'TRX', 'AAVE', 'XLM'],
  },
  {
    key: 'fiis',
    label: 'Fundos Imobiliários',
    badge: 'FIIs',
    badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    tickers: ['MXRF11', 'KNCR11', 'BTRA11', 'SDIL11', 'BTAI11', 'CVBI11', 'HSML11', 'HCTR11', 'HGLG11', 'VINO11', 'VISC11', 'BTLG11', 'XPML11', 'RBRF11'],
  },
  {
    key: 'bancos',
    label: 'Bancos',
    badge: 'BANCOS',
    badgeStyle: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    tickers: ['ITUB4', 'ITUB3', 'ITSA3', 'ITSA4', 'BBAS3', 'BBDC4', 'SANB11'],
  },
  {
    key: 'saneamento',
    label: 'Saneamento',
    badge: 'SANEAMENTO',
    badgeStyle: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
    tickers: ['CSMG3', 'SAPR4'],
  },
  {
    key: 'nacionais',
    label: 'Ações Nacionais',
    badge: 'B3',
    badgeStyle: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    tickers: ['PETR4', 'VALE3', 'WEGE3', 'MGLU3', 'IBOV'],
  },
  {
    key: 'global',
    label: 'Internacional',
    badge: 'NYSE/NASDAQ',
    badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    tickers: ['AMZN', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOG', 'META'],
  },
];

function formatPrice(item: TickerItem) {
  if (item.price === null || item.price === undefined) return null;
  if (['SELIC', 'CDI', 'IPCA'].includes(item.symbol)) {
    return `${item.price.toFixed(2)}%`;
  }
  if (['IBOV'].includes(item.symbol)) {
    return `${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} pts`;
  }
  return item.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatPriceValue(price: number, symbol: string) {
  if (['SELIC', 'CDI', 'IPCA'].includes(symbol)) {
    return `${price.toFixed(2)}%`;
  }
  if (['IBOV'].includes(symbol)) {
    return `${price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} pts`;
  }
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatChange(item: TickerItem) {
  const n = item.change ?? item.changePercent;
  if (n === null || n === undefined || isNaN(n)) return null;
  const signal = n >= 0 ? '+' : '';
  return `${signal}${n.toFixed(2)}%`;
}

function resolveAssetType(ticker: string): string {
  const t = ticker.toUpperCase().replace('.SA', '').replace('.US', '');
  const CRYPTO = new Set(['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'ADA', 'TRX', 'AAVE', 'XLM']);
  const FII = new Set(['MXRF11', 'KNCR11', 'BTRA11', 'SDIL11', 'BTAI11', 'CVBI11', 'HSML11', 'HCTR11', 'HGLG11', 'VINO11', 'VISC11', 'BTLG11', 'XPML11', 'RBRF11']);
  if (CRYPTO.has(t)) return 'Criptomoedas';
  if (FII.has(t)) return 'Fundos Imobiliários';
  if (t.endsWith('11') && /^[A-Z]{4}11$/.test(t)) return 'Fundos Imobiliários';
  if (['AMZN', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOG', 'META', 'NFLX', 'AMD', 'INTC', 'CSCO', 'ORCL', 'IBM'].includes(t)) return 'Ações Internacionais';
  return 'Ações Nacionais';
}

const TYPE_MAPPING: Record<string, string> = {
  'Criptomoedas': 'Criptomoedas',
  'Fundos Imobiliários': 'Fundos Imobiliários',
  'Ações Nacionais': 'Ações Nacionais',
  'Ações Internacionais': 'Ações Internacionais',
};

type Props = {
  onAddToPortfolio?: (ticker: string, name: string, type: string, price: number | null) => void;
};

export function MarketWatchTab({ onAddToPortfolio }: Props) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedPrices, setFetchedPrices] = useState<Map<string, { price: number; changePercent: number | null }>>(new Map());
  const [fetchingTicker, setFetchingTicker] = useState<string | null>(null);

  const fetchTickers = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Usuário não autenticado');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken(user);
      const res = await fetch('/api/market/tickers', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        setError(`Erro ${res.status}`);
        return;
      }
      const json = await res.json();
      if (json?.ok && Array.isArray(json.data)) {
        const valid = json.data.filter(
          (d: any) => d && d.symbol
        );
        setItems(valid);
      } else {
        setError('Resposta inválida');
      }
    } catch {
      setError('Falha ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
  }, [fetchTickers]);

  const itemsBySymbol = useMemo(() => {
    const map = new Map<string, TickerItem>();
    for (const item of items) {
      map.set(item.symbol, item);
    }
    return map;
  }, [items]);

  const liveGroups = useMemo(() => {
    return STATIC_GROUPS.map((group) => {
      const live = group.tickers
        .map((symbol) => {
          const apiItem = itemsBySymbol.get(symbol);
          return {
            symbol,
            name: apiItem?.name || TICKER_NAMES[symbol] || symbol,
            price: apiItem?.price ?? null,
            change: apiItem?.change ?? null,
            changePercent: apiItem?.changePercent ?? null,
            source: apiItem?.source || '',
            status: apiItem?.status || 'delayed',
          };
        })
        .filter((item) => item.price !== null);
      return { ...group, items: live };
    }).filter((g) => g.items.length > 0);
  }, [itemsBySymbol]);

  async function handleFetchPrice(ticker: string) {
    setFetchingTicker(ticker);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await getIdToken(user);
      const res = await fetch(`/api/market/resolve?ticker=${encodeURIComponent(ticker)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.ok && json.price != null) {
        setFetchedPrices((prev) => {
          const next = new Map(prev);
          next.set(ticker, { price: json.price, changePercent: json.changePercent ?? null });
          return next;
        });
      }
    } catch {
    } finally {
      setFetchingTicker(null);
    }
  }

  function handleAdd(ticker: string, name: string, type: string) {
    const batchItem = itemsBySymbol.get(ticker);
    const fetched = fetchedPrices.get(ticker);
    const price = batchItem?.price ?? fetched?.price ?? null;
    onAddToPortfolio?.(ticker, name, type, price);
  }

  async function handleAddWithFetch(ticker: string, name: string, type: string) {
    const batchItem = itemsBySymbol.get(ticker);
    const fetched = fetchedPrices.get(ticker);
    const price = batchItem?.price ?? fetched?.price ?? null;
    if (price !== null) {
      onAddToPortfolio?.(ticker, name, type, price);
      return;
    }
    setFetchingTicker(ticker);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await getIdToken(user);
      const res = await fetch(`/api/market/resolve?ticker=${encodeURIComponent(ticker)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.ok && json.price != null) {
        setFetchedPrices((prev) => {
          const next = new Map(prev);
          next.set(ticker, { price: json.price, changePercent: json.changePercent ?? null });
          return next;
        });
        onAddToPortfolio?.(ticker, name, type, json.price);
      }
    } finally {
      setFetchingTicker(null);
    }
  }

  function getItemPrice(symbol: string): { price: number | null; changePercent: number | null } {
    const batchItem = itemsBySymbol.get(symbol);
    const fetched = fetchedPrices.get(symbol);
    return {
      price: batchItem?.price ?? fetched?.price ?? null,
      changePercent: batchItem?.changePercent ?? fetched?.changePercent ?? null,
    };
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-transparent">Mercado</h2>
          <p className="text-muted-foreground">
            Cotações em tempo real de indicadores macro, criptomoedas, B3 e mercados internacionais.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchTickers}
          disabled={loading}
          className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-sm text-muted-foreground">Carregando cotações...</p>
          </div>
        </div>
      )}

      {error && items.length === 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" onClick={fetchTickers} className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 1 — Mercado ao Vivo */}
      {liveGroups.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-foreground">Mercado ao Vivo</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              Ativos com cotação disponível
            </span>
          </div>

          {liveGroups.map((group) => (
            <Card key={group.key} className="border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                <CardTitle className="text-sm font-semibold text-foreground/90 tracking-wide">{group.label}</CardTitle>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${group.badgeStyle}`}>
                  {group.badge}
                </span>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Símbolo</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Nome</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Preço</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Variação</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.symbol} className="border-b border-white/[0.05] transition-all duration-150 hover:bg-white/[0.03]">
                        <td className="px-4 py-2.5 font-bold text-foreground tracking-tight">{item.symbol}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-foreground text-sm">{formatPrice(item)}</td>
                        <td className="px-4 py-2.5 text-right">
                          {(() => {
                            const n = item.change ?? item.changePercent;
                            if (n === null || n === undefined || isNaN(n)) return <span className="font-mono text-muted-foreground/60">--</span>;
                            const isUp = n > 0;
                            const isDown = n < 0;
                            const color = isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-muted-foreground';
                            const arrow = isUp ? '▲' : isDown ? '▼' : '→';
                            return (
                              <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-medium ${color}`}>
                                <span>{arrow}</span>
                                <span>{n >= 0 ? '+' : ''}{n.toFixed(2)}%</span>
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {item.status === 'live' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                              FECHADO
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {group.key !== 'macro' ? (
                            <button
                              type="button"
                              onClick={() => handleAdd(item.symbol, item.name, resolveAssetType(item.symbol))}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Section 2 — Explorar Ativos */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-foreground">Explorar Ativos</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            Catálogo completo • clique para consultar cotação
          </span>
        </div>

        {STATIC_GROUPS.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-foreground/80">{group.label}</h4>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${group.badgeStyle}`}>
                {group.badge}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {group.tickers.map((symbol) => {
                const { price, changePercent } = getItemPrice(symbol);
                const name = TICKER_NAMES[symbol] || symbol;
                const type = resolveAssetType(symbol);
                const isFetching = fetchingTicker === symbol;

                return (
                  <div
                    key={symbol}
                    className="group relative rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/[0.04]"
                  >
                    <div className="font-bold text-sm text-foreground tracking-tight">{symbol}</div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">{name}</div>

                    <div className="mt-1.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${group.badgeStyle}`}>
                        {type === 'Criptomoedas' ? 'CRYPTO' : type === 'Fundos Imobiliários' ? 'FII' : type === 'Ações Internacionais' ? 'INTL' : 'B3'}
                      </span>
                    </div>

                    {price !== null && (
                      <div className="mt-2 font-mono text-xs">
                        <span className="text-emerald-400 font-medium">{formatPriceValue(price, symbol)}</span>
                        {changePercent !== null && (
                          <span className={`ml-1.5 ${changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex gap-1.5">
                      {price === null && (
                        <button
                          type="button"
                          onClick={() => handleFetchPrice(symbol)}
                          disabled={isFetching}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                        >
                          {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                          {isFetching ? '' : 'Consultar'}
                        </button>
                      )}
                      {group.key !== 'macro' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (price !== null) {
                              onAddToPortfolio?.(symbol, name, type, price);
                            } else {
                              handleAddWithFetch(symbol, name, type);
                            }
                          }}
                          disabled={isFetching}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          {isFetching ? '' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </p>
      )}
    </div>
  );
}
