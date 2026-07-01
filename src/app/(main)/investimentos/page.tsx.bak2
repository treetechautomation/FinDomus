"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestments, type Investment } from "@/services/firestore/investments";
import { getAccountsWithBalance } from "@/services/firestore/accounts";
import { getLiabilities } from "@/services/firestore/liabilities";
import { getHistoricalTransactions } from "@/services/firestore/transactions";
import { getRecurringExpenses, getWealthProfile } from "@/services/firestore/planning";
import { getMonthlyClosures } from "@/services/firestore/monthly-closures";
import { getInvestmentYields, type InvestmentYield } from "@/services/firestore/yields";
import { InvestmentWallet } from "@/components/investimentos/investment-wallet";
import { useAuth } from "@/providers/auth-provider";
import { useFinancialKernel } from "@/hooks/use-financial-kernel";
import type { KernelContext } from "@/core/finance/kernel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function InvestmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl bg-zinc-900" />
          <Skeleton className="h-4 w-72 rounded-xl bg-zinc-900" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-3xl border border-zinc-900 bg-zinc-950/70 p-6 space-y-3">
            <Skeleton className="h-4 w-24 bg-zinc-900 rounded-lg" />
            <Skeleton className="h-8 w-32 bg-zinc-900 rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function InvestimentosPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [yields, setYields] = useState<InvestmentYield[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kernelContext, setKernelContext] = useState<KernelContext | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    Promise.all([
      getInvestments(user.uid),
      getAccountsWithBalance(user.uid),
      getLiabilities(user.uid),
      getHistoricalTransactions(user.uid, { owner: 'PF' }),
      getRecurringExpenses(user.uid),
      getWealthProfile(user.uid),
      getMonthlyClosures(user.uid, 'PF'),
      getInvestmentYields(user.uid),
    ]).then(([inv, acc, lia, txs, rec, wProf, closures, ylds]) => {
      setInvestments(inv || []);
      setYields(ylds || []);
      setKernelContext({
        accounts: acc || [],
        investments: inv || [],
        liabilities: lia || [],
        transactions: txs || [],
        recurringExpenses: rec || [],
        taxObligations: [],
        wealthProfile: wProf,
        monthlyClosures: closures || [],
        investmentAnalytics: null,
      });
    }).catch(console.error);
  }, [user?.uid, refreshKey]);

  const { result: kernel } = useFinancialKernel(kernelContext);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (!kernel) return <InvestmentSkeleton />;

  return (
    <div className="space-y-6">
      <InvestmentWallet 
        investments={investments} 
        yields={yields}
        kernel={kernel}
        onRefresh={handleRefresh} 
      />
    </div>
  );
}
