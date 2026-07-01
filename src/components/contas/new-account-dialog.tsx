'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

import { addAccount } from '@/services/firestore/accounts';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
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

export function NewAccountDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [owner, setOwner] = useState<'PF' | 'PJ'>('PF');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome da conta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      if (!user?.uid) throw new Error("Usuário não autenticado.");

      await addAccount(user.uid, {
        name,
        type,
        owner,
        balance: 0,
      });

      setOpen(false);
      setName('');
      setType('checking');
      setOwner('PF');
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erro ao salvar conta',
        description: err.message || 'Houve um erro ao registrar a conta.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-background transition-all duration-300">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Conta
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Tipo de Conta</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="wallet">Carteira</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Proprietário</Label>
            <Select value={owner} onValueChange={(v: any) => setOwner(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoal</SelectItem>
                <SelectItem value="PJ">Empresa</SelectItem>
              </SelectContent>
            </Select>
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
