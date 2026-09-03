import { buildDRE } from '@/core/finance/dre-engine';
import { getIncomeEffect, getExpenseEffect } from '@/core/finance/transaction-effects';

export function buildMonthlySnapshot(params: {
  owner: 'PF' | 'PJ';
  month: string;
  transactions: any[];
  accounts?: any[];
  liabilities?: any[];
  obligations?: any[];
}) {
  const {
    owner,
    month,
    transactions,
    accounts = [],
    liabilities = [],
    obligations = [],
  } = params;

  const income = transactions.reduce((sum: number, t: any) => {
    return sum + getIncomeEffect(t);
  }, 0);

  const expenses = transactions.reduce((sum: number, t: any) => {
    return sum + getExpenseEffect(t);
  }, 0);

  const balance = income - expenses;

  const dre =
    owner === 'PJ'
      ? buildDRE(transactions)
      : null;

  const accountBalance = accounts.reduce((sum: number, account: any) => {
    return sum + Number(account.balance || 0);
  }, 0);

  const liabilitiesBalance = liabilities.reduce((sum: number, item: any) => {
    return sum + Number(item.remainingAmount || item.amount || 0);
  }, 0);

  const pendingObligations = obligations
    .filter((item: any) => item.status === 'pending')
    .reduce((sum: number, item: any) => {
      return sum + Number(item.value || 0);
    }, 0);

  return {
    owner,
    month,

    generatedAt: new Date().toISOString(),

    kpis: {
      income,
      expenses,
      balance,
      transactionsCount: transactions.length,
    },

    dre,

    patrimony: {
      accounts: accountBalance,
      liabilities: liabilitiesBalance,
      netWorth: accountBalance - liabilitiesBalance,
    },

    fiscal: {
      pendingObligations,
      obligationsCount: obligations.length,
    },

    metadata: {
      snapshotVersion: 1,
      engine: 'snapshot-engine',
    },
  };
}
