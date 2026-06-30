import { buildPFDRE } from './dre-engine';
import { calculateFinancialCore } from './financial-core';
import { buildMonthlyProjection } from './liability-engine';
import { buildForecast } from './forecast-engine';
import { buildPFWealthAnalysis } from './wealth-engine';
import {
  calculateFreedomIndex,
  calculateFreedomTimeline,
  generateActionPlan,
  estimatePreviousFreedomIndex,
} from './freedom-engine';
import { getFinancialAIInsights } from './financial-ai-engine';
import { getCurrentMonthKey, addMonths } from './financial-period-engine';
import type { PFDRE } from './dre-engine';
import type { PFWealthReport } from './wealth-engine';
import type { FreedomIndexResult, FreedomTimeline, ActionPlanItem } from './freedom-engine';

export type KernelContext = {
  accounts: any[];
  investments: any[];
  liabilities: any[];
  transactions: any[];
  recurringExpenses: any[];
  taxObligations: any[];
  wealthProfile: any;
  monthlyClosures: any[];
  investmentAnalytics: any | null;
  baseMonth?: string;
};

export type KernelResult = {
  dre: PFDRE;
  financialCore: ReturnType<typeof calculateFinancialCore>;
  projections: Record<string, number>;
  forecast: any[];
  wealth: PFWealthReport;
  freedom: {
    index: FreedomIndexResult;
    timeline: FreedomTimeline;
    actions: ActionPlanItem[];
  };
  ai: any;
  computedAt: string;
  kernelVersion: number;
  cacheHits: number;
  executionTimeMs: number;
};

type CacheEntry<T> = {
  value: T;
  hash: string;
  computedAt: number;
};

class KernelCache {
  private store = new Map<string, CacheEntry<any>>();

  get<T>(key: string, inputHash: string): T | null {
    const entry = this.store.get(key);
    if (entry && entry.hash === inputHash) {
      return entry.value as T;
    }
    return null;
  }

  set<T>(key: string, inputHash: string, value: T): void {
    this.store.set(key, { value, hash: inputHash, computedAt: Date.now() });
  }

  invalidate(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const kernelCache = new KernelCache();

export function runFinancialKernel(context: KernelContext): KernelResult {
  const start = performance.now();
  const baseMonth = context.baseMonth || getCurrentMonthKey();

  const accounts = context.accounts || [];
  const investments = context.investments || [];
  const liabilities = context.liabilities || [];
  const transactions = context.transactions || [];
  const recurringExpenses = context.recurringExpenses || [];
  const taxObligations = context.taxObligations || [];
  const wealthProfile = context.wealthProfile || null;
  const monthlyClosures = context.monthlyClosures || [];
  const investmentAnalytics = context.investmentAnalytics || null;

  // Generate input hashes for cache checks
  const txsHash = `${transactions.length}-${transactions.reduce((s, t) => s + (t.amount || 0), 0)}-${transactions.reduce((m, t) => Math.max(m, new Date(t.updatedAt || t.createdAt || 0).getTime()), 0)}`;
  const accountsHash = `${accounts.length}-${accounts.reduce((s, a) => s + (a.balance || 0), 0)}`;
  const investmentsHash = `${investments.length}-${investments.reduce((s, i) => s + (i.currentValue || i.quantity * (i.currentPrice || 0) || 0), 0)}`;
  const liabilitiesHash = `${liabilities.length}-${liabilities.reduce((s, l) => s + (l.remainingBalance || 0), 0)}-${liabilities.reduce((s, l) => s + (l.installmentValue || 0), 0)}`;
  const recurringHash = `${recurringExpenses.length}-${recurringExpenses.reduce((s, r) => s + (r.amount || 0), 0)}`;
  const taxHash = `${taxObligations.length}-${taxObligations.reduce((s, t) => s + (t.amount || 0), 0)}`;
  const profileHash = wealthProfile ? JSON.stringify(wealthProfile.categories) : 'null';
  const closuresHash = `${monthlyClosures.length}-${monthlyClosures.reduce((m, c) => Math.max(m, new Date(c.updatedAt || c.createdAt || 0).getTime()), 0)}`;
  const analyticsHash = investmentAnalytics ? `${investmentAnalytics.dividends?.dividendYield || 0}-${investmentAnalytics.risk?.diversificationScore || 0}` : 'null';

  let cacheHits = 0;

  // --- Engine 1: DRE ---
  const dreHash = `${txsHash}|${baseMonth}`;
  let dre = kernelCache.get<PFDRE>('dre', dreHash);
  if (!dre) {
    const filteredTransactions = transactions.filter((t: any) => {
      const monthKey = t.competenceMonthKey || t.monthKey || t.date?.slice(0, 7);
      return monthKey === baseMonth && t.owner === 'PF';
    });
    dre = buildPFDRE(filteredTransactions);
    kernelCache.set('dre', dreHash, dre);
  } else {
    cacheHits++;
  }

  // --- Engine 2: Financial Core ---
  const coreHash = `${accountsHash}|${investmentsHash}|${liabilitiesHash}`;
  let financialCore = kernelCache.get<ReturnType<typeof calculateFinancialCore>>('financialCore', coreHash);
  if (!financialCore) {
    financialCore = calculateFinancialCore({
      accounts,
      investments,
      liabilities,
    });
    kernelCache.set('financialCore', coreHash, financialCore);
  } else {
    cacheHits++;
  }

  // --- Engine 3: Liability Projections ---
  const projectionsHash = liabilitiesHash;
  let projections = kernelCache.get<Record<string, number>>('projections', projectionsHash);
  if (!projections) {
    projections = buildMonthlyProjection(liabilities, baseMonth);
    kernelCache.set('projections', projectionsHash, projections);
  } else {
    cacheHits++;
  }

  // --- Engine 4: Forecast ---
  const forecastHash = `${txsHash}|${liabilitiesHash}|${recurringHash}|${taxHash}`;
  let forecast = kernelCache.get<any[]>('forecast', forecastHash);
  if (!forecast) {
    forecast = buildForecast({
      transactions,
      liabilities,
      recurringExpenses,
      taxObligations,
      baseMonth,
      months: 6,
    });
    kernelCache.set('forecast', forecastHash, forecast);
  } else {
    cacheHits++;
  }

  // --- Engine 5: Wealth Analysis ---
  const wealthHash = `${dreHash}|${profileHash}`;
  let wealth = kernelCache.get<PFWealthReport>('wealth', wealthHash);
  if (!wealth) {
    wealth = buildPFWealthAnalysis(dre, wealthProfile);
    kernelCache.set('wealth', wealthHash, wealth);
  } else {
    cacheHits++;
  }

  // --- Engine 6: Freedom Index ---
  const freedomHash = `${coreHash}|${dreHash}|${projectionsHash}|${forecastHash}|${closuresHash}|${analyticsHash}`;
  let freedom = kernelCache.get<KernelResult['freedom']>('freedom', freedomHash);
  if (!freedom) {
    const realDividendYield = investmentAnalytics?.dividends?.dividendYield;
    const realDiversificationScore = investmentAnalytics?.risk?.diversificationScore;

    const currentMonthKey = getCurrentMonthKey();
    const previousMonthKey = addMonths(currentMonthKey, -1);
    const previousClosure = monthlyClosures.find((c: any) => c.month === previousMonthKey && c.owner === 'PF');
    const previousFreedomIndex = previousClosure ? estimatePreviousFreedomIndex(previousClosure) : undefined;

    const index = calculateFreedomIndex({
      accounts,
      investments,
      liabilities,
      dre,
      realDividendYield,
      realDiversificationScore,
      previousFreedomIndex,
    });

    const averageSurplus = forecast.length > 0
      ? forecast.reduce((sum: number, item: any) => sum + item.projectedBalance, 0) / forecast.length
      : 0;

    const timeline = calculateFreedomTimeline({
      accounts,
      investments,
      liabilities,
      dre,
      monthlyIncome: dre.receitaTotal,
      realSurplus: averageSurplus,
    });

    const actions = generateActionPlan(index, liabilities, accounts, dre);

    freedom = { index, timeline, actions };
    kernelCache.set('freedom', freedomHash, freedom);
  } else {
    cacheHits++;
  }

  // Unify wealth score with the freedom index
  if (wealth) {
    wealth.score = freedom.index.freedomIndex;
    wealth.scoreLabel = freedom.index.levelLabel;
  }

  // --- Engine 7: AI Insights ---
  const aiHash = `${freedomHash}`;
  let ai = kernelCache.get<any>('ai', aiHash);
  if (!ai) {
    ai = getFinancialAIInsights({
      transactions,
      liabilities,
      recurringExpenses,
      taxObligations,
      accounts,
      investments,
      kernelOutputs: {
        freedomIndex: freedom.index,
        freedomTimeline: freedom.timeline,
        wealthReport: wealth,
        forecastOutput: forecast,
        dreReport: dre,
        projections,
      } as any,
    });
    kernelCache.set('ai', aiHash, ai);
  } else {
    cacheHits++;
  }

  const end = performance.now();

  return {
    dre,
    financialCore,
    projections,
    forecast,
    wealth,
    freedom,
    ai,
    computedAt: new Date().toISOString(),
    kernelVersion: 1,
    cacheHits,
    executionTimeMs: Math.round(end - start),
  };
}
