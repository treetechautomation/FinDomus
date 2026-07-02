import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getPersonalTransactions } from '@/services/firestore/transactions';
import { getRecurringExpenses, getWealthProfile } from '@/services/firestore/planning';
import { getMonthlyClosures } from '@/services/firestore/monthly-closures';
import { runFinancialKernel } from '@/core/finance/kernel';
import { buildMonthlyProjection } from '@/core/finance/liability-engine';
import { getCurrentMonthKey } from '@/core/finance/financial-period-engine';
import { createDataContract } from './data-contract';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { PlanningSnapshot, PlanningSnapshotData } from './planning-snapshot-types';

export async function buildPlanningSnapshot(
  userId: string,
  previousVersion: number,
): Promise<{ snapshot: PlanningSnapshot; sourceReads: number }> {
  const start = performance.now();

  const currentMonth = getCurrentMonthKey();

  const [
    accounts,
    investments,
    liabilities,
    transactions,
    recurringExpenses,
    wealthProfile,
    monthlyClosures,
  ] = await Promise.all([
    getAccountsWithBalance(userId),
    getInvestments(userId),
    getLiabilities(userId),
    getPersonalTransactions(userId),
    getRecurringExpenses(userId),
    getWealthProfile(userId),
    getMonthlyClosures(userId, 'PF'),
  ]);

  const sourceReads = 7;

  const kernelResult = runFinancialKernel({
    accounts,
    investments,
    liabilities,
    transactions,
    recurringExpenses: recurringExpenses || [],
    taxObligations: [],
    wealthProfile: wealthProfile || null,
    monthlyClosures: monthlyClosures || [],
    investmentAnalytics: null,
    baseMonth: currentMonth,
  });

  const { freedom, wealth, dre, reserve, ai, financialCore, forecast, projections } = kernelResult;

  const activeLiabilities = liabilities.filter((l: any) => Number(l.remainingBalance || 0) > 0);
  const monthlyProjection = buildMonthlyProjection(activeLiabilities, currentMonth);

  const data: PlanningSnapshotData = {
    freedomIndex: freedom.index.freedomIndex,
    freedomLevel: freedom.index.levelLabel,
    freedomBreakdown: freedom.index.breakdown,
    freedomTimeline: (freedom.timeline.milestones || []).map((m: any) => ({
      label: m.label,
      description: m.description,
      date: m.date,
      completed: m.completed,
      icon: m.icon || '📍',
    })),
    actionPlan: (freedom.actions || []).slice(0, 10).map((a: any) => ({
      title: a.title,
      description: a.description,
      priority: a.priority,
      impactPts: a.impactPts,
      impactR$: a.impactR$,
      cta: a.cta,
      href: a.href,
      effort: a.effort,
    })),
    emergencyReserve: {
      reserveAmount: reserve.reserveAmount,
      essentialMonthlyExpenses: reserve.essentialMonthlyExpenses,
      targetMonths: reserve.targetMonths,
      targetAmount: reserve.targetAmount,
      reserveGap: reserve.reserveGap,
      reservePercent: reserve.reservePercent,
      coveredMonths: reserve.coveredMonths,
    },
    forecast: (forecast || []).map((f: any) => ({
      month: f.month,
      projectedBalance: f.projectedBalance,
      projectedIncome: f.projectedIncome || 0,
      projectedExpenses: f.projectedExpenses || 0,
    })),
    wealthAnalysis: (wealth?.analysis || []).map((w: any) => ({
      pilar: w.pilar,
      metaPercent: w.metaPercent,
      realizadoPercent: w.realizadoPercent,
      diferencaPercent: w.diferencaPercent,
      status: w.status,
    })),
    dre: {
      receitaTotal: dre.receitaTotal,
      despesasOperacionais: dre.despesasOperacionais,
      essenciais: dre.essenciais,
      qualidadeVida: dre.qualidadeVida,
      estiloVida: dre.estiloVida,
      educacao: dre.educacao,
      saude: dre.saude,
      construcaoPatrimonial: dre.construcaoPatrimonial,
      outros: dre.outros,
      taxaAcumulacao: dre.taxaAcumulacao,
    },
    financialCore: {
      netWorth: financialCore.netWorth,
      cashBalance: financialCore.cashBalance,
      monthlyDebtPayment: financialCore.monthlyDebtPayment,
    },
    monthlyProjection,
    insights: (ai?.insights || []).map((i: any) => ({
      type: i.type,
      title: i.title,
      description: i.description,
      confidence: i.confidence,
    })),
  };

  const end = performance.now();
  const buildTimeMs = Math.round(end - start);

  const contract = createDataContract(userId, 'planning', 'CRITICO', 1);
  const snapshot: PlanningSnapshot = {
    ...contract,
    domain: 'planning',
    classification: 'CRITICO',
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

  metrics.track(userId, 'snapshot_build_time_ms', buildTimeMs, 'planning');
  metrics.track(userId, 'firestore_reads', sourceReads, 'planning');
  logger.info('planning_snapshot_built', userId, { buildTimeMs, sourceReads, dataVersion: snapshot.dataVersion });

  return { snapshot, sourceReads };
}
