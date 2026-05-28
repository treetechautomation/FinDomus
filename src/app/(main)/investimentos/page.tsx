"use client";

import { useCallback, useEffect, useState } from "react";
import { getInvestments, type Investment } from "@/services/firestore/investments";
import { InvestmentWallet } from "@/components/investimentos/investment-wallet";
import { useAuth } from "@/providers/auth-provider";

export default function InvestimentosPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;
      const data = await getInvestments(user.uid);
      setInvestments(data || []);
    }

    load();
  }, [user?.uid, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-6">
      <InvestmentWallet investments={investments} onRefresh={handleRefresh} />
    </div>
  );
}
