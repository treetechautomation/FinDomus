import { getLiabilities } from '@/services/firestore/liabilities';
import { buildMonthlyProjection } from '@/core/finance/liability-engine';
import { getCurrentMonthKey } from '@/core/finance/financial-period-engine';
import { createDataContract } from './data-contract';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { LiabilitySnapshot, LiabilitySnapshotData } from './liability-snapshot-types';

export async function buildLiabilitySnapshot(
  userId: string,
  previousVersion: number,
): Promise<{ snapshot: LiabilitySnapshot; sourceReads: number }> {
  const start = performance.now();

  const liabilities = await getLiabilities(userId);
  const sourceReads = 1;

  const active = liabilities.filter((l: any) => Number(l.remainingBalance || 0) > 0);
  const paidOff = liabilities.filter((l: any) => Number(l.remainingBalance || 0) <= 0);

  const totalLiabilities = active.reduce((s: number, l: any) => s + Number(l.remainingBalance || 0), 0);
  const monthlyCommitment = active.reduce((s: number, l: any) => s + Number(l.installmentValue || 0), 0);

  const baseMonth = getCurrentMonthKey();
  const projection = buildMonthlyProjection(active, baseMonth);

  const allInstallments = active.filter((l: any) => Number(l.totalInstallments || 0) > 0);
  const avgInterest = allInstallments.length > 0
    ? allInstallments.reduce((s: number, l: any) => {
        const total = Number(l.installmentValue || 0) * Number(l.totalInstallments || 0);
        const borrowed = Number(l.remainingBalance || 0) + (Number(l.currentInstallment || 0) * Number(l.installmentValue || 0));
        return s + (borrowed > 0 ? ((total - borrowed) / borrowed) * 100 : 0);
      }, 0) / allInstallments.length
    : 0;

  const totalBorrowed = liabilities.reduce((s: number, l: any) => {
    return s + (Number(l.installmentValue || 0) * Number(l.totalInstallments || 0));
  }, 0);

  const totalPaid = totalBorrowed - totalLiabilities;
  const payoffPercent = totalBorrowed > 0 ? (totalPaid / totalBorrowed) * 100 : 0;

  const topRisks = [...active]
    .sort((a, b) => Number(b.remainingBalance || 0) - Number(a.remainingBalance || 0))
    .slice(0, 5)
    .map((l: any) => {
      const remaining = Math.max(Number(l.totalInstallments || 0) - Number(l.currentInstallment || 0), 0);
      return {
        name: String(l.name || '').slice(0, 60),
        remainingBalance: Number(l.remainingBalance || 0),
        installmentValue: Number(l.installmentValue || 0),
        remainingMonths: remaining,
      };
    });

  const data: LiabilitySnapshotData = {
    totalLiabilities,
    monthlyCommitment,
    activeCount: active.length,
    paidOffCount: paidOff.length,
    averageInterestRate: Math.round(avgInterest * 100) / 100,
    debtPressure: monthlyCommitment > 0 ? (totalLiabilities / (monthlyCommitment * 12)) * 100 : 0,
    payoffProgress: {
      totalPaid,
      totalRemaining: totalLiabilities,
      percentComplete: Math.round(payoffPercent * 100) / 100,
    },
    projection,
    topRisks,
  };

  const end = performance.now();
  const buildTimeMs = Math.round(end - start);

  const contract = createDataContract(userId, 'liability', 'ULTRA_CRITICO', 1);
  const snapshot: LiabilitySnapshot = {
    ...contract,
    domain: 'liability',
    classification: 'ULTRA_CRITICO',
    status: 'READY',
    health: 'GOOD',
    buildTimeMs,
    dataVersion: previousVersion + 1,
    schemaVersion: 1,
    kernelVersion: 1,
    metrics: { sourceReads, sourceWrites: 0, cacheHits: 0 },
    metadata: { ...contract.metadata, triggeredBy: ['scheduler'], previousVersion },
    data,
  };

  metrics.track(userId, 'snapshot_build_time_ms', buildTimeMs, 'liability');
  metrics.track(userId, 'firestore_reads', sourceReads, 'liability');
  logger.info('liability_snapshot_built', userId, { buildTimeMs, sourceReads, dataVersion: snapshot.dataVersion });

  return { snapshot, sourceReads };
}
