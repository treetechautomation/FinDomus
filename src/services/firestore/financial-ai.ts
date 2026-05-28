import { getFinancialAIInsights } from '@/core/finance/financial-ai-engine';

import { getTransactions } from '@/services/firestore/transactions';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getRecurringExpenses } from '@/services/firestore/planning';

export async function getFinancialAIData(userId: string) {
  if (!userId) throw new Error("userId required");
  const [
    transactions,
    liabilities,
    recurringExpenses,
  ] = await Promise.all([
    getTransactions(userId),
    getLiabilities(userId),
    getRecurringExpenses(userId),
  ]);

  return getFinancialAIInsights({
    transactions,
    liabilities,
    recurringExpenses,
    taxObligations: [],
  });
}
