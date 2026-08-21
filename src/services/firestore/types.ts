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

  // ACCOUNTS.IMPORT.BALANCE.1D — identidade bancária opcional, usada apenas
  // para SUGERIR a conta correspondente na importação de OFX (nunca para
  // selecionar automaticamente sem confirmação humana). `externalAccountId`
  // é o ACCTID do OFX — um domínio de identidade distinto de `id` (o
  // accountId interno do FinDomus). Nenhuma conta existente hoje possui
  // esses campos preenchidos; ficam disponíveis para popular futuramente
  // (fora do escopo desta fase, que é code-only/sem writes).
  bankId?: string;
  externalAccountId?: string;
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
  userId?: string;
  name: string;
  type: "Financiamento" | "Empréstimo" | "Cartão" | "Outro";
  installmentValue: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingInstallments?: number;
  remainingBalance: number;
  institution: string;
  owner?: "PF" | "PJ";
  competenceMonthKey?: string | null;
  category?: string;
  source?: string;
  status?: "active" | "paid" | "renegotiated";
  installmentKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface LiabilityPayment {
  id?: string;
  liabilityId: string;
  userId: string;
  owner: "PF" | "PJ";
  transactionId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  competenceMonthKey: string;
  paidAt: string;
  status: "paid" | "reversed";
  createdAt?: string;
  updatedAt?: string;
}

