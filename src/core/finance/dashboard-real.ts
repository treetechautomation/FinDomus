import { getMonthlySummary, getLastSixMonthsSummaryFlow } from '@/services/firestore';
import { getTaxObligations } from '@/services/firestore/fiscal';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getTransactionsByMonthList } from '@/services/firestore/transactions';
import { getCashflowProjection } from '@/core/finance/cashflow';
import { buildDRE } from "@/core/finance/dre-engine";
import { getMonthData } from "@/core/finance/month-reader";
import {
  getCurrentMonthKey,
  getLastMonths,
  isTransactionInMonth,
  parseMonthKey,
} from "@/core/finance/financial-period-engine";

function getLastSixMonthsFlow(transactions: any[], baseMonth = getCurrentMonthKey()) {
  const months = getLastMonths(6, baseMonth).map((monthKey) => {
    const d = parseMonthKey(monthKey);

    return {
      monthKey,
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      income: 0,
      expenses: 0,
    };
  });

  for (const transaction of transactions) {
    const bucket = months.find((item) =>
      isTransactionInMonth(transaction, item.monthKey)
    );

    if (!bucket) continue;

    const amount = Number(transaction.amount || 0);

    if (transaction.type === 'income') {
      bucket.income += amount;
    }

    if (transaction.type === 'expense') {
      bucket.expenses += Math.abs(amount);
    }
  }

  return months.map(({ month, income, expenses }) => ({
    month,
    income,
    expenses,
  }));
}

function getAccountTypeLabel(type: string) {
  switch (type) {
    case 'checking':
      return 'Conta Corrente';
    case 'investment':
      return 'Investimentos';
    case 'wallet':
      return 'Carteira';
    case 'credit_card':
      return 'Cartões';
    case 'savings':
      return 'Poupança';
    default:
      return type || 'Outros';
  }
}

function getAccountAllocation(accounts: any[]) {
  const grouped = new Map<string, number>();

  for (const account of accounts) {
    const label = getAccountTypeLabel(account.type);
    const current = grouped.get(label) ?? 0;
    grouped.set(label, current + Number(account.balance || 0));
  }

  const fallbackColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return Array.from(grouped.entries())
    .filter(([, value]) => value !== 0)
    .map(([name, value], index) => ({
      name,
      value,
      fill: fallbackColors[index % fallbackColors.length],
    }));
}

export async function getDashboardReal(userId: string) {
  if (!userId) throw new Error("userId required for dashboard");
  const currentMonthKey = getCurrentMonthKey();

  // Otimização: buscamos apenas os últimos 6 meses de transações PF+PJ.
  // O dashboard nunca exibe dados além dessa janela — o full scan era desnecessário.
  // PJ e PF são buscados em paralelo para alimentar o gráfico e os cálculos mensais.
  const lastSixMonths = getLastMonths(6, currentMonthKey);

  const [
    accounts,
    taxObligations,
    liabilities,
    pfTransactions,
    pjTransactions,
  ] = await Promise.all([
    getAccountsWithBalance(userId),
    getTaxObligations(),
    getLiabilities(userId),
    getTransactionsByMonthList(userId, 'PF', lastSixMonths),
    getTransactionsByMonthList(userId, 'PJ', lastSixMonths),
  ]);

  // União PF+PJ para o gráfico de 6 meses e cálculos mensais combinados
  const transactions = [...pfTransactions, ...pjTransactions];

  // ===== SALDOS =====
  const totalPF = accounts
    .filter((a: any) => a.owner === 'PF')
    .reduce((sum: number, a: any) => sum + (a.balance || 0), 0);

  const totalPJ = accounts
    .filter((a: any) => a.owner === 'PJ')
    .reduce((sum: number, a: any) => sum + (a.balance || 0), 0);

  const total = totalPF + totalPJ;



    const monthData = await getMonthData({
      userId,
      owner: "PJ",
      month: currentMonthKey,
      // Passamos apenas as transações PJ do mês corrente para o engine de DRE
      transactions: pjTransactions.filter((t: any) =>
        isTransactionInMonth(t, currentMonthKey)
      ),
      accounts,
      liabilities,
      obligations: taxObligations,
    });

      const monthTransactions = transactions.filter((t: any) => {
        return (
          isTransactionInMonth(t, currentMonthKey) &&
          t.type !== 'transfer'
        );
      });

      const income = monthTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const expenses = monthTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);

      const balance = income - expenses;
      const dre = monthData.snapshot.dre;
    const cashflow = getCashflowProjection(
        accounts,
        taxObligations,
        liabilities,
        { days: 30, owner: 'ALL' }
      );
    const cashflowNoDebt = getCashflowProjection(
        accounts,
        taxObligations,
        [],
        { days: 30, owner: 'ALL' }
      );
    const cashflowWithExtra = getCashflowProjection(
      accounts.map((a: any) => ({ ...a, balance: Number(a.balance || 0) + 2000 })),
      taxObligations,
      liabilities,
      { days: 30, owner: 'ALL' }
    );

    return {
      cashflowScenarios: {
        atual: cashflow,
        semDividas: cashflowNoDebt,
        comEntrada: cashflowWithExtra,
      },
      totalPF,
      totalPJ,
      total,
      monthly: {
        income,
        expenses,
        balance,
      },
      monthlyFlow: getLastSixMonthsFlow(
          transactions.filter(
            (t: any) => t.type !== 'transfer'
          )
        ),
      allocation: getAccountAllocation(accounts),
      dre,
      cashflow,
    };
  }
