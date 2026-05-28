'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { getCompanies, updateAccount } from '@/services/firestore/accounts';
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

type AccountLike = {
  id: string;
  name: string;
  type: string;
  owner: 'PF' | 'PJ';
  companyId?: string | null;
  balance?: number;
};

export function EditAccountDialog({ account }: { account: AccountLike }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [accountType, setAccountType] = useState(account.type);
  const [owner, setOwner] = useState<'PF' | 'PJ'>(account.owner);
  const [companyId, setCompanyId] = useState(account.companyId ?? '');
  const [balance, setBalance] = useState(String(account.balance ?? 0));
  const [companies, setCompanies] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    }

    loadCompanies();
  }, []);

  useEffect(() => {
    if (owner === 'PF') {
      setCompanyId('');
    }
  }, [owner]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const numericBalance = Number(balance.replace(',', '.'));

    if (!name.trim()) {
      alert('Informe o nome da conta.');
      return;
    }

    if (owner === 'PJ' && !companyId) {
      alert('Selecione a empresa da conta PJ.');
      return;
    }

    try {
      setSaving(true);

      await updateAccount(account.id, {
        name: name.trim(),
        type: accountType,
        owner,
        companyId: owner === 'PJ' ? companyId : null,
        balance: Number.isFinite(numericBalance) ? numericBalance : 0,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Erro ao editar conta:', error);
      alert('Não foi possível editar a conta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Conta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-account-name">Nome da conta</Label>
            <Input
              id="edit-account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={owner} onValueChange={(value: 'PF' | 'PJ') => setOwner(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoal</SelectItem>
                  <SelectItem value="PJ">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo da conta</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="investment">Investimento</SelectItem>
                  <SelectItem value="wallet">Carteira</SelectItem>
                  <SelectItem value="credit_card">Cartão</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {owner === 'PJ' && (
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-account-balance">Saldo</Label>
            <Input
              id="edit-account-balance"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
