'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useFinancialKernel } from '@/hooks/use-financial-kernel';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getPersonalTransactions } from '@/services/firestore/transactions';
import { getWealthProfile, getRecurringExpenses } from '@/services/firestore/planning';
import { getMonthlyClosures } from '@/services/firestore/monthly-closures';
import { consolidatePortfolio } from '@/services/investments/consolidation-engine';
import { generateInvestmentAnalytics } from '@/core/investments/analytics/analytics-engine';
import { usePageHeader } from '@/components/mobile';
import type { KernelContext } from '@/core/finance/kernel';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDomusView } from '@/app/(main)/domus/mobile-domus-view';

export default function DomusPage() {
  const { user } = useAuth();
  const [kernelContext, setKernelContext] = useState<KernelContext | null>(null);
  const [loading, setLoading] = useState(true);
  const { result: kernel, loading: kernelLoading } = useFinancialKernel(kernelContext);
  const isMobile = useIsMobile();

  usePageHeader({ title: 'Domus IA' });

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    Promise.all([
      getAccountsWithBalance(user.uid),
      getInvestments(user.uid),
      getLiabilities(user.uid),
      getPersonalTransactions(user.uid),
      getWealthProfile(user.uid),
      getRecurringExpenses(user.uid),
      getMonthlyClosures(user.uid, 'PF'),
      consolidatePortfolio(user.uid),
    ])
      .then(
        ([
          accounts,
          investments,
          liabilities,
          transactions,
          profile,
          recurringExpenses,
          closures,
          portfolio,
        ]) => {
          const analytics = generateInvestmentAnalytics(portfolio);
          setKernelContext({
            accounts,
            investments,
            liabilities,
            transactions,
            recurringExpenses,
            taxObligations: [],
            wealthProfile: profile,
            monthlyClosures: closures,
            investmentAnalytics: analytics,
          });
          setLoading(false);
        }
      )
      .catch((err) => {
        console.error('[Domus] Error loading data', err);
        setLoading(false);
      });
  }, [user?.uid]);

  const isLoading = loading || kernelLoading;

  if (isMobile) {
    return <MobileDomusView kernel={kernel} loading={isLoading} />;
  }

  return <MobileDomusView kernel={kernel} loading={isLoading} />;
}
