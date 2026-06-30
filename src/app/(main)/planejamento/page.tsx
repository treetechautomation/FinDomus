'use client';

import {
  getCurrentMonthKey,
  parseMonthKey,
  addMonths,
  formatMonthLabel,
  isTransactionInMonth,
} from '@/core/finance/financial-period-engine';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
// recharts — removido: import direto duplicado. Símbolos (PieChart, Pie, Cell, etc.)
// não são usados no JSX desta página — consumidos pelos sub-componentes BudgetExpensesChartCard e PlanningGoalsChartCard.
import { Plus, RotateCcw, Save, Trash2, Wallet, TrendingDown, ShieldAlert, PiggyBank, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  defaultWealthCategories,
  getDistributionTotal,
  getWealthInsight,
  type WealthCategory,
} from '@/core/finance/wealth-engine';
import { getWealthProfile, saveWealthProfile, getRecurringExpenses } from '@/services/firestore/planning';
import { getPersonalTransactions } from '@/services/firestore/transactions';
import { getCategories } from '@/services/firestore/categories';
import { getLiabilities } from '@/services/firestore/liabilities';
import { getAccountsWithBalance } from '@/services/firestore/accounts';
import { getInvestments } from '@/services/firestore/investments';
import { runFinancialKernel } from '@/core/finance/kernel';
import { useAuth } from '@/providers/auth-provider';
import { LEGACY_MERCHANT_CATEGORY_MAP } from '@/lib/constants/categories';
import { formatCurrencyBRL } from '@/lib/utils';
import { PlanningOverviewCards } from '@/components/planejamento/planning-overview-cards';
import { PlanningAlertCard } from '@/components/planejamento/planning-alert-card';
import { PlanningGoalsDiagnosisCard } from '@/components/planejamento/planning-goals-diagnosis-card';
import { PlanningInvestmentOpportunityCard } from '@/components/planejamento/planning-investment-opportunity-card';
// BudgetExpensesChartCard: dynamic import — adia recharts PieChart para após o first paint
const BudgetExpensesChartCard = dynamic(
  () => import('@/components/planejamento/budget-expenses-chart-card').then(m => ({ default: m.BudgetExpensesChartCard })),
  { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-muted" /> }
);
import { BudgetSummaryCard } from '@/components/planejamento/budget-summary-card';
// PlanningGoalsChartCard: dynamic import — adia recharts PieChart para após o first paint
const PlanningGoalsChartCard = dynamic(
  () => import('@/components/planejamento/planning-goals-chart-card').then(m => ({ default: m.PlanningGoalsChartCard })),
  { ssr: false, loading: () => <div className="h-[260px] animate-pulse rounded-xl bg-muted" /> }
);
import { PlanningGoalRecommendationCard } from '@/components/planejamento/planning-goal-recommendation-card';
import { PlanningGoalsManager } from '@/components/planejamento/planning-goals-manager';



const brl = formatCurrencyBRL;

function normalizeText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getPlanningTransactionCategory(transaction: any) {
  const raw = String(transaction?.category || '');
  return LEGACY_MERCHANT_CATEGORY_MAP[normalizeText(raw)] || raw;
}

function findGoalByTransactionCategory(transactionCategory: string, goals: WealthCategory[]) {
  const normalized = normalizeText(transactionCategory);

  return goals.find((goal) =>
    (goal.categories || []).some((category) => normalizeText(category) === normalized)
  );
}

function withDefaultGoalCategories(goal: WealthCategory): WealthCategory {
  const fallback = defaultWealthCategories.find((item) => item.id === goal.id || item.name === goal.name);

  return {
    ...goal,
    categories: goal.categories?.length ? goal.categories : fallback?.categories || [],
  };
}

function normalizeCategory(name: string) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export default function PlanejamentoPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [categories, setCategories] = useState<WealthCategory[]>(defaultWealthCategories);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return getCurrentMonthKey();
  });

  const total = useMemo(() => getDistributionTotal(categories), [categories]);
  const insight = useMemo(() => getWealthInsight(categories), [categories]);
  const canSave = total === 100;

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;
      setLoading(true);
      setError(null);
      try {
        const [profile, txs, liabs, recurring, cats, accs, invs] = await Promise.all([
          getWealthProfile(user.uid),
          getPersonalTransactions(user.uid),
          getLiabilities(user.uid),
          getRecurringExpenses(user.uid),
          getCategories(user.uid),
          getAccountsWithBalance(user.uid),
          getInvestments(user.uid),
        ]);

        if (profile?.categories?.length) {
          const merged = profile.categories.map(withDefaultGoalCategories);
          setCategories(merged);
        }
        setTransactions(txs || []);
        setLiabilities(liabs || []);
        setRecurringExpenses(recurring || []);
        setAvailableCategories((cats || []).map((c) => c.name));
        setAccounts(accs || []);
        setInvestments(invs || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do planejamento.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.uid, refreshKey]);

  const kernelResult = useMemo(() => {
    if (!user?.uid) return null;
    return runFinancialKernel({
      accounts,
      investments,
      liabilities,
      transactions,
      recurringExpenses,
      taxObligations: [],
      wealthProfile: { categories },
      monthlyClosures: [],
      investmentAnalytics: null,
      baseMonth: selectedMonth,
    });
  }, [user?.uid, accounts, investments, liabilities, transactions, recurringExpenses, categories, selectedMonth]);

  const selectedMonthKey = selectedMonth;

  const monthDate = parseMonthKey(selectedMonthKey);

  const monthLabel = formatMonthLabel(selectedMonthKey);

  const prevMonth = addMonths(selectedMonthKey, -1);
  const nextMonth = addMonths(selectedMonthKey, 1);

  const monthTransactions = transactions.filter((t: any) => {
    return isTransactionInMonth(t, selectedMonthKey);
  });

  const { dre, financialCore, freedom, reserve, ai, wealth } = kernelResult ?? {};
  const monthlyIncome = dre?.receitaTotal ?? 0;
  const monthlyExpenses = dre?.despesasOperacionais ?? 0;
  const monthlyLiabilities = financialCore?.monthlyDebtPayment ?? 0;
  const adjustedMonthlyLiabilities = monthlyLiabilities;
  const totalOutflow = monthlyExpenses + monthlyLiabilities;
  const availableToInvest = monthlyIncome - totalOutflow;

  const financialHealthStatus = freedom?.index?.levelLabel ?? "Indisponível";
  const financialHealthClass = 
    (freedom?.index?.freedomIndex ?? 0) >= 60 ? "text-emerald-500" :
    (freedom?.index?.freedomIndex ?? 0) >= 40 ? "text-yellow-400" :
    "text-red-500";
    
  const investmentSuggestion = freedom?.actions ?? [];
  const financialHealthMessage = ai?.insights?.[0]?.description ?? "Carregando diagnóstico...";


  const budgetRows = (wealth?.analysis ?? []).map((item) => {
    const planned = monthlyIncome * (item.metaPercent / 100);
    const spent = (item.realizadoPercent / 100) * monthlyIncome;
    
    // Encontrar impactos associados às categorias desse pilar
    const goalCats = (categories.find(c => c.name === item.pilar)?.categories || []).map(c => normalizeCategory(c));
    const goalTransactions = monthTransactions
      .filter((t: any) => t.type === 'expense')
      .filter((t: any) => {
        const txCat = normalizeCategory(getPlanningTransactionCategory(t));
        return goalCats.some((gc: string) => txCat.includes(gc) || gc.includes(txCat));
      });

    const impacts = Object.values(
      goalTransactions.reduce((acc: any, t: any) => {
        const name = getPlanningTransactionCategory(t) || 'Sem categoria';
        if (!acc[name]) acc[name] = { name, value: 0 };
        acc[name].value += Math.abs(Number(t.amount || 0));
        return acc;
      }, {})
    )
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 3);
    
    const used = item.metaPercent > 0 ? (item.realizadoPercent / item.metaPercent) * 100 : 0;
    const status = item.status === 'danger' ? 'Estourou' : 
                   item.status === 'warning' ? 'Atenção' : 'Saudável';
                   
    const recommendation =
      status === 'Estourou' ? "🚨 Corte urgente — muito acima do planejado" :
      status === 'Atenção' ? "⚠️ Atenção — risco de estourar" :
      "✅ Excelente controle";

    const matchedCategory = categories.find(c => c.name === item.pilar);
    const color = matchedCategory?.color || '#94a3b8';

    return {
      id: matchedCategory?.id || item.pilar.toLowerCase(),
      name: item.pilar,
      percentage: matchedCategory?.percentage || item.metaPercent,
      color,
      planned,
      spent,
      remaining: planned - spent,
      used,
      status,
      recommendation,
      impacts,
    };
  });

  const pressuredGoal = budgetRows.find(r => r.status !== 'Saudável');
  const biggestGoalExpense = [...budgetRows]
    .filter((item) => item.spent > 0)
    .sort((a, b) => b.spent - a.spent)[0];

  const riskyGoalsCount = budgetRows.filter((item) => item.status !== 'Saudável').length;

  const goalDiagnosisMessage =
    !budgetRows.some((item) => item.spent > 0)
      ? "Ainda não há gastos suficientes para diagnosticar suas metas neste mês."
      : riskyGoalsCount > 0
        ? `Você tem ${riskyGoalsCount} meta(s) exigindo atenção. Priorize ajustes nas categorias mais pressionadas.`
        : "Suas metas estão equilibradas no momento.";

  const expensesChartData = budgetRows.filter((item) => item.spent > 0);
  const plannedChartData = categories.map((item) => ({
    name: item.name,
    value: item.percentage,
    color: item.color,
  }));

  function updateCategory(id: string, patch: Partial<WealthCategory>) {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setSavedMessage('');
  }

  function addCategory() {
    setCategories((prev) => [
      ...prev,
      {
        id: `categoria_${Date.now()}`,
        name: 'Nova categoria',
        percentage: 0,
        color: '#94a3b8',
      },
    ]);
  }

  function removeCategory(id: string) {
    setCategories((prev) => prev.filter((item) => item.id !== id));
  }

  function addTransactionCategoryToGoal(goalId: string, transactionCategory: string) {
    if (!transactionCategory) return;

    setCategories((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        const current = goal.categories || [];
        if (current.some((item) => normalizeText(item) === normalizeText(transactionCategory))) return goal;

        return {
          ...goal,
          categories: [...current, transactionCategory],
        };
      })
    );

    setSavedMessage('');
  }

  function removeTransactionCategoryFromGoal(goalId: string, transactionCategory: string) {
    setCategories((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          categories: (goal.categories || []).filter((item) => normalizeText(item) !== normalizeText(transactionCategory)),
        };
      })
    );

    setSavedMessage('');
  }

  function suggestGoalsAutomatically() {
    setCategories(defaultWealthCategories.map(c => ({...c})));
    setSavedMessage('Metas sugeridas automaticamente. Revise e salve.');
  }

  function reset() {
    setCategories(defaultWealthCategories);
    setSavedMessage('');
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setSavedMessage('');

    try {
      if (!user?.uid) throw new Error("Usuário não autenticado.");
      await saveWealthProfile(user.uid, categories);
      setSavedMessage('Metas salvas com sucesso.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div>
          <div className="h-8 bg-zinc-900 rounded-lg w-64" />
          <div className="h-4 bg-zinc-900 rounded-lg w-96 mt-2" />
        </div>
        <div className="h-10 bg-zinc-900 rounded-lg w-72 mt-6" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-xl" />
          ))}
        </div>
        <div className="h-44 bg-zinc-900 rounded-xl mt-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-900 bg-zinc-950/20 rounded-3xl p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white">Ops, algo deu errado</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-md">{error}</p>
        <Button onClick={() => setRefreshKey(k => k + 1)} className="mt-6 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-xl px-6 py-2">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planejamento financeiro</h1>
        <p className="text-muted-foreground">
          Calcule seu orçamento pela receita do mês e pelas metas percentuais definidas por você.
        </p>
      </div>

      <Tabs defaultValue="orcamento" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visao">Visão geral</TabsTrigger>
          <TabsTrigger value="orcamento">Orçamento doméstico</TabsTrigger>
          <TabsTrigger value="metas">Minhas metas</TabsTrigger>
        </TabsList>
        <TabsContent value="visao" className="space-y-6">
          <PlanningOverviewCards
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyLiabilities={monthlyLiabilities}
            freedomIndex={freedom?.index?.freedomIndex ?? 0}
            freedomLevel={freedom?.index?.levelLabel ?? ""}
            freedomIcon={freedom?.index?.levelIcon ?? "🌱"}
            reserve={reserve ?? null}
            brl={brl}
          />

          <PlanningAlertCard 
            insights={ai?.insights ?? []} 
            freedomIndex={freedom?.index?.freedomIndex ?? 0}
          />
          
          <PlanningGoalsDiagnosisCard
            message={goalDiagnosisMessage}
            pressuredGoal={pressuredGoal}
            biggestGoalExpense={biggestGoalExpense}
            riskyGoalsCount={riskyGoalsCount}
            brl={brl}
          />
          
          {pressuredGoal && (
            <PlanningGoalRecommendationCard
              pressuredGoal={pressuredGoal}
              brl={brl}
            />
          )}
          
          <PlanningInvestmentOpportunityCard
            actions={freedom?.actions ?? []}
            brl={brl}
          />
        </TabsContent>

        <TabsContent value="orcamento" className="space-y-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMonth(prevMonth)}
                className="rounded-xl border bg-card px-4 py-3 text-sm font-semibold hover:bg-accent"
              >
                ←
              </button>

              <div className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground capitalize">
                {monthLabel}
              </div>

              <button
                onClick={() => setSelectedMonth(nextMonth)}
                className="rounded-xl border bg-card px-4 py-3 text-sm font-semibold hover:bg-accent"
              >
                →
              </button>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-primary">Renda do mês</div>
              <div className="rounded-xl border bg-background px-6 py-3 font-bold">
                {brl(monthlyIncome)}
              </div>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <BudgetExpensesChartCard
              expensesChartData={expensesChartData}
              plannedChartData={plannedChartData}
              budgetRows={budgetRows}
              brl={brl}
            />
            <BudgetSummaryCard
              budgetRows={budgetRows}
              monthlyIncome={monthlyIncome}
              totalOutflow={monthlyExpenses}
              brl={brl}
            />
          </div>
        </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
              <PlanningGoalsChartCard
                total={total}
                categories={categories}
              />
              <PlanningGoalsManager
                categories={categories}
                availableCategories={availableCategories}
                normalizeText={normalizeText}
                updateCategory={updateCategory}
                removeCategory={removeCategory}
                addTransactionCategoryToGoal={addTransactionCategoryToGoal}
                removeTransactionCategoryFromGoal={removeTransactionCategoryFromGoal}
                addCategory={addCategory}
                reset={reset}
                save={save}
                canSave={canSave}
                saving={saving}
              />
          </div>

          <Card className={canSave ? 'border-emerald-500/30' : 'border-amber-500/40'}>
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className={canSave ? 'font-semibold text-emerald-500' : 'font-semibold text-amber-500'}>
                {insight}
              </div>

              {savedMessage && <div className="font-semibold text-emerald-500">{savedMessage}</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
