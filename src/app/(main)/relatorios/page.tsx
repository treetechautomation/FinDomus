"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getPersonalTransactions } from "@/services/firestore/transactions";
import { buildPFDRE } from "@/core/finance/dre-engine";
import { getCurrentMonthKey, getLastMonths, formatMonthLabel, isTransactionInMonth } from "@/core/finance/financial-period-engine";
import { getWealthProfile, type WealthProfile, getRecurringExpenses } from "@/services/firestore/planning";
import { getAccountsWithBalance } from "@/services/firestore/accounts";
import { getInvestments } from "@/services/firestore/investments";
import { getLiabilities } from "@/services/firestore/liabilities";
import { buildPFWealthAnalysis } from "@/core/finance/wealth-engine";
import { runFinancialKernel } from "@/core/finance/kernel";
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileRelatoriosView } from '@/app/(main)/relatorios/mobile-relatorios-view';

function getAccountTypeLabel(type: string) {
  switch (type) {
    case 'checking':
      return 'Conta Corrente';
    case 'salary':
      return 'Conta Salário';
    case 'investment':
      return 'Investimentos';
    case 'wallet':
      return 'Carteira';
    case 'credit_card':
      return 'Cartões';
    case 'savings':
      return 'Poupança';
    default:
      return type || 'Outros';
  }
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("pessoal-dre");
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthKey());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wealthProfile, setWealthProfile] = useState<WealthProfile | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const monthOptions = useMemo(() => getLastMonths(12, getCurrentMonthKey()), []);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    Promise.all([
      getPersonalTransactions(user.uid),
      getWealthProfile(user.uid),
      getAccountsWithBalance(user.uid),
      getInvestments(user.uid),
      getLiabilities(user.uid),
      getRecurringExpenses(user.uid),
    ])
      .then(([txs, profile, accs, invs, liabs, recs]) => {
        setTransactions(txs || []);
        setWealthProfile(profile);
        setAccounts(accs || []);
        setInvestments(invs || []);
        setLiabilities(liabs || []);
        setRecurringExpenses(recs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => isTransactionInMonth(t, selectedMonth));
  }, [transactions, selectedMonth]);

  const drePF = useMemo(() => {
    return buildPFDRE(filteredTransactions);
  }, [filteredTransactions]);

  const wealthReport = useMemo(() => {
    return buildPFWealthAnalysis(drePF, wealthProfile);
  }, [drePF, wealthProfile]);

  // Executa o Kernel Financeiro centralizado para alinhar os dados e score
  const kernelResult = useMemo(() => {
    if (!user?.uid) return null;
    return runFinancialKernel({
      accounts,
      investments,
      liabilities,
      transactions,
      recurringExpenses,
      taxObligations: [],
      wealthProfile: { categories: wealthProfile?.categories || [] },
      monthlyClosures: [],
      investmentAnalytics: null,
      baseMonth: selectedMonth,
    });
  }, [user?.uid, accounts, investments, liabilities, transactions, recurringExpenses, wealthProfile, selectedMonth]);

  // Calcula o Fluxo Mensal real dos últimos 6 meses a partir das transações
  const monthlyFlowData = useMemo(() => {
    const last6Months = getLastMonths(6, getCurrentMonthKey()).reverse();
    return last6Months.map((m) => {
      const label = formatMonthLabel(m).split('/')[0];
      const monthTxs = transactions.filter((t) => isTransactionInMonth(t, m));
      
      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        
      const expenses = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        
      return {
        month: label.substring(0, 3).toUpperCase(),
        income,
        expenses,
      };
    });
  }, [transactions]);

  // Calcula a alocação de contas consolidada
  const allocationData = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const account of accounts) {
      const label = getAccountTypeLabel(account.type);
      const current = grouped.get(label) ?? 0;
      grouped.set(label, current + Number(account.balance || 0));
    }

    const fallbackColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];

    return Array.from(grouped.entries())
      .filter(([, value]) => value !== 0)
      .map(([name, value], index) => ({
        name,
        value,
        fill: fallbackColors[index % fallbackColors.length],
      }));
  }, [accounts]);

  const viewProps = {
    reportType,
    setReportType,
    selectedMonth,
    setSelectedMonth,
    monthOptions,
    formatMonthLabel,
    loading,
    drePF,
    wealthReport,
    kernelResult,
    monthlyFlowData,
    allocationData,
  };

  if (isMobile) {
    return <MobileRelatoriosView {...viewProps} />;
  }

  return <MobileRelatoriosView {...viewProps} />;
}