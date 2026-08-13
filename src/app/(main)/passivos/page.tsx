"use client";

import {
  getCurrentMonthKey,
  parseMonthKey,
  addMonths,
  formatMonthLabel,
} from '@/core/finance/financial-period-engine';

import { useEffect, useState } from "react";
import { getLiabilities, type Liability } from "@/services/firestore/liabilities";
import { useAuth } from "@/providers/auth-provider";
import {
  buildMonthlyProjection,
  buildProjectionTimeline,
} from '@/core/finance/liability-engine';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePassivosView } from '@/app/(main)/passivos/mobile-passivos-view';

export default function PassivosPage() {
  const { user } = useAuth();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const baseMonthKey = getCurrentMonthKey();
  const isMobile = useIsMobile();

    useEffect(() => {
      async function load() {
        if (!user?.uid) return;
        const data = await getLiabilities(user.uid);
        setLiabilities(data || []);
      }

      load();
    }, [user?.uid]);

  const activeLiabilities = liabilities.filter((item) => {
    const total = Number(item.totalInstallments || 0);
    const current = Number(item.currentInstallment || 0);
    const balance = Number(item.remainingBalance || 0);
    return total > 0 && current < total && balance > 0;
  });

  
  const totalLiabilities = activeLiabilities.reduce((sum, item) => sum + Number(item.remainingBalance || 0), 0);


  const monthlyProjection = buildMonthlyProjection(activeLiabilities, baseMonthKey);
  const projectionTimeline = buildProjectionTimeline(activeLiabilities, baseMonthKey);
  const nextProjectionMonthKey = addMonths(baseMonthKey, 1);

  const totalMonthlyCommitment = Number(
    (monthlyProjection[nextProjectionMonthKey] || 0).toFixed(2)
  );

  if (isMobile) {
    return (
      <MobilePassivosView
        activeLiabilities={activeLiabilities}
        totalLiabilities={totalLiabilities}
        monthlyProjection={monthlyProjection}
        projectionTimeline={projectionTimeline}
        totalMonthlyCommitment={totalMonthlyCommitment}
      />
    );
  }

  return (
    <MobilePassivosView
      activeLiabilities={activeLiabilities}
      totalLiabilities={totalLiabilities}
      monthlyProjection={monthlyProjection}
      projectionTimeline={projectionTimeline}
      totalMonthlyCommitment={totalMonthlyCommitment}
    />
  );
}
