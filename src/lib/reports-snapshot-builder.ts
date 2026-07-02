import { getTransactionsByMonth } from '@/services/firestore/transactions';
import { getMonthlyClosure } from '@/services/firestore/monthly-closures';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { buildDRE } from '@/core/finance/dre-engine';
import { createDataContract } from './data-contract';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { ReportsSnapshot, ReportsSnapshotData } from './reports-snapshot-types';

export async function buildReportsSnapshot(
  userId: string,
  owner: 'PF' | 'PJ',
  monthKey: string,
  previousVersion: number,
): Promise<{ snapshot: ReportsSnapshot; sourceReads: number }> {
  const start = performance.now();

  const [transactions, closure, accounts] = await Promise.all([
    getTransactionsByMonth(userId, owner, monthKey),
    getMonthlyClosure(userId, owner, monthKey),
    getAccountsWithBalance(userId),
  ]);

  const sourceReads = 3;

  const income = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

  const expenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((s: number, t: any) => s + Math.abs(Number(t.amount || 0)), 0);

  const balance = income - expenses;

  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const cat = t.category || 'Outros';
    byCategory[cat] = (byCategory[cat] || 0) + Math.abs(Number(t.amount || 0));
  }

  const dre = owner === 'PJ' ? buildDRE(transactions) : null;

  const ownerAccounts = accounts.filter((a: any) => a.owner === owner);
  const closingBalance = ownerAccounts.reduce((s: number, a: any) => s + Number(a.balance || 0), 0);

  const openingBalance = closure?.cashflow?.openingBalance
    ?? Number((closingBalance - balance).toFixed(2));

  const data: ReportsSnapshotData = {
    owner,
    monthKey,
    income,
    expenses,
    balance,
    dre: dre ? {
      receitaBruta: (dre as any).receitaBruta || 0,
      impostos: (dre as any).impostos || 0,
      receitaLiquida: (dre as any).receitaLiquida || 0,
      despesas: (dre as any).despesas || 0,
      pessoas: (dre as any).pessoas || 0,
      proLabore: (dre as any).proLabore || 0,
      outros: (dre as any).outros || 0,
      lucroBruto: (dre as any).lucroBruto || 0,
      lucroOperacional: (dre as any).lucroOperacional || 0,
      lucroLiquido: (dre as any).lucroLiquido || 0,
    } : null,
    byCategory,
    transactionCount: transactions.length,
    openingBalance,
    closingBalance,
  };

  const end = performance.now();
  const buildTimeMs = Math.round(end - start);

  const contract = createDataContract(userId, 'reports', 'ULTRA_CRITICO', 1);
  const snapshot: ReportsSnapshot = {
    ...contract,
    domain: 'reports',
    classification: 'ULTRA_CRITICO',
    owner,
    monthKey,
    status: 'READY',
    health: 'GOOD',
    buildTimeMs,
    dataVersion: previousVersion + 1,
    schemaVersion: 1,
    kernelVersion: 1,
    metrics: { sourceReads, sourceWrites: 0, cacheHits: 0 },
    metadata: { ...contract.metadata, triggeredBy: ['month:closed'], previousVersion },
    data,
  };

  metrics.track(userId, 'snapshot_build_time_ms', buildTimeMs, 'reports');
  metrics.track(userId, 'firestore_reads', sourceReads, 'reports');
  logger.info('reports_snapshot_built', userId, { owner, monthKey, buildTimeMs });

  return { snapshot, sourceReads };
}
