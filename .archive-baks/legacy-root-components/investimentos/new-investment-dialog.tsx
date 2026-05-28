'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { getInvestmentAssets, type InvestmentAsset } from '@/services/firestore';
import { addInvestment } from '@/services/firestore/investments';
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
  'Cripto',
  'Renda Fixa',
];

function normalizePrefillType(type: string) {
  if (type === 'Fundos Imobiliários') return 'FIIs';
  if (type === 'Criptomoedas') return 'Cripto';
  return type;
}

export function NewInvestmentDialog({
  prefill,
  portfolioAssets = [],
}: {
  prefill?: { type: string; amount: number } | null;
  portfolioAssets?: { ticker?: string; type?: string }[];
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

  // selecionar automaticamente ativo já existente quando vier de aporte inteligente
  useEffect(() => {
    if (!open || !prefillAmount || assetId || !ownedFilteredAssets.length) return;

    const firstOwned = ownedFilteredAssets[0];
    setAssetId(firstOwned.id || firstOwned.ticker);
  }, [open, prefillAmount, assetId, ownedFilteredAssets]);

  async function loadCurrentPrice(asset: InvestmentAsset) {
    setPriceLoading(true);

    try {
      const params = new URLSearchParams({
        ticker: asset.ticker,
        type: asset.type,
      });

      const response = await fetch(`/api/market/price?${params.toString()}`, {
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

    if (!selectedAsset) return;

    const qty = Number(String(quantity).replace(',', '.')) || 0;
    const avg = Number(String(averagePrice).replace(',', '.')) || 0;
    const current = Number(String(currentPrice || averagePrice).replace(',', '.')) || avg;

    setSaving(true);

    try {
      await addInvestment({
        type: selectedAsset.type,
        institution: selectedAsset.exchange || selectedAsset.name,
        ticker: selectedAsset.ticker,
        quantity: qty,
        averagePrice: avg,
        currentPrice: current,
        currentValue: qty * current,
        contributions: qty * avg,
        objective: selectedAsset.name,
        liquidity: selectedAsset.currency || 'BRL',
      });

      setOpen(false);
        setAssetId('');
      setQuantity('');
      setAveragePrice('');
      setCurrentPrice('');
      setPrefillAmount(0);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar ativo
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prefillAmount > 0 ? 'Aportar com sugestão inteligente' : 'Adicionar ativo à carteira'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="mt-2 text-xs text-muted-foreground">
                  Ou selecione outro ativo no campo abaixo.
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Ativo</Label>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ticker" />
                </SelectTrigger>
                <SelectContent>
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
                </SelectContent>
              </Select>
            </div>

          {selectedAsset && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              <div><strong>{selectedAsset.ticker}</strong> — {selectedAsset.name}</div>
              <div>{selectedAsset.exchange} • {selectedAsset.currency}</div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                inputMode="decimal"
                readOnly={priceLoading}
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
                placeholder={priceLoading ? "buscando..." : "automático"}
                inputMode="decimal"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!selectedAsset || saving || priceLoading}>
            {saving ? 'Salvando...' : priceLoading ? 'Buscando preço atual...' : 'Salvar ativo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
