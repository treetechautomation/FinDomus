import type { ConsolidatedPortfolio, ConsolidatedAsset } from '@/services/investments/consolidation-engine';
import type { PerformanceAnalytics, AssetPerformance, GroupPerformance } from './types';

export function calculatePerformance(portfolio: ConsolidatedPortfolio): PerformanceAnalytics {
  const byAsset: AssetPerformance[] = portfolio.assets.map((asset) => {
    // Total invested in this asset is the sum of cost over all origins
    const invested = asset.origins.reduce((acc, orig) => acc + orig.quantity * orig.averagePrice, 0);
    const marketValue = asset.marketValue;
    const profit = marketValue - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

    return {
      ticker: asset.ticker,
      name: asset.name,
      invested,
      marketValue,
      profit,
      profitPercent,
    };
  });

  // Calculate by Institution and Origin from origins
  const instGroups: Record<string, { invested: number; marketValue: number }> = {};
  const origGroups: Record<string, { invested: number; marketValue: number }> = {};

  for (const asset of portfolio.assets) {
    for (const orig of asset.origins) {
      const investedAmount = orig.quantity * orig.averagePrice;
      
      // Institution
      const instName = orig.institution || 'Não Classificado';
      if (!instGroups[instName]) {
        instGroups[instName] = { invested: 0, marketValue: 0 };
      }
      instGroups[instName].invested += investedAmount;
      instGroups[instName].marketValue += orig.marketValue;

      // Origin
      const origName = orig.source || 'Não Classificado';
      if (!origGroups[origName]) {
        origGroups[origName] = { invested: 0, marketValue: 0 };
      }
      origGroups[origName].invested += investedAmount;
      origGroups[origName].marketValue += orig.marketValue;
    }
  }

  const makeGroupPerformance = (groups: Record<string, { invested: number; marketValue: number }>): GroupPerformance[] => {
    return Object.entries(groups)
      .map(([name, data]) => {
        const profit = data.marketValue - data.invested;
        const profitPercent = data.invested > 0 ? (profit / data.invested) * 100 : 0;
        return {
          name,
          invested: data.invested,
          marketValue: data.marketValue,
          profit,
          profitPercent,
        };
      })
      .sort((a, b) => b.marketValue - a.marketValue);
  };

  const byInstitution = makeGroupPerformance(instGroups);
  const byOrigin = makeGroupPerformance(origGroups);

  return {
    totalInvested: portfolio.totalInvested,
    totalMarketValue: portfolio.totalMarketValue,
    totalProfit: portfolio.totalProfit,
    totalProfitPercent: portfolio.totalProfitPercent,
    byAsset,
    byInstitution,
    byOrigin,
  };
}
