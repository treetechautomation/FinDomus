"use client";

import { useEffect, useState } from "react";
import { getInvestments, type Investment } from "@/services/firestore/investments";
import { InvestmentWallet } from "@/components/investimentos/investment-wallet";

export default function InvestimentosPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getInvestments();
      setInvestments(data || []);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <InvestmentWallet investments={investments} />
    </div>
  );
}
