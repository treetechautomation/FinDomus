type Props = {
  owner: 'PF' | 'PJ';
  setOwner: (value: 'PF' | 'PJ') => void;

  type: 'income' | 'expense';
  setType: (value: 'income' | 'expense') => void;

  companyId: string;
  setCompanyId: (value: string) => void;
  companies: any[];

  accountId: string;
  setAccountId: (value: string) => void;
  filteredAccounts: any[];

  description: string;
  setDescription: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;
  categoryOptions: string[];
  categorySuggestions: Record<string, string>;

  amount: string;
  setAmount: (value: string) => void;

  date: string;
  setDate: (value: string) => void;
};


import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TransactionFormFields({
  owner,
  setOwner,
  type,
  setType,
  companyId,
  setCompanyId,
  companies,
  accountId,
  setAccountId,
  filteredAccounts,
  description,
  setDescription,
  category,
  setCategory,
  categoryOptions,
  categorySuggestions,
  amount,
  setAmount,
  date,
  setDate,
}: Props) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Origem</Label>
          <Select value={owner} onValueChange={(value: 'PF' | 'PJ') => setOwner(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">Pessoal / Familiar</SelectItem>
              <SelectItem value="PJ">Empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
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
        <Label>Conta</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder={owner === 'PJ' && !companyId ? 'Selecione a empresa primeiro' : 'Selecione a conta'} />
          </SelectTrigger>
          <SelectContent>
            {filteredAccounts.map((account: any) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Supermercado"
        />
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            if (!description) {
              setDescription(categorySuggestions[value] || '');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 150.90"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
