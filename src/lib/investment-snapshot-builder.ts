import { getInvestments } from '@/services/firestore/investments';
import { getInvestmentYields } from '@/services/firestore/yields';
import { consolidatePortfolio, type ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import { generateInvestmentAnalytics } from '@/core/investments/analytics/analytics-engine';
import { createDataContract } from './data-contract';
import { logger } from './logger';
import { metrics } from './system-metrics';
import type { InvestmentSnapshot, InvestmentSnapshotData } from './investment-snapshot-types';

export async function buildInvestmentSnapshot(
  userId: string,
  previousVersion: number,
): Promise<{ snapshot: InvestmentSnapshot; sourceReads: number }> {
  const start = performance.now();

  const [portfolio, yields] = await Promise.all([
    consolidatePortfolio(userId),
    getInvestmentYields(userId),
  ]);

  // consolidatePortfolio already reads 6 collections internally
  let sourceReads = 7;

  const analytics = generateInvestmentAnalytics(
    portfolio,
    yields.map((y) => ({
      ticker: y.ticker,
      amount: y.amount,
      date: y.date,
      type: y.type,
      year: y.date ? Number(y.date.slice(0, 4)) : new Date().getFullYear(),
    })),
  );

  const topAssets = [...portfolio.assets]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 10)
    .map((a) => ({
      ticker: a.ticker,
      name: a.name,
      assetClass: a.assetClass,
      marketValue: a.marketValue,
      profitPercent: a.profitPercent,
      participationPercent: a.participationPercent,
    }));

  const totalDividends = yields.reduce((s, y) => s + (y.amount || 0), 0);

  const data: InvestmentSnapshotData = {
    totalInvested: portfolio.totalInvested,
    totalMarketValue: portfolio.totalMarketValue,
    totalProfit: portfolio.totalProfit,
    profitPercent: portfolio.totalProfitPercent,
    dividendYield: analytics.dividends?.dividendYield || 0,
    yieldOnCost: analytics.dividends?.yieldOnCost || 0,
    totalDividendsReceived: totalDividends,
    healthScore: analytics.health?.score || 0,
    healthGrade: analytics.health?.grade || 'F',
    diversificationScore: analytics.risk?.diversificationScore || 0,
    allocationByClass: (analytics.allocation?.byClass || []).map((c: any) => ({
      name: c.name || c.assetClass || '',
      value: c.value || c.marketValue || 0,
      percent: c.percent || c.participationPercent || 0,
    })),
    allocationByInstitution: (analytics.allocation?.byInstitution || []).map((i: any) => ({
      name: i.name || i.institution || '',
      value: i.value || i.marketValue || 0,
    })),
    allocationByOrigin: (analytics.allocation?.byOrigin || []).map((o: any) => ({
      name: o.name || o.origin || '',
      value: o.value || o.marketValue || 0,
    })),
    topAssets,
    riskAlerts: (analytics.risk?.concentrationAlerts || []).map((a: any) => String(a.message || a.alert || a)),
    insights: (analytics.insights || []).map((i: any) => String(i.message || i.title || i)),
  };

  const end = performance.now();
  const buildTimeMs = Math.round(end - start);

  const contract = createDataContract(userId, 'investment', 'ULTRA_CRITICO', 1);
  const snapshot: InvestmentSnapshot = {
    ...contract,
    domain: 'investment',
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

  metrics.track(userId, 'snapshot_build_time_ms', buildTimeMs, 'investment');
  metrics.track(userId, 'firestore_reads', sourceReads, 'investment');
  logger.info('investment_snapshot_built', userId, { buildTimeMs, sourceReads, dataVersion: snapshot.dataVersion });

  return { snapshot, sourceReads };
}
