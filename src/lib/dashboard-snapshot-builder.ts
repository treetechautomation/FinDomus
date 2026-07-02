import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getRecurringExpenses, getWealthProfile } from '@/services/firestore/planning';
import { getTransactionsByMonthList } from '@/services/firestore/transactions';
import { getMonthlyClosures } from '@/services/firestore/monthly-closures';
import { runFinancialKernel } from '@/core/finance/kernel';
import { getCurrentMonthKey, getLastMonths, isTransactionInMonth } from '@/core/finance/financial-period-engine';
import { createDataContract } from './data-contract';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { DashboardSnapshot, DashboardSnapshotData } from './dashboard-snapshot-types';

function getAccountTypeLabel(type: string): string {
  switch (type) {
    case 'checking': return 'Conta Corrente';
    case 'investment': return 'Investimentos';
    case 'wallet': return 'Carteira';
    case 'credit_card': return 'Cartões';
    case 'savings': return 'Poupança';
    default: return type || 'Outros';
  }
}

function getAccountAllocation(accounts: any[]): Array<{ name: string; value: number; fill: string }> {
  const grouped = new Map<string, number>();
  for (const account of accounts) {
    const label = getAccountTypeLabel(account.type);
    const current = grouped.get(label) ?? 0;
    grouped.set(label, current + Number(account.balance || 0));
  }
  const fallbackColors = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
    'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
  ];
  return Array.from(grouped.entries())
    .filter(([, value]) => value !== 0)
    .map(([name, value], index) => ({ name, value, fill: fallbackColors[index % fallbackColors.length] }));
}

function getMonthlyFlow(transactions: any[], baseMonth: string): Array<{ month: string; income: number; expenses: number }> {
  const months = getLastMonths(6, baseMonth).map((monthKey) => {
    const [year, monthNum] = monthKey.split('-');
    const date = new Date(Number(year), Number(monthNum) - 1, 1);
    return {
      monthKey,
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      income: 0,
      expenses: 0,
    };
  });

  for (const t of transactions) {
    const bucket = months.find((item) => isTransactionInMonth(t, item.monthKey));
    if (!bucket) continue;
    const amount = Number(t.amount || 0);
    if (t.type === 'income') bucket.income += amount;
    if (t.type === 'expense') bucket.expenses += Math.abs(amount);
  }

  return months.map(({ month, income, expenses }) => ({ month, income, expenses }));
}

export async function buildDashboardSnapshot(
  userId: string,
  previousVersion: number,
): Promise<{ snapshot: DashboardSnapshot; sourceReads: number }> {
  const start = performance.now();
  let sourceReads = 0;

  const currentMonth = getCurrentMonthKey();
  const lastSixMonths = getLastMonths(6, currentMonth);

  const [
    accounts,
    investments,
    liabilities,
    pfTransactions,
    pjTransactions,
    recurringExpenses,
    wealthProfile,
    monthlyClosures,
  ] = await Promise.all([
    getAccountsWithBalance(userId),
    getInvestments(userId),
    getLiabilities(userId),
    getTransactionsByMonthList(userId, 'PF', lastSixMonths),
    getTransactionsByMonthList(userId, 'PJ', lastSixMonths),
    getRecurringExpenses(userId),
    getWealthProfile(userId),
    getMonthlyClosures(userId, 'PF'),
  ]);

  sourceReads = 8;

  const transactions = [...pfTransactions, ...pjTransactions];

  const totalPF = accounts.filter((a: any) => a.owner === 'PF').reduce((s: number, a: any) => s + Number(a.balance || 0), 0);
  const totalPJ = accounts.filter((a: any) => a.owner === 'PJ').reduce((s: number, a: any) => s + Number(a.balance || 0), 0);

  const totalInvestments = investments.reduce((s: number, i: any) => {
    if (i.currentValue !== undefined && i.currentValue !== null) return s + Number(i.currentValue);
    if (i.quantity && i.currentPrice) return s + Number(i.quantity) * Number(i.currentPrice);
    return s;
  }, 0);

  const activeLiabilities = liabilities.filter((l: any) => Number(l.remainingBalance || 0) > 0);
  const totalLiabilities = activeLiabilities.reduce((s: number, l: any) => s + Number(l.remainingBalance || 0), 0);

  const netWorth = (totalPF + totalPJ + totalInvestments) - totalLiabilities;

  const monthTransactions = transactions.filter((t: any) =>
    isTransactionInMonth(t, currentMonth) && t.type !== 'transfer'
  );

  const monthlyIncome = monthTransactions.filter((t: any) => t.type === 'income')
    .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
  const monthlyExpenses = monthTransactions.filter((t: any) => t.type === 'expense')
    .reduce((s: number, t: any) => s + Math.abs(Number(t.amount || 0)), 0);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  const kernelResult = runFinancialKernel({
    accounts,
    investments,
    liabilities,
    transactions: [...transactions],
    recurringExpenses: recurringExpenses || [],
    taxObligations: [],
    wealthProfile: wealthProfile || null,
    monthlyClosures: monthlyClosures || [],
    investmentAnalytics: null,
    baseMonth: currentMonth,
  });

  const data: DashboardSnapshotData = {
    totalPF,
    totalPJ,
    totalInvestments,
    totalLiabilities,
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    monthlyBalance,
    freedomIndex: kernelResult.freedom.index.freedomIndex,
    freedomLevel: kernelResult.freedom.index.levelLabel,
    freedomBreakdown: kernelResult.freedom.index.breakdown,
    allocation: getAccountAllocation(accounts),
    monthlyFlow: getMonthlyFlow(transactions.filter((t: any) => t.type !== 'transfer'), currentMonth),
  };

  const end = performance.now();
  const buildTimeMs = Math.round(end - start);

  const contract = createDataContract(userId, 'dashboard', 'ULTRA_CRITICO', 1);
  const snapshot: DashboardSnapshot = {
    ...contract,
    domain: 'dashboard',
    classification: 'ULTRA_CRITICO',
    status: 'READY',
    health: 'GOOD',
    buildTimeMs,
    dataVersion: previousVersion + 1,
    schemaVersion: 1,
    kernelVersion: 1,
    metrics: { sourceReads, sourceWrites: 0, cacheHits: kernelResult.cacheHits },
    metadata: {
      ...contract.metadata,
      triggeredBy: ['scheduler'],
      previousVersion,
    },
    data,
  };

  metrics.track(userId, 'snapshot_build_time_ms', buildTimeMs, 'dashboard');
  metrics.track(userId, 'firestore_reads', sourceReads, 'dashboard');
  logger.info('dashboard_snapshot_built', userId, { buildTimeMs, sourceReads, dataVersion: snapshot.dataVersion });

  return { snapshot, sourceReads };
}
