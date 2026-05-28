import { getFinancialAIInsights } from '@/core/finance/financial-ai-engine';

import { getTransactions } from '@/services/firestore/transactions';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getRecurringExpenses } from '@/services/firestore/planning';

export async function getFinancialAIData() {
  const [
    transactions,
    liabilities,
    recurringExpenses,
  ] = await Promise.all([
    getTransactions(),
    getLiabilities(),
    getRecurringExpenses(),
  ]);

  return getFinancialAIInsights({
    transactions,
    liabilities,
    recurringExpenses,
    taxObligations: [],
  });
}
