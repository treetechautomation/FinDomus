'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getDashboardReal } from '@/core/finance/dashboard-real';
import { getPersonalTransactions } from '@/services/firestore/transactions';
import type { TransactionDTO } from '@/services/firestore/transactions';
import { usePageHeader } from '@/components/mobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileFinancasView } from '@/app/(main)/financas/mobile-financas-view';

export default function FinancasPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  usePageHeader({ title: 'Fluxo de Caixa' });

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    Promise.all([
      getDashboardReal(user.uid),
      getPersonalTransactions(user.uid),
    ])
      .then(([dash, txs]) => {
        setDashboard(dash);
        setTransactions(txs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (isMobile) {
    return (
      <MobileFinancasView
        dashboard={dashboard}
        transactions={transactions}
        loading={loading}
      />
    );
  }

  return (
    <MobileFinancasView
      dashboard={dashboard}
      transactions={transactions}
      loading={loading}
      showQuickAdd={false}
    />
  );
}
