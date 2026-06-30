import { adminDb } from '@/lib/firebase-admin';
import { runFinancialKernel } from '@/core/finance/kernel';

export async function getFinancialAIDataAdmin(userId: string) {
  if (!userId) throw new Error("userId required");

  const [
    transactionsSnap,
    liabilitiesSnap,
    recurringSnap,
    accountsSnap,
    investmentsSnap,
    wealthProfileSnap,
  ] = await Promise.all([
    adminDb.collection('transactions').where('userId', '==', userId).get(),
    adminDb.collection('liabilities').where('userId', '==', userId).get(),
    adminDb.collection('recurring_expenses').where('userId', '==', userId).get(),
    adminDb.collection('accounts').where('userId', '==', userId).get(),
    adminDb.collection('investments').where('userId', '==', userId).get(),
    adminDb.collection('wealth_profiles').where('userId', '==', userId).limit(1).get(),
  ]);

  const transactions = transactionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const liabilities = liabilitiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const recurringExpenses = recurringSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const accounts = accountsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const investments = investmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const wealthProfile = wealthProfileSnap.empty
    ? null
    : { id: wealthProfileSnap.docs[0].id, ...wealthProfileSnap.docs[0].data() };

  const kernelResult = runFinancialKernel({
    accounts,
    investments,
    liabilities,
    transactions,
    recurringExpenses,
    taxObligations: [],
    wealthProfile,
    monthlyClosures: [],
    investmentAnalytics: null,
  });

  return kernelResult.ai;
}
