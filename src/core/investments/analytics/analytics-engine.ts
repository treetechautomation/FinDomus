import type { ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import type { InvestmentAnalytics } from './types';
import { calculateAllocation } from './allocation-engine';
import { calculatePerformance } from './performance-engine';
import { calculateDividends, type RawIncomeInput } from './dividend-engine';
import { calculateRisk } from './risk-engine';
import { calculateHealthScore } from './health-score';
import { generateInsights } from './insights-engine';

export function generateInvestmentAnalytics(
  portfolio: ConsolidatedPortfolio,
  rawIncomes?: RawIncomeInput[]
): InvestmentAnalytics {
  const lastGenerated = new Date().toLocaleString('pt-BR');

  // If portfolio is empty, return empty template structure
  if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
    return {
      allocation: { byClass: [], byInstitution: [], byOrigin: [], byCurrency: [], bySector: [] },
      performance: { totalInvested: 0, totalMarketValue: 0, totalProfit: 0, totalProfitPercent: 0, byAsset: [], byInstitution: [], byOrigin: [] },
      dividends: { totalReceived: 0, dividendYield: 0, yieldOnCost: 0, byYear: [], byClass: [], byAsset: [] },
      risk: { concentrationAlerts: [], diversificationScore: 0, liquidityPercent: 0, assetConcentration: [], institutionConcentration: [], sectorConcentration: [], countryConcentration: [] },
      health: {
        score: 0,
        grade: 'F',
        pilars: {
          diversification: { name: 'Diversificação', score: 0, maxScore: 20, feedback: 'Nenhum ativo na carteira.' },
          concentration: { name: 'Concentração', score: 0, maxScore: 20, feedback: 'Nenhum ativo na carteira.' },
          liquidity: { name: 'Liquidez', score: 0, maxScore: 20, feedback: 'Nenhum ativo na carteira.' },
          dividends: { name: 'Dividendos', score: 0, maxScore: 20, feedback: 'Nenhum ativo na carteira.' },
          risk: { name: 'Risco', score: 0, maxScore: 20, feedback: 'Nenhum ativo na carteira.' },
        }
      },
      insights: [],
      lastGenerated
    };
  }

  // 1. Calculate Allocations
  const allocation = calculateAllocation(portfolio);

  // 2. Calculate Performances
  const performance = calculatePerformance(portfolio);

  // 3. Calculate Dividends
  const dividends = calculateDividends(
    portfolio.assets,
    portfolio.totalMarketValue,
    portfolio.totalInvested,
    rawIncomes
  );

  // 4. Calculate Risks
  const risk = calculateRisk(portfolio, allocation);

  // 5. Compute Health Score
  const health = calculateHealthScore(portfolio, allocation, performance, dividends, risk);

  // 6. Generate Insights
  const insights = generateInsights(portfolio, allocation, performance, dividends, risk, health);

  return {
    allocation,
    performance,
    dividends,
    risk,
    health,
    insights,
    lastGenerated
  };
}

export * from './types';
export * from './allocation-engine';
export * from './performance-engine';
export * from './dividend-engine';
export * from './risk-engine';
export * from './health-score';
export * from './insights-engine';
export type { RawIncomeInput };
