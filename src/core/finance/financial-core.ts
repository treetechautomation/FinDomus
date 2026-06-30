export type FinancialAccount = {
  id?: string;
  owner?: "PF" | "PJ";
  balance?: number;
  type?: string;
  name?: string;
};

export type FinancialInvestment = {
  id?: string;
  type?: string;
  name?: string;
  currentValue?: number;
  contributions?: number;
  quantity?: number;
  currentPrice?: number;
  averagePrice?: number;
};

export type FinancialLiability = {
  id?: string;
  remainingBalance?: number;
  installmentValue?: number;
  currentInstallment?: number;
  totalInstallments?: number;
};

export type FinancialCoreInput = {
  accounts?: FinancialAccount[];
  investments?: FinancialInvestment[];
  liabilities?: FinancialLiability[];
};

export function getInvestmentCurrentValue(item: FinancialInvestment) {
  const quantity = Number(item.quantity || 0);
  const currentPrice = Number(item.currentPrice || 0);

  if (quantity > 0 && currentPrice > 0) {
    return quantity * currentPrice;
  }

  return Number(item.currentValue || 0);
}

export function getInvestmentInvestedValue(item: FinancialInvestment) {
  const quantity = Number(item.quantity || 0);
  const averagePrice = Number(item.averagePrice || 0);

  if (quantity > 0 && averagePrice > 0) {
    return quantity * averagePrice;
  }

  return Number(item.contributions || 0);
}

export function getActiveLiabilities(liabilities: FinancialLiability[] = []) {
  return liabilities.filter((item) => {
    const total = Number(item.totalInstallments || 0);
    const current = Number(item.currentInstallment || 0);
    const balance = Number(item.remainingBalance || 0);

    return total > 0 && current < total && balance > 0;
  });
}

export function calculateFinancialCore(input: FinancialCoreInput) {
  const accounts = input.accounts || [];
  const investments = input.investments || [];
  const liabilities = input.liabilities || [];

  const cashBalance = accounts
    .filter((account) => account.owner !== "PJ")
    .reduce((sum, account) => sum + Number(account.balance || 0), 0);

  const investmentValue = investments.reduce(
    (sum, item) => sum + getInvestmentCurrentValue(item),
    0
  );

  const investedAmount = investments.reduce(
    (sum, item) => sum + getInvestmentInvestedValue(item),
    0
  );

  const activeLiabilities = getActiveLiabilities(liabilities);

  const activeLiabilityBalance = activeLiabilities.reduce(
    (sum, item) => sum + Number(item.remainingBalance || 0),
    0
  );

  const monthlyDebtPayment = activeLiabilities.reduce(
    (sum, item) => sum + Number(item.installmentValue || 0),
    0
  );

  const grossAssets = cashBalance + investmentValue;
  const netWorth = grossAssets - activeLiabilityBalance;

  const debtRatio =
    grossAssets > 0 ? (activeLiabilityBalance / grossAssets) * 100 : 0;

  const investmentProfit = investmentValue - investedAmount;

  const investmentProfitPercent =
    investedAmount > 0 ? (investmentProfit / investedAmount) * 100 : 0;

  const diversificationScore =
    investments.length >= 5 ? 10 : investments.length >= 3 ? 6 : investments.length > 0 ? 3 : -5;

  const wealthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        70 +
          (netWorth > 0 ? 15 : -20) +
          (cashBalance > 0 ? 5 : -10) -
          Math.min(debtRatio, 50) +
          diversificationScore
      )
    )
  );

  const wealthStatus =
    wealthScore >= 80
      ? "Forte"
      : wealthScore >= 60
        ? "Saudável"
        : wealthScore >= 40
          ? "Atenção"
          : "Crítico";

  const recommendation =
    activeLiabilityBalance > grossAssets * 0.5
      ? "Priorize reduzir dívidas antes de aumentar risco na carteira."
      : cashBalance <= 0
        ? "Monte uma reserva de liquidez antes de novos aportes agressivos."
        : investments.length === 0
          ? "Comece com renda fixa e reserva antes de diversificar."
          : "Patrimônio em evolução. Continue aportando e rebalanceando pela meta.";

  return {
    cashBalance,
    investmentValue,
    investedAmount,
    investmentProfit,
    investmentProfitPercent,
    grossAssets,
    netWorth,
    activeLiabilities,
    activeLiabilityBalance,
    monthlyDebtPayment,
    debtRatio,
    wealthScore,
    wealthStatus,
    recommendation,
  };
}

const LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'wallet'];
const LIQUID_INVESTMENT_CLASSES = ['Renda Fixa'];

export type EmergencyReserveResult = {
  reserveAmount: number;
  essentialMonthlyExpenses: number;
  coveredMonths: number;
  targetMonths: number;
  targetAmount: number;
  reserveGap: number;
  reservePercent: number;
  liquidityAssets: {
    accounts: Array<{ id: string; name: string; type: string; balance: number }>;
    investments: Array<{ id: string; name: string; type: string; value: number }>;
  };
  excludedAssets: {
    accounts: Array<{ id: string; name: string; type: string; balance: number; reason: string }>;
    investments: Array<{ id: string; name: string; type: string; value: number; reason: string }>;
  };
  explanation: string;
};

export function calculateEmergencyReserve(params: {
  accounts: FinancialAccount[];
  investments: FinancialInvestment[];
  essentialMonthlyExpenses: number;
  targetMonths?: number;
}): EmergencyReserveResult {
  const targetMonths = params.targetMonths ?? 6;
  const essentialMonthlyExpenses = params.essentialMonthlyExpenses || 0;
  const targetAmount = essentialMonthlyExpenses * targetMonths;

  // 1. Filtrar contas líquidas (não PJ)
  const liquidAccounts = (params.accounts || [])
    .filter(a => a.owner !== 'PJ')
    .filter(a => LIQUID_ACCOUNT_TYPES.includes(a.type || 'checking'));

  const excludedAccounts = (params.accounts || [])
    .filter(a => a.owner !== 'PJ')
    .filter(a => !LIQUID_ACCOUNT_TYPES.includes(a.type || 'checking'));

  // 2. Filtrar investimentos com liquidez (classe Renda Fixa)
  const liquidInvestments = (params.investments || [])
    .filter(i => LIQUID_INVESTMENT_CLASSES.some(cls => 
      (i.type || '').toLowerCase().includes(cls.toLowerCase())
    ));

  const excludedInvestments = (params.investments || [])
    .filter(i => !LIQUID_INVESTMENT_CLASSES.some(cls => 
      (i.type || '').toLowerCase().includes(cls.toLowerCase())
    ));

  // 3. Somar
  const liquidAccountsTotal = liquidAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const liquidInvestmentsTotal = liquidInvestments.reduce((s, i) => {
    const val = i.currentValue ?? ((i.quantity || 0) * (i.currentPrice || 0));
    return s + (val || 0);
  }, 0);
  const reserveAmount = liquidAccountsTotal + liquidInvestmentsTotal;

  // 4. Calcular métricas
  const coveredMonths = essentialMonthlyExpenses > 0 
    ? reserveAmount / essentialMonthlyExpenses 
    : 0;
  const reserveGap = Math.max(0, targetAmount - reserveAmount);
  const reservePercent = targetAmount > 0 
    ? Math.min(100, (reserveAmount / targetAmount) * 100) 
    : 0;

  return {
    reserveAmount,
    essentialMonthlyExpenses,
    coveredMonths,
    targetMonths,
    targetAmount,
    reserveGap,
    reservePercent,
    liquidityAssets: {
      accounts: liquidAccounts.map(a => ({ 
        id: a.id || '', 
        name: (a as any).name || 'Conta', 
        type: a.type || 'checking', 
        balance: a.balance || 0 
      })),
      investments: liquidInvestments.map(i => ({ 
        id: i.id || '', 
        name: (i as any).name || (i as any).ticker || 'Renda Fixa', 
        type: i.type || 'Renda Fixa', 
        value: i.currentValue ?? ((i.quantity || 0) * (i.currentPrice || 0))
      })),
    },
    excludedAssets: {
      accounts: excludedAccounts.map(a => ({ 
        id: a.id || '', 
        name: (a as any).name || 'Conta Excluída', 
        type: a.type || 'checking', 
        balance: a.balance || 0, 
        reason: `Conta do tipo "${a.type}" não tem liquidez imediata` 
      })),
      investments: excludedInvestments.map(i => ({ 
        id: i.id || '', 
        name: (i as any).name || (i as any).ticker || 'Ativo Excluído', 
        type: i.type || 'Ações', 
        value: i.currentValue ?? ((i.quantity || 0) * (i.currentPrice || 0)), 
        reason: `Investimento do tipo "${i.type}" não possui liquidez diária` 
      })),
    },
    explanation: `Reserva: R$ ${reserveAmount.toFixed(2)} (contas líquidas + renda fixa). Despesas essenciais: R$ ${essentialMonthlyExpenses.toFixed(2)}/mês. Cobertura: ${coveredMonths.toFixed(1)} de ${targetMonths} meses.${reserveGap > 0 ? ` Faltam R$ ${reserveGap.toFixed(2)}.` : ' Meta atingida.'}`,
  };
}
