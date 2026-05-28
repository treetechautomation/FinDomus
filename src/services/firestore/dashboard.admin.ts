import { adminDb } from '../../lib/firebase-admin';

export async function getDashboardAdmin(userId: string) {
  if (!userId) throw new Error('userId é obrigatório');

  const [accountsSnap, transactionsSnap] = await Promise.all([
    adminDb.collection('accounts').where('userId', '==', userId).get(),
    adminDb.collection('transactions').where('userId', '==', userId).get()
  ]);

  const accounts = accountsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  const transactions = transactionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  // Saldos
  const totalPF = accounts
    .filter(a => a.owner === 'PF')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalPJ = accounts
    .filter(a => a.owner === 'PJ')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Mensal (Mês Atual)
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  const monthTransactions = transactions.filter(t => 
    t.date?.startsWith(currentMonth) || t.monthKey === currentMonth
  );

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const allocation = accounts.reduce((acc: any[], account) => {
    const type = account.type || 'Outros';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += (Number(account.balance) || 0);
    } else {
      acc.push({ name: type, value: (Number(account.balance) || 0) });
    }
    return acc;
  }, []);

  return {
    total: totalPF + totalPJ,
    totalPF,
    totalPJ,
    monthly: {
      income,
      expenses,
      balance: income - expenses
    },
    allocation
  };
}
