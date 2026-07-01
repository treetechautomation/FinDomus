import { getFinancialAIInsights } from '@/core/finance/financial-ai-engine';
import { getHistoricalTransactions } from '@/services/firestore/transactions';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getRecurringExpenses, getWealthProfile } from '@/services/firestore/planning';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { consolidatePortfolio } from '@/services/investments/consolidation-engine';
import { generateInvestmentAnalytics } from '@/core/investments/analytics/analytics-engine';
import { runFinancialKernel } from '@/core/finance/kernel';

export async function getFinancialAIData(userId: string) {
  if (!userId) throw new Error("userId required");
  const [
    transactions,
    liabilities,
    recurringExpenses,
    accounts,
    investments,
    wealthProfile,
    portfolio,
  ] = await Promise.all([
    getHistoricalTransactions(userId),
    getLiabilities(userId),
    getRecurringExpenses(userId),
    getAccountsWithBalance(userId),
    getInvestments(userId),
    getWealthProfile(userId),
    consolidatePortfolio(userId),
  ]);

  const investmentAnalytics = generateInvestmentAnalytics(portfolio);

  const kernelResult = runFinancialKernel({
    accounts,
    investments,
    liabilities,
    transactions,
    recurringExpenses,
    taxObligations: [],
    wealthProfile,
    monthlyClosures: [],
    investmentAnalytics,
  });

  return kernelResult.ai;
}
