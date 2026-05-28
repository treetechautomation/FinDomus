export type Company = {
  id?: string;
  name: string;
  createdAt: string;
};

export type Account = {
  id?: string;
  name: string;
  type: string;
  owner: "PF" | "PJ";
  companyId?: string | null;
  balance: number;
  createdAt: string;
};

export type Investment = {
  id?: string;
  type: string;
  institution: string;

  ticker?: string;

  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;

  currentValue?: number;
  contributions?: number;

  objective?: string;
  liquidity?: string;
  goal?: number;

  createdAt?: string;
  updatedAt?: string;
  lastUpdate?: string;
};

export type Liability = {
  id?: string;
  name: string;
  type: "Financiamento" | "Empréstimo" | "Cartão" | "Outro";
  installmentValue: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingBalance: number;
  institution: string;
  createdAt?: string;
};
