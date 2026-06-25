'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getInvestments, type Investment } from '@/services/firestore/investments';
import { addInvestmentYield, type YieldType } from '@/services/firestore/yields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function NewYieldDialog({
  open,
  onOpenChange,
  onRefresh,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}) {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);

  const [investmentId, setInvestmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<YieldType>('DIVIDEND');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user?.uid) {
      setLoadingInvestments(true);
      getInvestments(user.uid)
        .then((data) => {
          setInvestments(data || []);
          if (data?.length > 0) {
            setInvestmentId(data[0].id || '');
          }
        })
        .catch(console.error)
        .finally(() => setLoadingInvestments(false));
    }
  }, [open, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !investmentId || !amount) return;

    const selectedInv = investments.find((i) => i.id === investmentId);
    if (!selectedInv) return;

    setSaving(true);
    try {
      await addInvestmentYield(user.uid, {
        investmentId,
        ticker: selectedInv.ticker || 'Outros',
        date,
        amount: Number(amount) || 0,
        type,
        description,
      });
      onOpenChange(false);
      setAmount('');
      setDescription('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Lançar Provento / Rendimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Ativo Associado</Label>
            {loadingInvestments ? (
              <div className="flex items-center gap-2 text-zinc-500 text-xs py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando ativos...
              </div>
            ) : (
              <Select value={investmentId} onValueChange={setInvestmentId}>
                <SelectTrigger className="rounded-xl border-zinc-800 bg-zinc-900 text-white">
                  <SelectValue placeholder="Selecione o ativo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  {investments.map((item) => (
                    <SelectItem key={item.id} value={item.id || ''}>
                      {item.ticker ? `${item.ticker} (${item.institution})` : `${item.type} (${item.institution})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Tipo</Label>
              <Select value={type} onValueChange={(val: YieldType) => setType(val)}>
                <SelectTrigger className="rounded-xl border-zinc-800 bg-zinc-900 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="DIVIDEND">Dividendo</SelectItem>
                  <SelectItem value="JCP">JCP</SelectItem>
                  <SelectItem value="FII">Rendimento FII</SelectItem>
                  <SelectItem value="COUPON">Cupom</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield-amount" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Valor Líquido (R$)</Label>
              <Input
                id="yield-amount"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield-date" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Data de Pagamento</Label>
            <Input
              id="yield-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield-desc" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Observações (Opcional)</Label>
            <Input
              id="yield-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pagamento trimestral"
              className="rounded-xl border-zinc-800 bg-zinc-900 text-white focus-visible:ring-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !investmentId || !amount}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Provento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
