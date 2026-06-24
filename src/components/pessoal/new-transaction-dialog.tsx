'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

import { getAccounts, getCompanies } from '@/services/firestore/accounts';
import { addTransaction } from '@/services/firestore/transactions';
import { getCategories } from '@/services/firestore/categories';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionFormFields } from '@/components/pessoal/form/transaction-form-fields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categorySuggestions: Record<string, string> = {
  "Alimentação": "Supermercado",
  "Transporte": "Gasolina",
  "Moradia": "Condomínio",
  "Saúde": "Farmácia",
  "Lazer": "Cinema",
  "Doações": "Dízimo"
};

const merchantCategorySuggestions: Record<string, string> = {
  guanabara: 'Alimentação',
  supermercado: 'Alimentação',
  mercado: 'Alimentação',
  shell: 'Transporte',
  ipiranga: 'Transporte',
  gasolina: 'Transporte',
  igreja: 'Doações',
  dizimo: 'Doações',
  dízimo: 'Doações',
};

function normalizeSuggestionText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const CATEGORY_PF = [
  'Salário',
  'Pró-labore',
  'Renda Extra',
  'Investimentos (rendimentos)',
  'Cashback / Reembolso',
  'Outros Recebimentos',

  'Moradia (aluguel, condomínio)',
  'Aluguel',
  'Condomínio',
  'Energia',
  'Água',
  'Gás',
  'Internet',
  'Telefone',

  'Alimentação',
  'Mercado',
  'Supermercado',
  'Transporte',
  'Combustível',
  'Farmácia',

  'Saúde',
  'Plano de saúde',
  'Academia',
  'Bem-estar',
  'Terapia',
  'Medicamentos',
  'Pet',
  'Seguros',

  'Educação',
  'Cursos',
  'Livros',
  'Mentoria',
  'Eventos',
  'Certificações',
  'Material escolar',

  'Lazer',
  'Compras',
  'Restaurante',
  'Viagem',
  'Assinaturas (Netflix, Spotify etc.)',
  'Presentes',
  'Vestuário',
  'Beleza',

  'Dízimo',
  'Doações',
  'Impostos',
  'Dívidas / Empréstimos',

  'Investimentos (aporte)',
  'Reserva de emergência',
  'Aporte',
  'Previdência',
  'Compra de ativos',
  'Consórcio',

  'Dividendos',
  'Juros',
  'Renda passiva',
  'Aluguéis recebidos',

  'Outros',
];

const CATEGORY_PJ = [
  'Serviços Prestados',
  'Vendas',
  'Contratos Recorrentes',
  'Consultoria',
  'Outros Recebimentos',

  'Ferramentas / Software',
  'Internet / Telefonia',
  'Equipamentos',
  'Marketing / Ads',
  'Despesas Administrativas',

  'Pró-labore',
  'Salários',
  'Freelancers',
  'Benefícios',

  'DAS (Simples Nacional)',
  'INSS',
  'FGTS',
  'ISS',
  'IRPJ',
  'CSLL',
  'Honorários Contábeis',

  'Taxas Bancárias',
  'Taxas de Plataforma',
  'Juros / Multas',
  'Outros',
];

export function NewTransactionDialog() {
  const { user } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Outros');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [owner, setOwner] = useState<'PF' | 'PJ'>('PF');
  const [accountId, setAccountId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadData() {
      if (!user?.uid) return;
      try {
        const [companiesData, accountsData, categoriesData] = await Promise.all([
          getCompanies(user.uid),
          getAccounts(user.uid),
          getCategories(user.uid),
        ]);

        setCompanies(companiesData);
        setAccounts(accountsData);
        setCategories(categoriesData.map((c: any) => c.name).filter(Boolean));
      } catch (error) {
        console.error('Erro ao carregar dados do modal:', error);
      }
    }

    loadData();
  }, [open]);

  const categoryOptions = categories.length ? categories : (owner === 'PJ' ? CATEGORY_PJ : CATEGORY_PF);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account: any) => {
      if (account.owner !== owner) return false;
      if (owner === 'PJ' && companyId) return account.companyId === companyId;
      if (owner === 'PJ' && !companyId) return false;
      return true;
    });
  }, [accounts, owner, companyId]);

  useEffect(() => {
    setAccountId('');
    if (owner === 'PF') {
      setCompanyId('');
    }
  }, [owner]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const numericAmount = Number(amount.replace(',', '.'));

    if (!description.trim() || !category.trim() || !numericAmount || !date) {
      alert('Preencha descrição, categoria, valor e data.');
      return;
    }

    if (!accountId) {
      alert('Selecione a conta do lançamento.');
      return;
    }

    if (owner === 'PJ' && !companyId) {
      alert('Selecione a empresa para um lançamento PJ.');
      return;
    }

    try {
      setSaving(true);

      await addTransaction(user!.uid, {
        description: description.trim(),
        category: category.trim(),
        type,
        amount: numericAmount,
        date,
        owner,
        accountId,
        companyId: owner === 'PJ' ? companyId : null,
      });

      setOpen(false);
      setDescription('');
      setCategory('Outros');
      setType('expense');
      setOwner('PF');
      setAccountId('');
      setCompanyId('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));

        window.location.reload();
      } catch (error: any) {
        console.error("Erro ao salvar lançamento:", error);
        alert(error?.message || "Não foi possível salvar o lançamento.");
      } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            <TransactionFormFields
              owner={owner}
              setOwner={setOwner}
              type={type}
              setType={setType}
              companyId={companyId}
              setCompanyId={setCompanyId}
              companies={companies}
              accountId={accountId}
              setAccountId={setAccountId}
              filteredAccounts={filteredAccounts}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              categoryOptions={categoryOptions}
              categorySuggestions={categorySuggestions}
              amount={amount}
              setAmount={setAmount}
              date={date}
              setDate={setDate}
              />

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
