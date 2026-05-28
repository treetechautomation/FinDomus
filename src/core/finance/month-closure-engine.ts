import {
  getCurrentMonthKey,
  isTransactionInMonth,
} from '@/core/finance/financial-period-engine';

export function buildMonthSnapshot({
  monthKey = getCurrentMonthKey(),
  transactions = [],
  liabilities = [],
  recurringExpenses = [],
  taxObligations = [],
}: any) {
  const monthTransactions = transactions.filter((t: any) =>
    isTransactionInMonth(t, monthKey)
  );

  const income = monthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce(
      (sum: number, t: any) =>
        sum + Number(t.amount || 0),
      0
    );

  const expenses = monthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce(
      (sum: number, t: any) =>
        sum + Math.abs(Number(t.amount || 0)),
      0
    );

  const transfers = monthTransactions
    .filter((t: any) => t.type === 'transfer')
    .reduce(
      (sum: number, t: any) =>
        sum + Math.abs(Number(t.amount || 0)),
      0
    );

  const liabilitiesSnapshot = liabilities
    .filter(
      (l: any) =>
        (l.competenceMonthKey || '') <= monthKey
    )
    .reduce(
      (sum: number, l: any) =>
        sum + Number(l.remainingBalance || 0),
      0
    );

  const recurringSnapshot = recurringExpenses
    .filter((r: any) => r.active)
    .reduce(
      (sum: number, r: any) =>
        sum + Number(r.amount || 0),
      0
    );

  const taxesSnapshot = taxObligations
    .filter(
      (o: any) =>
        (o.competenceMonthKey || o.monthKey) === monthKey
    )
    .reduce(
      (sum: number, o: any) =>
        sum + Number(o.amount || 0),
      0
    );

  return {
    monthKey,
    closedAt: new Date().toISOString(),

    kpis: {
      income,
      expenses,
      transfers,
      operationalBalance:
        income - expenses,
    },

    commitments: {
      liabilities: liabilitiesSnapshot,
      recurring: recurringSnapshot,
      taxes: taxesSnapshot,
    },

    metadata: {
      transactions: monthTransactions.length,
      generatedBy: 'month-closure-engine',
    },
  };
}
