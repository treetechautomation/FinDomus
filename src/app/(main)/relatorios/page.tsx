"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getPersonalTransactions } from "@/services/firestore/transactions";
import { buildPFDRE } from "@/core/finance/dre-engine";
import { getCurrentMonthKey, getLastMonths, formatMonthLabel, isTransactionInMonth } from "@/core/finance/financial-period-engine";
import { PfDreCard } from "@/components/relatorios/pf-dre-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

const MonthlyFlow = dynamic(
  () => import('@/components/overview/monthly-flow').then(m => ({ default: m.MonthlyFlow })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

const ConsolidatedBalance = dynamic(
  () => import('@/components/overview/consolidated-balance').then(m => ({ default: m.ConsolidatedBalance })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("pessoal-dre");
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthKey());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = useMemo(() => getLastMonths(12, getCurrentMonthKey()), []);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getPersonalTransactions(user.uid)
      .then((txs) => {
        setTransactions(txs || []);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Módulo de Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">Analise suas finanças com gráficos e relatórios detalhados.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione os filtros para gerar os relatórios.</CardDescription>
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
        <div className="grid gap-6">
          <PfDreCard dre={drePF} />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ConsolidatedBalance />
          <MonthlyFlow data={[]} />
        </div>
      )}
    </div>
  );
}