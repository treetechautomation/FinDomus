"use client";
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Banknote, Building2, Landmark, TrendingUp, Users, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/overview/stat-card';
import { AiInsightsCard } from '@/components/dashboard/ai-insights-card';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useVisibility } from '@/providers/visibility-provider';
import { FinancialSection } from '@/components/onboarding/FinancialSection';
import { useTour } from '@/core/onboarding/tour-engine';
import { MAIN_TOUR_ID } from '@/core/onboarding/tour-registry';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConsolidatedBalance = dynamic(
  () => import('@/components/overview/consolidated-balance').then(m => ({ default: m.ConsolidatedBalance })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

const MonthlyFlow = dynamic(
  () => import('@/components/overview/monthly-flow').then(m => ({ default: m.MonthlyFlow })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

const CashflowChart = dynamic(
  () => import('@/components/overview/cashflow-chart').then(m => ({ default: m.CashflowChart })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

const NetworthEvolutionChart = dynamic(
  () => import('@/components/overview/networth-evolution-chart').then(m => ({ default: m.NetworthEvolutionChart })),
  { ssr: false, loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" /> }
);

import { CashflowScenarioSwitcher } from '@/components/overview/cashflow-scenario-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/core/finance/formatters';
import { getDashboardReal } from '@/core/finance/dashboard-real';
import { getMonthlyClosures } from '@/services/firestore/monthly-closures';
import { getPersonalTransactions } from '@/services/firestore/transactions';
import { getWealthProfile, getRecurringExpenses } from '@/services/firestore/planning';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { getLiabilities } from '@/services/firestore/liabilities';
import { buildPFDRE } from '@/core/finance/dre-engine';
import { buildPFWealthAnalysis } from '@/core/finance/wealth-engine';
import { getCurrentMonthKey, isTransactionInMonth } from '@/core/finance/financial-period-engine';
import { useAuth } from '@/providers/auth-provider';

// Copiloto da Liberdade Financeira
import { FreedomIndexCard } from '@/components/dashboard/freedom-index-card';
import { FreedomTimeline } from '@/components/dashboard/freedom-timeline';
import { NextBestAction } from '@/components/dashboard/next-best-action';
import { NextActionsList } from '@/components/dashboard/next-actions-list';
import { InsightCarousel } from '@/components/dashboard/insight-carousel';
import { getFinancialAIInsights } from '@/core/finance/financial-ai-engine';
import {
  calculateFreedomIndex,
  calculateFreedomTimeline,
  generateActionPlan,
} from '@/core/finance/freedom-engine';

function DreRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  const { showFinancialValues } = useVisibility();
  return (
    <div className={strong ? "flex justify-between border-t border-zinc-900 pt-2 font-bold" : "flex justify-between"}>
      <span>{label}</span>
      <span>{showFinancialValues ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '••••••••••'}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl bg-zinc-900" />
          <Skeleton className="h-4 w-72 rounded-xl bg-zinc-900" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-zinc-900 bg-zinc-950/70 p-6 space-y-6">
          <Skeleton className="h-4 w-40 bg-zinc-900 rounded-lg" />
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-zinc-900 flex-shrink-0" />
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-6 w-32 bg-zinc-900 rounded-lg" />
              <Skeleton className="h-4 w-full bg-zinc-900 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 bg-zinc-900 rounded-xl" />
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl border border-zinc-900 bg-zinc-950/70 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40 bg-zinc-900 rounded-lg" />
            <div className="space-y-2.5">
              <Skeleton className="h-6 w-3/4 bg-zinc-900 rounded-lg" />
              <Skeleton className="h-4 w-full bg-zinc-900 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-10 w-full bg-zinc-900 rounded-xl" />
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [netWorthHistory, setNetWorthHistory] = useState<any[]>([]);
  const [wealthReport, setWealthReport] = useState<any>(null);
  const [freedomData, setFreedomData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [hasNoData, setHasNoData] = useState<boolean>(false);
  const { showFinancialValues } = useVisibility();
  const { startTour, completedTours, dismissedTours } = useTour();

  useEffect(() => {
    if (!user?.uid) return;
    getDashboardReal(user.uid).then(setDashboard).catch(console.error);

    getMonthlyClosures(user.uid)
      .then((closures) => {
        const monthlyDataMap = new Map<string, { netWorth: number; assets: number; liabilities: number }>();

        closures.forEach((c) => {
          const monthKey = c.month;
          const existing = monthlyDataMap.get(monthKey) || { netWorth: 0, assets: 0, liabilities: 0 };
          
          const closureNetWorth = c.snapshot?.netWorth?.value ?? (c.cashflow?.closingBalance ?? c.balance ?? 0);
          const closureAssets = c.snapshot?.netWorth?.totalAssets ?? (c.cashflow?.closingBalance ?? c.balance ?? 0);
          const closureLiabilities = c.snapshot?.netWorth?.totalLiabilities ?? Number(c.snapshot?.commitments?.liabilities ?? 0);

          monthlyDataMap.set(monthKey, {
            netWorth: existing.netWorth + closureNetWorth,
            assets: existing.assets + closureAssets,
            liabilities: existing.liabilities + closureLiabilities,
          });
        });

        const sortedData = Array.from(monthlyDataMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([monthKey, values]) => {
            const [year, monthNum] = monthKey.split('-');
            const date = new Date(Number(year), Number(monthNum) - 1, 1);
            const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
            return {
              monthKey,
              label,
              netWorth: Number(values.netWorth.toFixed(2)),
              assets: Number(values.assets.toFixed(2)),
              liabilities: Number(values.liabilities.toFixed(2)),
            };
          });

        setNetWorthHistory(sortedData);
      })
      .catch(console.error);

    Promise.all([
      getPersonalTransactions(user.uid),
      getWealthProfile(user.uid),
      getAccountsWithBalance(user.uid),
      getInvestments(user.uid),
      getLiabilities(user.uid),
      getRecurringExpenses(user.uid),
    ])
      .then(([txs, profile, accounts, investments, liabilities, recurringExpenses]) => {
        const isUserEmpty = (txs || []).length === 0 && (accounts || []).length === 0 && (investments || []).length === 0;
        setHasNoData(isUserEmpty);

        const currentMonthKey = getCurrentMonthKey();
        const filteredTransactions = (txs || []).filter((t: any) => isTransactionInMonth(t, currentMonthKey));
        const drePF = buildPFDRE(filteredTransactions);
        const report = buildPFWealthAnalysis(drePF, profile);
        setWealthReport(report);

        // Copiloto Insights IA
        const aiData = getFinancialAIInsights({
          transactions: txs,
          liabilities,
          recurringExpenses,
        });
        setAiInsights(aiData.insights);

        // Cálculo de Net Worth manual consistente com dashboard-real
        const totalAccounts = accounts
          .filter((a: any) => a.owner === 'PF')
          .reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
        const totalInvestments = investments.reduce((sum: number, item: any) => {
          let value = 0;
          if (item.currentValue !== undefined && item.currentValue !== null) {
            value = Number(item.currentValue);
          } else if (item.quantity && item.currentPrice) {
            value = Number(item.quantity) * Number(item.currentPrice);
          }
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        const totalLiabilities = liabilities.reduce((sum: number, item: any) => sum + Number(item.remainingBalance || 0), 0);
        const netWorthValue = totalAccounts + totalInvestments - totalLiabilities;

        const fIndex = calculateFreedomIndex({
          accounts,
          investments,
          liabilities,
          dre: drePF,
          netWorth: netWorthValue,
          monthlyIncome: drePF.receitaTotal,
        });

        const fTimeline = calculateFreedomTimeline({
          accounts,
          investments,
          liabilities,
          dre: drePF,
          monthlyIncome: drePF.receitaTotal,
          netWorth: netWorthValue,
        });

        const fActionList = generateActionPlan(fIndex, liabilities, accounts, drePF);

        setFreedomData({
          index: fIndex,
          timeline: fTimeline,
          actions: fActionList,
        });
      })
      .catch(console.error);
  }, [user?.uid]);

  // Autostart do tour na primeira visita ao dashboard
  useEffect(() => {
    if (dashboard) {
      const isMainTourSeen = completedTours.includes(MAIN_TOUR_ID) || dismissedTours.includes(MAIN_TOUR_ID);
      if (!isMainTourSeen) {
        const timer = setTimeout(() => {
          startTour(MAIN_TOUR_ID);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [dashboard, completedTours, dismissedTours, startTour]);

  if (!dashboard) {
    return <DashboardSkeleton />;
  }

  if (hasNoData) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4 pt-16 animate-in fade-in duration-500">
        <div className="p-5 rounded-full bg-zinc-900/60 border border-zinc-800 inline-block text-cyan-400">
          <Users className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-black text-white">Comece sua Jornada de Liberdade</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O Copiloto do FinDomus precisa de dados reais para estimar seu progresso. Importe seu primeiro extrato (OFX, PDF ou CSV) para ver suas notas, ações recomendadas e cronograma.
        </p>
        <div className="pt-2">
          <Link href="/importacoes">
            <button className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/25">
              Importar Extrato
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const monthly = dashboard.monthly;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard da Liberdade</h1>
          <p className="text-muted-foreground">Seu progresso real em direção à independência financeira.</p>
        </div>
      </div>

      {/* Grid Principal do Copiloto (Âncora Superior Sempre Visível) */}
      {freedomData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FreedomIndexCard result={freedomData.index} />
          <NextBestAction item={freedomData.actions[0]} />
        </div>
      )}

      {/* Abas dinâmicas de Divulgação Progressiva */}
      <Tabs defaultValue="copiloto" className="w-full space-y-6 focus-visible:outline-none">
        <div className="border-b border-zinc-900/40 pb-1">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-950 border border-zinc-900/60 rounded-2xl p-1 h-auto max-w-[500px]">
            <TabsTrigger value="copiloto" className="rounded-xl py-2.5 font-bold text-xs uppercase tracking-wider">Copiloto</TabsTrigger>
            <TabsTrigger value="patrimonio" className="rounded-xl py-2.5 font-bold text-xs uppercase tracking-wider">Patrimônio</TabsTrigger>
            <TabsTrigger value="caixa" className="rounded-xl py-2.5 font-bold text-xs uppercase tracking-wider">Caixa & DRE</TabsTrigger>
          </TabsList>
        </div>

        {/* Aba 1: Copiloto (Default) */}
        <TabsContent value="copiloto" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-300">
          {/* Ações Secundárias Ordenadas */}
          {freedomData && (
            <NextActionsList items={freedomData.actions} />
          )}

          {/* Carrossel de Insights IA */}
          {aiInsights.length > 0 && (
            <InsightCarousel insights={aiInsights} />
          )}

          {/* Card IA da branch main */}
          <AiInsightsCard />

          {/* Linha do Tempo Estendida */}
          {freedomData && (
            <FreedomTimeline timeline={freedomData.timeline} />
          )}
        </TabsContent>

        {/* Aba 2: Patrimônio */}
        <TabsContent value="patrimonio" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-300">
          {dashboard.netWorth && (
            <div className="space-y-6">
              <Card id="tour-step-dashboard" className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-zinc-400 text-sm font-semibold tracking-wide flex items-center gap-2">
                        💎 PATRIMÔNIO LÍQUIDO (NET WORTH)
                      </CardTitle>
                      <div className="text-4xl font-extrabold tracking-tight text-white mt-1">
                        {showFinancialValues ? formatCurrency(dashboard.netWorth.value) : '••••••••••'}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-800/30">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Ativos Totais
                      </span>
                      <span className="font-bold">{showFinancialValues ? formatCurrency(dashboard.netWorth.totalAssets) : '••••••••••'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pl-3.5 border-l border-slate-800/50">
                      <div>
                        <span className="block text-zinc-500">Contas</span>
                        <span className="font-semibold text-zinc-300">{showFinancialValues ? formatCurrency(dashboard.netWorth.totalAccounts) : '••••••••••'}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500">Investimentos</span>
                        <span className="font-semibold text-zinc-300">{showFinancialValues ? formatCurrency(dashboard.netWorth.totalInvestments) : '••••••••••'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium text-rose-400">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        Passivos Totais
                      </span>
                      <span className="font-bold">{showFinancialValues ? formatCurrency(dashboard.netWorth.totalLiabilities) : '••••••••••'}</span>
                    </div>
                    <div className="text-xs text-zinc-400 pl-3.5 border-l border-slate-800/50">
                      <span className="block text-zinc-500">Financiamentos e Dívidas</span>
                      <span className="font-semibold text-zinc-300">{showFinancialValues ? formatCurrency(dashboard.netWorth.totalLiabilities) : '••••••••••'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Score Financeiro Executivo */}
              {wealthReport && (
                <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(16,185,129,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.01] to-transparent pointer-events-none" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-zinc-400 text-sm font-semibold tracking-wide flex items-center gap-2">
                      🎯 SCORE DE SAÚDE FINANCEIRA PF
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 pt-1">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="38" className="stroke-slate-800/50" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="38" 
                            stroke={
                              wealthReport.score >= 90 ? '#10b981' :
                              wealthReport.score >= 70 ? '#60a5fa' :
                              wealthReport.score >= 50 ? '#f59e0b' :
                              '#ef4444'
                            } 
                            strokeWidth="6" 
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 38} 
                            strokeDashoffset={2 * Math.PI * 38 - (wealthReport.score / 100) * (2 * Math.PI * 38)} 
                            strokeLinecap="round"
                            style={{ 
                              filter: `drop-shadow(0 0 4px ${
                                wealthReport.score >= 90 ? 'rgba(16,185,129,0.2)' :
                                wealthReport.score >= 70 ? 'rgba(96,165,250,0.2)' :
                                wealthReport.score >= 50 ? 'rgba(245,158,11,0.2)' :
                                '#ef4444'
                              })` 
                            }} 
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-white">{wealthReport.score}</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <div className={`text-lg font-bold tracking-tight ${
                          wealthReport.score >= 90 ? 'text-emerald-400' :
                          wealthReport.score >= 70 ? 'text-blue-400' :
                          wealthReport.score >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {wealthReport.scoreLabel}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">
                          Comportamento de receitas, gastos e aportes em relação ao planejamento estratégico pessoal.
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#00beea]" />
                        Insights de Saúde Financeira
                      </div>
                      {wealthReport.insights.length > 0 ? (
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                          {wealthReport.insights.slice(0, 2).map((insight: string, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-[11px] leading-relaxed text-zinc-300 flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">💡</span>
                              <span>{insight.replace(/^(🚨|⚠️|🎉|✅|💡)\s*/, '')}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/20 text-zinc-400 text-xs text-center">
                          Sem pendências ou desvios de orçamento identificados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <FinancialSection>
                <NetworthEvolutionChart data={netWorthHistory} />
              </FinancialSection>

              <FinancialSection>
                <ConsolidatedBalance data={dashboard.allocation} />
              </FinancialSection>
            </div>
          )}
        </TabsContent>

        {/* Aba 3: Caixa & DRE */}
        <TabsContent value="caixa" className="space-y-6 focus-visible:outline-none animate-in fade-in duration-300">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Saldo Consolidado"
              value={formatCurrency(dashboard.total)}
              icon={Landmark}
              glowColor="blue"
              description="Total PF + PJ"
            />
            <StatCard
              title="Saldo Pessoal"
              value={formatCurrency(dashboard.totalPF)}
              icon={Users}
              glowColor="green"
              description="Contas pessoais/familiares"
            />
            <StatCard
              title="Saldo Empresarial"
              value={formatCurrency(dashboard.totalPJ)}
              icon={Building2}
              glowColor="orange"
              description="Contas empresariais"
            />
            <StatCard
              title="Balanço Mensal"
              value={formatCurrency(monthly.balance)}
              icon={Banknote}
              glowColor="purple"
              description="Receitas - Despesas no mês atual"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FinancialSection>
              <MonthlyFlow data={dashboard.monthlyFlow} />
            </FinancialSection>

            <div className="space-y-6">
              <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(16,185,129,0.02)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white"><Users /> Resumo Pessoal</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Saldo PF"
                    value={formatCurrency(dashboard.totalPF)}
                    icon={TrendingUp}
                    variant="positive"
                    size="sm"
                  />
                  <StatCard
                    title="Receitas do Mês"
                    value={formatCurrency(monthly.income)}
                    icon={ArrowUp}
                    variant="positive"
                    size="sm"
                  />
                  <StatCard
                    title="Despesas do Mês"
                    value={formatCurrency(monthly.expenses)}
                    icon={ArrowDown}
                    variant="negative"
                    size="sm"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <FinancialSection>
            <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.02)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="h-5 w-5 text-zinc-400" />
                  Previsão de Caixa PJ
                </CardTitle>
                <CardDescription className="text-zinc-500">Projeção dos próximos {dashboard.cashflow.days} dias.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <StatCard title="Saldo Atual PJ" value={formatCurrency(dashboard.cashflow.currentBalance)} icon={Banknote} size="sm" />
                <StatCard title="Saídas Previstas" value={formatCurrency(dashboard.cashflow.totalOutflow)} icon={ArrowDown} variant="negative" size="sm" />
                <StatCard title="Menor Saldo" value={formatCurrency(dashboard.cashflow.lowestBalance)} icon={TrendingUp} variant={dashboard.cashflow.lowestBalance >= 0 ? "positive" : "negative"} size="sm" />
                <StatCard title="Saldo Projetado" value={formatCurrency(dashboard.cashflow.projectedBalance)} icon={Landmark} variant={dashboard.cashflow.projectedBalance >= 0 ? "positive" : "negative"} size="sm" />
              </CardContent>
              <CashflowScenarioSwitcher scenarios={dashboard.cashflowScenarios} />
            </Card>
          </FinancialSection>

          <FinancialSection>
            <Card className="rounded-3xl border border-slate-800/40 bg-slate-950/70 backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.02)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">DRE Empresarial</CardTitle>
                <CardDescription className="text-zinc-500">Resultado automático das empresas com base nos lançamentos PJ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-300">
                <DreRow label="Receita Bruta" value={dashboard.dre.receitaBruta} />
                <DreRow label="(-) Impostos" value={dashboard.dre.impostos} />
                <DreRow label="Receita Líquida" value={dashboard.dre.receitaLiquida} strong />
                <DreRow label="(-) Despesas Operacionais" value={dashboard.dre.despesas} />
                <DreRow label="Lucro Bruto" value={dashboard.dre.lucroBruto} strong />
                <DreRow label="(-) Pessoas" value={dashboard.dre.pessoas} />
                <DreRow label="Lucro Operacional" value={dashboard.dre.lucroOperacional} strong />
                <DreRow label="(-) Pró-labore" value={dashboard.dre.proLabore} />
                <DreRow label="(-) Outros" value={dashboard.dre.outros} />
                <DreRow label="Lucro Líquido" value={dashboard.dre.lucroLiquido} strong />
              </CardContent>
            </Card>
          </FinancialSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
