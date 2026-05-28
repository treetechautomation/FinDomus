'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { addAccount } from '@/services/firestore/accounts';
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

export function NewAccountDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
    const [owner, setOwner] = useState<'PF' | 'PJ'>('PF');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!name) {
      alert('Informe o nome da conta.');
      return;
    }

    try {
      setSaving(true);

        await addAccount({
          name,
          type: "checking",
          owner,
          balance: 0,
        });

      setOpen(false);
      setName('');
      // setBank removido

      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar conta');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4">
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
            <Input value={name} onChange={(e) => setName(e.target.value)} />
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
