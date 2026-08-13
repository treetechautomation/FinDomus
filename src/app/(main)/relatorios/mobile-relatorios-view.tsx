"use client";

import type { PFDRE } from "@/core/finance/dre-engine";
import type { PFWealthReport } from "@/core/finance/wealth-engine";
import type { KernelResult } from "@/core/finance/kernel";
import { PfDreCard } from "@/components/relatorios/pf-dre-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Loader2, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export interface MobileRelatoriosViewProps {
  reportType: string;
  setReportType: (value: string) => void;
  selectedMonth: string;
  setSelectedMonth: (value: string) => void;
  monthOptions: string[];
  formatMonthLabel: (month: string) => string;
  loading: boolean;
  drePF: PFDRE;
  wealthReport: PFWealthReport;
  kernelResult: KernelResult | null;
  monthlyFlowData: { month: string; income: number; expenses: number }[];
  allocationData: { name: string; value: number; fill: string }[];
}

export function MobileRelatoriosView({
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
}: MobileRelatoriosViewProps) {
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
