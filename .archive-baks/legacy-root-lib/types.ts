export type PersonalTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Budget = {
  category: string;
  planned: number;
  spent: number;
};

export type Investment = {
  id: string;
  type: string;
  objective: string;
  currentValue: number;
  contributions: number;
  liquidity: string;
  institution: string;
  goal?: number;
};

export type Liability = {
    id: string;
    name: string;
    type: 'Financiamento' | 'Empréstimo' | 'Cartão' | 'Outro';
    installmentValue: number;
    currentInstallment: number;
    totalInstallments: number;
    remainingBalance: number;
    institution: string;
};

export type AssetAllocation = {
  name: string;
  value: number;
  fill: string;
};

export type MonthlyFlow = {
  month: string;
  income: number;
  expenses: number;
}


export type Company = {
  id: string;
  name: string;
};

export type CompanyTransaction = {
  id: string;
  companyId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
};

export type Payable = {
  id: string;
  companyId: string;
  description: string;
  value: number;
  dueDate: string;
};

export type Receivable = {
  id: string;
  companyId: string;
  description: string;
  value: number;
  dueDate: string;
};
