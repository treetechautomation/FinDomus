"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getPersonalTransactions } from "@/services/firestore/transactions";
import { buildPFDRE } from "@/core/finance/dre-engine";
import { getCurrentMonthKey, getLastMonths, formatMonthLabel, isTransactionInMonth } from "@/core/finance/financial-period-engine";
import { PfDreCard } from "@/components/relatorios/pf-dre-card";
import { getWealthProfile, type WealthProfile, getRecurringExpenses } from "@/services/firestore/planning";
import { getAccountsWithBalance } from "@/services/firestore/accounts";
import { getInvestments } from "@/services/firestore/investments";
import { getLiabilities } from "@/services/firestore/liabilities";
import { buildPFWealthAnalysis } from "@/core/finance/wealth-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Loader2, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runFinancialKernel } from "@/core/finance/kernel";
import Link from "next/link";
import dynamic from 'next/dynamic';

const MonthlyFlow = dynamic(
  () => import('@/components/overview/monthly-flow').then(m => ({ default: m.MonthlyFlow })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

const ConsolidatedBalance = dynamic(
  () => import('@/components/overview/consolidated-balance').then(m => ({ default: m.ConsolidatedBalance })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

function getAccountTypeLabel(type: string) {
  switch (type) {
    case 'checking':
      return 'Conta Corrente';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Módulo de Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">Analise suas finanças com gráficos e relatórios detalhados.</p>
        </div>

        <Button
          id="tour-step-report-exportar"
          onClick={() => window.print()}
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 font-semibold"
        >
          <FileText className="w-4 h-4" />
          Imprimir / Exportar PDF
        </Button>
      </div>

      <Card id="tour-step-report-filtro">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecione os filtros para gerar os relatórios.</CardDescription>
          </div>
          {reportType === "pessoal-dre" && (
            <Link 
              href="/planejamento" 
              className="text-xs text-[#00beea] hover:underline flex items-center gap-1 font-semibold"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Ajustar metas no Planejamento
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tipo de Relatório</span>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="rounded-xl border-zinc-800 bg-zinc-950 text-white">
                  <SelectValue placeholder="Tipo de Relatório" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="pessoal-dre">DRE Pessoal PF</SelectItem>
                  <SelectItem value="geral">Consolidado Geral</SelectItem>
                  <SelectItem value="pessoal">Gráficos de Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Período</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="rounded-xl border-zinc-800 bg-zinc-950 text-white">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  {monthOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {formatMonthLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reportType === "pessoal-dre" ? (
        <div id="tour-step-report-dre" className="grid gap-6">
          <PfDreCard 
            dre={drePF} 
            report={wealthReport} 
            freedomScore={kernelResult?.freedom?.index?.freedomIndex}
            freedomScoreLabel={kernelResult?.freedom?.index?.levelLabel}
            aiInsights={kernelResult?.ai?.insights}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConsolidatedBalance data={allocationData} />
          <MonthlyFlow data={monthlyFlowData} />
        </div>
      )}
    </div>
  );
}