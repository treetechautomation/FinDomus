'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

import { getInvestmentAssets, type InvestmentAsset } from '@/services/firestore';
import { addInvestment, updateInvestment, type Investment } from '@/services/firestore/investments';
import { useAuth } from '@/providers/auth-provider';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const investmentTypes = [
  'Ações Nacionais',
  'Ações Internacionais',
  'FIIs',
  'Criptomoedas',
  'Renda Fixa',
];

const TYPE_MAPPING: Record<string, string> = {
  'Ações Nacionais': 'Ações Nacionais',
  'Ações Internacionais': 'Ações Internacionais',
  'FIIs': 'Fundos Imobiliários',
  'Criptomoedas': 'Criptomoedas',
  'Renda Fixa': 'Renda Fixa',
};

const REVERSE_TYPE_MAPPING: Record<string, string> = {
  'Ações Nacionais': 'Ações Nacionais',
  'Ações Internacionais': 'Ações Internacionais',
  'Fundos Imobiliários': 'FIIs',
  'Criptomoedas': 'Criptomoedas',
  'Renda Fixa': 'Renda Fixa',
};

type ResolvedAsset = {
  ticker: string;
  normalizedSymbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
  price: number | null;
  changePercent: number | null;
  source: string;
};

function normalizePrefillType(type: string) {
  if (type === 'Fundos Imobiliários') return 'FIIs';
  if (type === 'Criptomoedas') return 'Criptomoedas';
  return type;
}

export function NewInvestmentDialog({
  prefill,
  portfolioAssets = [],
  prefillTicker,
  onClose,
  onRefresh,
  editingInvestment,
  onCloseEditing,
}: {
  prefill?: { type: string; amount: number } | null;
  portfolioAssets?: { ticker?: string; type?: string }[];
  prefillTicker?: { ticker: string; name?: string; type?: string; price?: number; source?: string } | null;
  onClose?: () => void;
  onRefresh?: () => void;
  editingInvestment?: Investment | null;
  onCloseEditing?: () => void;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [type, setType] = useState('Ações Nacionais');
  const [assetId, setAssetId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [prefillAmount, setPrefillAmount] = useState(0);

  const [searchMode, setSearchMode] = useState<'catalog' | 'search'>('catalog');
  const [searchTicker, setSearchTicker] = useState('');
  const [resolvedAsset, setResolvedAsset] = useState<ResolvedAsset | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    if (!open) return;

    getInvestmentAssets()
      .then(setAssets)
      .catch((error) => {
        console.error('Erro ao carregar ativos:', error);
      });
  }, [open]);

  useEffect(() => {
    if (!prefill) return;

    const normalizedType = normalizePrefillType(prefill.type);

    setOpen(true);
    setType(normalizedType);
    setAssetId('');
    setQuantity('');
    setAveragePrice('');
    setCurrentPrice('');
    setPrefillAmount(Number(prefill.amount || 0));
  }, [prefill?.type, prefill?.amount]);

  useEffect(() => {
    if (!prefillTicker) return;

    setOpen(true);
    setSearchTicker('');
    setSearchError('');
    setResolvedAsset(null);

    if (!prefillTicker.ticker) {
      setSearchMode('catalog');
      setQuantity('');
      setAveragePrice('');
      setCurrentPrice('');
      setPrefillAmount(0);
      return;
    }

    setSearchMode('search');

    if (prefillTicker.ticker) {
      setSearchTicker(prefillTicker.ticker);
    }

    if (prefillTicker.price) {
      setCurrentPrice(String(prefillTicker.price).replace('.', ','));
    }
    
    const typeMap: Record<string, string> = {
      'Criptomoedas': 'Criptomoedas',
      'Fundos Imobiliários': 'FIIs',
      'Ações Nacionais': 'Ações Nacionais',
      'Ações Internacionais': 'Ações Internacionais',
    };
    if (prefillTicker.type) {
      setType(typeMap[prefillTicker.type] || 'Ações Nacionais');
    }

    if (prefillTicker.ticker) {
      setTimeout(() => {
        handleSearchTicker(prefillTicker.ticker);
      }, 100);
    }
  }, [prefillTicker?.ticker]);

  useEffect(() => {
    if (!editingInvestment) return;

    setOpen(true);
    setQuantity(String(editingInvestment.quantity || '').replace('.', ','));
    setAveragePrice(String(editingInvestment.averagePrice || '').replace('.', ','));
    setCurrentPrice(String(editingInvestment.currentPrice || '').replace('.', ','));
    setType(editingInvestment.type || 'Ações Nacionais');
    setPrefillAmount(0);
    setSearchTicker('');
    setSearchError('');
    setResolvedAsset(null);
  }, [editingInvestment?.id]);

  const ownedTickers = useMemo(() => {
    return new Set(
      portfolioAssets
        .filter((item) => normalizePrefillType(String(item.type || '')) === type)
        .map((item) => String(item.ticker || '').trim().toUpperCase())
        .filter(Boolean)
    );
  }, [portfolioAssets, type]);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => asset.active !== false && asset.type === type)
      .sort((a, b) => {
        const aOwned = ownedTickers.has(String(a.ticker || '').trim().toUpperCase()) ? 1 : 0;
        const bOwned = ownedTickers.has(String(b.ticker || '').trim().toUpperCase()) ? 1 : 0;

        if (aOwned !== bOwned) return bOwned - aOwned;

        return String(a.ticker || '').localeCompare(String(b.ticker || ''));
      });
  }, [assets, type, ownedTickers]);

  const ownedFilteredAssets = filteredAssets.filter((asset) =>
    ownedTickers.has(String(asset.ticker || '').trim().toUpperCase())
  );

  const otherFilteredAssets = filteredAssets.filter((asset) =>
    !ownedTickers.has(String(asset.ticker || '').trim().toUpperCase())
  );

  const selectedAsset = assets.find((asset) => asset.id === assetId);

  useEffect(() => {
    if (!open || !prefillAmount || assetId || !ownedFilteredAssets.length) return;

    const firstOwned = ownedFilteredAssets[0];
    setAssetId(firstOwned.id || firstOwned.ticker);
  }, [open, prefillAmount, assetId, ownedFilteredAssets]);

  async function handleSearchTicker(forcedTicker?: string) {
    const ticker = forcedTicker || searchTicker;
    if (!ticker.trim()) return;

    setSearching(true);
    setSearchError('');
    setResolvedAsset(null);

    try {
      const token = auth.currentUser ? await getIdToken(auth.currentUser) : null;
      if (!token) {
        setSearchError('Usuário não autenticado');
        return;
      }

      const response = await fetch(`/api/market/resolve?ticker=${encodeURIComponent(ticker)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      const json = await response.json();

      if (!json.ok) {
        setSearchError(json.error || 'Ativo não encontrado');
        return;
      }

      setResolvedAsset({
        ticker: json.ticker,
        normalizedSymbol: json.normalizedSymbol,
        name: json.name,
        type: json.type,
        exchange: json.exchange,
        currency: json.currency,
        price: json.price,
        changePercent: json.changePercent,
        source: json.source,
      });

      if (json.price) {
        setCurrentPrice(String(json.price).replace('.', ','));
        
        if (prefillAmount > 0) {
          const suggestedQty = prefillAmount / json.price;
          setQuantity(String(Number(suggestedQty.toFixed(6))).replace('.', ','));
          setAveragePrice(String(json.price).replace('.', ','));
        }
      }
    } catch (err) {
      setSearchError('Erro ao buscar ativo');
    } finally {
      setSearching(false);
    }
  }

  async function loadCurrentPrice(asset: InvestmentAsset) {
    setPriceLoading(true);

    try {
      const params = new URLSearchParams({
        ticker: asset.ticker,
        type: asset.type,
      });

      const token = auth.currentUser ? await getIdToken(auth.currentUser) : null;
      if (!token) return;

      const response = await fetch(`/api/market/price?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const json = await response.json();
      const price = Number(json?.price || 0);

      if (price > 0) {
        setCurrentPrice(String(price).replace('.', ','));

        if (prefillAmount > 0) {
          const suggestedQty = prefillAmount / price;
          setQuantity(String(Number(suggestedQty.toFixed(6))).replace('.', ','));
          setAveragePrice(String(price).replace('.', ','));
        }
      }
    } finally {
      setPriceLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedAsset) return;

    setCurrentPrice('');
    loadCurrentPrice(selectedAsset);
  }, [selectedAsset?.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const assetToSave = searchMode === 'search' ? resolvedAsset : selectedAsset;
    if (!assetToSave && !editingInvestment) return;

    const qty = Number(String(quantity).replace(',', '.')) || 0;
    const avg = Number(String(averagePrice).replace(',', '.')) || 0;
    const current = Number(String(currentPrice || averagePrice).replace(',', '.')) || avg;

    setSaving(true);

    try {
      if (!user?.uid) throw new Error("Usuário não autenticado");

      if (editingInvestment?.id) {
        await updateInvestment(user.uid, editingInvestment.id, {
          quantity: qty,
          averagePrice: avg,
          currentPrice: current,
          currentValue: qty * current,
          contributions: qty * avg,
        });
      } else {
        if (!assetToSave) return;
        const assetName = searchMode === 'search' ? assetToSave.name : (selectedAsset as any)?.name;
        const assetExchange = searchMode === 'search' ? assetToSave.exchange : (selectedAsset as any)?.exchange;
        const assetCurrency = searchMode === 'search' ? assetToSave.currency : (selectedAsset as any)?.currency;
        const assetType = searchMode === 'search' ? TYPE_MAPPING[type] || type : (selectedAsset as any)?.type;

        await addInvestment(user.uid, {
          type: assetType,
          institution: assetExchange || assetName,
          ticker: assetToSave.ticker,
          quantity: qty,
          averagePrice: avg,
          currentPrice: current,
          currentValue: qty * current,
          contributions: qty * avg,
          objective: assetName,
          liquidity: assetCurrency || 'BRL',
        });
      }

      setOpen(false);
      onClose?.();
      onCloseEditing?.();
      onRefresh?.();
      setAssetId('');
      setQuantity('');
      setAveragePrice('');
      setCurrentPrice('');
      setPrefillAmount(0);
      setSearchTicker('');
      setResolvedAsset(null);
      setSearchMode('catalog');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const isEditing = !!editingInvestment?.id;

  const canSubmit = isEditing
    ? true
    : searchMode === 'search' 
      ? (resolvedAsset && quantity) 
      : selectedAsset;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { onClose?.(); onCloseEditing?.(); } }}>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar ativo' : prefillAmount > 0 ? 'Aportar com sugestão inteligente' : 'Adicionar ativo à carteira'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing ? (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="font-semibold text-foreground">{editingInvestment.ticker} — {editingInvestment.type}</div>
              <div className="text-xs text-muted-foreground">{editingInvestment.institution}</div>
            </div>
          ) : (
            <><div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
            <button
              type="button"
              onClick={() => { setSearchMode('catalog'); setResolvedAsset(null); setSearchError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                searchMode === 'catalog' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => { setSearchMode('search'); setAssetId(''); setSearchError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                searchMode === 'search' ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Buscar ticker
            </button>
          </div>

          {searchMode === 'catalog' ? (
            <>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value);
                    setAssetId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {prefillAmount > 0 && ownedFilteredAssets.length > 0 && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <div className="text-sm font-semibold text-yellow-400">
                    Aportar em ativo que você já tem
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ownedFilteredAssets.map((asset) => (
                      <Button
                        key={asset.id || asset.ticker}
                        type="button"
                        size="sm"
                        variant={assetId === asset.id ? 'default' : 'outline'}
                        onClick={() => setAssetId(asset.id || asset.ticker)}
                      >
                        {asset.ticker}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Ativo</Label>
                <Select value={assetId} onValueChange={setAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ticker" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {ownedFilteredAssets.length > 0 && (
                      <div className="px-2 py-1 text-xs font-semibold text-yellow-500">
                        Na sua carteira
                      </div>
                    )}

                    {ownedFilteredAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id || asset.ticker}>
                        {asset.ticker} — {asset.name} · já tenho
                      </SelectItem>
                    ))}

                    {ownedFilteredAssets.length > 0 && otherFilteredAssets.length > 0 && (
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                        Outros ativos
                      </div>
                    )}

                    {otherFilteredAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id || asset.ticker}>
                        {asset.ticker} — {asset.name}
                      </SelectItem>
                    ))}

                    {otherFilteredAssets.length === 0 && ownedFilteredAssets.length === 0 && (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Nenhum ativo encontrado neste tipo.
                        <br />
                        <button
                          type="button"
                          onClick={() => setSearchMode('search')}
                          className="text-cyan-400 hover:underline mt-2"
                        >
                          Buscar novo ticker →
                        </button>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedAsset && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <div><strong>{(selectedAsset as any).ticker}</strong> — {(selectedAsset as any).name}</div>
                  <div>{(selectedAsset as any).exchange} • {(selectedAsset as any).currency}</div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Ex: PETR4, BTC, MXRF11, AMZN"
                    value={searchTicker}
                    onChange={(e) => {
                      setSearchTicker(e.target.value);
                      setResolvedAsset(null);
                      setSearchError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTicker()}
                    className="uppercase"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleSearchTicker()}
                  disabled={searching || !searchTicker.trim()}
                  className="px-4"
                >
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {searchError && (
                <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                  {searchError}
                </div>
              )}

              {resolvedAsset && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">
                        {resolvedAsset.ticker} — {resolvedAsset.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {resolvedAsset.type} • {resolvedAsset.exchange} • {resolvedAsset.currency}
                      </div>
                    </div>
                    {resolvedAsset.price && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">
                          R$ {resolvedAsset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {resolvedAsset.changePercent !== null && (
                          <div className={`text-xs ${resolvedAsset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {resolvedAsset.changePercent >= 0 ? '+' : ''}{resolvedAsset.changePercent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Exemplos: PETR4, BTC, ETH, MXRF11, AMZN, VALE3, WEGE3, ITUB4
              </div>
            </div>
          )}</>
        )}

        <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                inputMode="decimal"
                readOnly={priceLoading || searching}
              />
            </div>

            <div className="space-y-2">
              <Label>Preço médio</Label>
              <Input
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                placeholder="9,85"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <Label>Preço atual</Label>
              <Input
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder={priceLoading || searching ? "buscando..." : "automático"}
                inputMode="decimal"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!canSubmit || saving || priceLoading || searching}
          >
            {saving ? 'Salvando...' : priceLoading || searching ? 'Processando...' : isEditing ? 'Salvar alterações' : 'Salvar ativo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
