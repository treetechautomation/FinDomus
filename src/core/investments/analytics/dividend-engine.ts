import type { ConsolidatedAsset } from '@/services/investments/consolidation-engine';
import type { DividendAnalytics, YearlyDividend, ClassDividend, AssetDividend } from './types';

export interface RawIncomeInput {
  ticker: string;
  amount: number;
  year: number;
}

export function calculateDividends(
  assets: ConsolidatedAsset[],
  totalMarketValue: number,
  totalInvested: number,
  rawIncomes?: RawIncomeInput[]
): DividendAnalytics {
  let totalReceived = 0;
  const byAssetMap: Record<string, number> = {};
  const byClassMap: Record<string, number> = {};
  const byYearMap: Record<number, number> = {};

  // 1. Calculate per asset and per class total income
  for (const asset of assets) {
    // Reconstruct total income from yield and market value (or yield on cost and invested)
    const invested = asset.origins.reduce((acc, orig) => acc + orig.quantity * orig.averagePrice, 0);
    const income = asset.marketValue > 0 
      ? (asset.dividendYield / 100) * asset.marketValue 
      : (asset.yieldOnCost / 100) * invested;

    const cleanIncome = Math.max(0, Number(income.toFixed(2)));
    totalReceived += cleanIncome;

    byAssetMap[asset.ticker] = cleanIncome;
    byClassMap[asset.assetClass] = (byClassMap[asset.assetClass] || 0) + cleanIncome;
  }

  // 2. Year distribution (using rawIncomes if provided, otherwise distributing to the latest year in origins or current year)
  if (rawIncomes && rawIncomes.length > 0) {
    for (const income of rawIncomes) {
      const amount = Number(income.amount || 0);
      const year = Number(income.year || new Date().getFullYear());
      byYearMap[year] = (byYearMap[year] || 0) + amount;
    }
  } else {
    // Fallback: estimate/distribute based on assets origins reference years
    for (const asset of assets) {
      const invested = asset.origins.reduce((acc, orig) => acc + orig.quantity * orig.averagePrice, 0);
      const income = asset.marketValue > 0 
        ? (asset.dividendYield / 100) * asset.marketValue 
        : (asset.yieldOnCost / 100) * invested;
      
      const cleanIncome = Math.max(0, Number(income.toFixed(2)));
      if (cleanIncome <= 0) continue;

      // Find years from origins
      const years = asset.origins
        .map(o => o.year)
        .filter((y): y is number => typeof y === 'number' && y > 0);
      
      if (years.length > 0) {
        // Distribute equally among reference years
        const portion = cleanIncome / years.length;
        for (const y of years) {
          byYearMap[y] = (byYearMap[y] || 0) + portion;
        }
      } else {
        // Default to current year
        const curYear = new Date().getFullYear();
        byYearMap[curYear] = (byYearMap[curYear] || 0) + cleanIncome;
      }
    }
  }

  // Format outputs
  const byAsset: AssetDividend[] = Object.entries(byAssetMap)
    .map(([ticker, amount]) => ({ ticker, amount }))
    .sort((a, b) => b.amount - a.amount);

  const byClass: ClassDividend[] = Object.entries(byClassMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const byYear: YearlyDividend[] = Object.entries(byYearMap)
    .map(([yearStr, amount]) => ({ year: Number(yearStr), amount }))
    .sort((a, b) => a.year - b.year);

  // Portfolio level yields
  const dividendYield = totalMarketValue > 0 ? (totalReceived / totalMarketValue) * 100 : 0;
  const yieldOnCost = totalInvested > 0 ? (totalReceived / totalInvested) * 100 : 0;

  return {
    totalReceived,
    dividendYield,
    yieldOnCost,
    byYear,
    byClass,
    byAsset,
  };
}
