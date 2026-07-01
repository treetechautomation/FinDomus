'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { addTaxObligation } from '@/services/firestore/fiscal';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Company = {
  id?: string;
  name: string;
};

export function AddTaxObligationDialog({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('DAS - Simples Nacional');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const firstCompanyId = companies.find((company) => company.id)?.id;
    setCompanyId(firstCompanyId ?? 'default');
  }, [companies]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const numericValue = Number(value.replace(',', '.'));

    if (!name.trim() || !dueDate || !numericValue) {
      alert('Preencha obrigação, vencimento e valor.');
      return;
    }

    try {
      setSaving(true);

      await addTaxObligation(user?.uid || '', {
        companyId,
        name: name.trim(),
        dueDate,
        value: numericValue,
      });

      setOpen(false);
      setName('DAS - Simples Nacional');
      setValue('');
      router.refresh();
    } catch (error) {
      console.error('Erro ao criar obrigação fiscal:', error);
      alert('Não foi possível criar a obrigação fiscal.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Obrigação
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Obrigação Fiscal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id!}>
                      {company.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="default">Empresa padrão</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Obrigação</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obrigação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAS - Simples Nacional">DAS - Simples Nacional</SelectItem>
                <SelectItem value="INSS">INSS</SelectItem>
                <SelectItem value="FGTS">FGTS</SelectItem>
                <SelectItem value="IRPJ">IRPJ</SelectItem>
                <SelectItem value="CSLL">CSLL</SelectItem>
                <SelectItem value="ISS">ISS</SelectItem>
                <SelectItem value="Honorários Contábeis">Honorários Contábeis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 1890.00"
              />
            </div>
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
