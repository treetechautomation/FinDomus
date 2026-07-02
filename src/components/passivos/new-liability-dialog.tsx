'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { addLiability } from '@/services/firestore/liabilities';
import { useAuth } from '@/providers/auth-provider';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type LiabilityType = 'Financiamento' | 'Empréstimo' | 'Cartão' | 'Outro';

export function NewLiabilityDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<LiabilityType>('Financiamento');
  const [institution, setInstitution] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !installmentValue || !totalInstallments || !remainingBalance) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      if (!user?.uid) throw new Error("Usuário não autenticado.");

      await addLiability(user.uid, {
        name: name.trim(),
        type,
        institution: institution.trim(),
        installmentValue: Number(installmentValue),
        currentInstallment: 1,
        totalInstallments: Number(totalInstallments),
        remainingBalance: Number(remainingBalance),
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar o passivo.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Passivo
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Passivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as LiabilityType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Financiamento">Financiamento</SelectItem>
                <SelectItem value="Empréstimo">Empréstimo</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Instituição</Label>
            <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </div>

          <div>
            <Label>Valor da Parcela</Label>
            <Input type="number" value={installmentValue} onChange={(e) => setInstallmentValue(e.target.value)} />
          </div>

          <div>
            <Label>Total de Parcelas</Label>
            <Input type="number" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} />
          </div>

          <div>
            <Label>Saldo Devedor</Label>
            <Input type="number" value={remainingBalance} onChange={(e) => setRemainingBalance(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
