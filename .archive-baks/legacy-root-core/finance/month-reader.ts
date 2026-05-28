import { getMonthlyClosure } from '@/services/firestore/monthly-closures';
import { buildMonthlySnapshot } from '@/core/finance/snapshot-engine';

export async function getMonthData(params: {
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

  const closure = await getMonthlyClosure(owner, month);

  // ===== SNAPSHOT CONGELADO =====
  if (
    closure?.status === 'CLOSED' &&
    closure?.snapshot
  ) {
    return {
      source: 'snapshot',
      closed: true,
      closure,
      snapshot: closure.snapshot,
    };
  }

  // ===== REALTIME =====
  const monthTransactions = transactions.filter((t: any) => {
    return (
      t.owner === owner &&
      (t.competenceMonthKey || t.monthKey) === month
    );
  });

  const snapshot = buildMonthlySnapshot({
    owner,
    month,
    transactions: monthTransactions,
    accounts: accounts.filter((a: any) => a.owner === owner),
    liabilities: liabilities.filter((l: any) => l.owner === owner),
    obligations: obligations.filter((o: any) => o.owner === owner),
  });

  return {
    source: 'realtime',
    closed: false,
    closure,
    snapshot,
  };
}
