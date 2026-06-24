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
import { useAuth } from '@/providers/auth-provider';
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



function brl(value: number) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizeText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const LEGACY_MERCHANT_CATEGORY_MAP: Record<string, string> = {
  guanabara: 'Alimentação',
  supermercado: 'Alimentação',
  mercado: 'Alimentação',
  shell: 'Transporte',
  ipiranga: 'Transporte',
  gasolina: 'Transporte',
  igreja: 'Doações',
  dizimo: 'Doações',
  dízimo: 'Doações',
};

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
  const [categories, setCategories] = useState<WealthCategory[]>(defaultWealthCategories);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const total = useMemo(() => getDistributionTotal(categories), [categories]);
  const insight = useMemo(() => getWealthInsight(categories), [categories]);
  const canSave = total === 100;

  useEffect(() => {
    async function load() {
      if (!user?.uid) return;
      const [profile, txs, liabs, recurring, cats] = await Promise.all([
        getWealthProfile(user.uid),
        getPersonalTransactions(user.uid),
        getLiabilities(user.uid),
        getRecurringExpenses(user.uid),
        getCategories(user.uid),
      ]);

      if (profile?.categories?.length) {
        const merged = profile.categories.map(withDefaultGoalCategories);
        setCategories(merged);
      }
      setTransactions(txs || []);
      setLiabilities(liabs || []);
      setRecurringExpenses(recurring || []);
      setAvailableCategories((cats || []).map((c) => c.name));
    }

    load();
  }, [user?.uid]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return getCurrentMonthKey();
  });



  const selectedMonthKey = selectedMonth;

  const monthDate = parseMonthKey(selectedMonthKey);

  const monthLabel = formatMonthLabel(selectedMonthKey);

  const prevMonth = addMonths(selectedMonthKey, -1);
  const nextMonth = addMonths(selectedMonthKey, 1);

  const monthTransactions = transactions.filter((t: any) => {
    return (
      isTransactionInMonth(t, selectedMonthKey)
    );
  });

  const monthlyIncome = monthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const monthlyRecurring = recurringExpenses
    .filter((r: any) => r.isActive)
    .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);

  const manualMonthlyLiabilities = liabilities
    .filter((l: any) => Number(l.remainingBalance || 0) > 0 && !l.installmentKey)
    .reduce((sum: number, l: any) => sum + Number(l.installmentValue || 0), 0);

  const autoInstallmentGroups = new Map<string, any>();

  transactions
    .filter((t: any) => t.isInstallment && Number(t.remainingInstallments || 0) > 0)
    .forEach((t: any) => {
      const key = [
        t.owner || "PF",
        t.installmentKey || t.description,
        t.installmentTotal || "",
        Number(t.amount || 0).toFixed(2),
      ].join("|");

      const existing = autoInstallmentGroups.get(key);

      if (!existing || Number(t.installmentCurrent || 0) > Number(existing.installmentCurrent || 0)) {
        autoInstallmentGroups.set(key, t);
      }
    });

  const autoMonthlyLiabilities = Array.from(autoInstallmentGroups.values())
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const autoRemainingLiabilities = Array.from(autoInstallmentGroups.values())
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0) * Number(t.remainingInstallments || 0), 0);

  const monthlyLiabilities = manualMonthlyLiabilities + autoMonthlyLiabilities;
  const totalFutureLiabilities = manualMonthlyLiabilities + autoRemainingLiabilities;

  const paidInstallmentsAmount = monthTransactions
    .filter((t: any) => t.type === 'expense' && (t.isInstallment || t.installmentKey))
    .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);

  const adjustedMonthlyLiabilities = Math.max(0, monthlyLiabilities - paidInstallmentsAmount);

const monthlyExpenses = monthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0)
        ;

  const budgetOutflow = monthlyExpenses;
  const totalOutflow = monthlyExpenses + monthlyRecurring;

  const availableToInvest = monthlyIncome - totalOutflow;

    const commitmentPercent = monthlyIncome > 0 ? (totalOutflow / monthlyIncome) * 100 : 100;
  const financialHealthStatus =
    commitmentPercent >= 80 ? "Crítico" : commitmentPercent >= 50 ? "Atenção" : "Saudável";
  const financialHealthClass =
    financialHealthStatus === "Crítico"
      ? "text-red-500"
      : financialHealthStatus === "Atenção"
        ? "text-yellow-400"
        : "text-emerald-500";
  const investmentSuggestion = (() => {
      if (availableToInvest <= 0) return null;

      if (monthlyLiabilities > monthlyIncome * 0.3) {
        return {
          reserve: availableToInvest * 0.3,
          invest: 0,
          debt: availableToInvest * 0.7,
          message: "Priorize quitar dívidas antes de investir"
        };
      }

      if (availableToInvest < monthlyIncome * 0.2) {
        return {
          reserve: availableToInvest * 0.7,
          invest: availableToInvest * 0.3,
          debt: 0,
          message: "Foque em segurança e reserva"
        };
      }

      return {
        reserve: availableToInvest * 0.4,
        invest: availableToInvest * 0.6,
        debt: 0,
        message: "Boa margem — aproveite para investir"
      };
    })();

    const financialHealthMessage =
    monthlyIncome <= 0
      ? "⚠️ Sem renda registrada no mês. Cadastre ou importe suas receitas para calcular sua saúde financeira."
      : totalOutflow > monthlyIncome
        ? "⚠️ Seu custo planejado está acima da sua renda. Revise parcelas, fixos e gastos variáveis."
        : commitmentPercent >= 80
          ? "⚠️ Sua renda está altamente comprometida. Evite novas dívidas e compras parceladas."
          : commitmentPercent >= 50
            ? "🟡 Atenção: uma parte relevante da renda já está comprometida."
            : "✅ Seu planejamento está saudável para este mês.";


  const budgetRows = categories.map((cat) => {
    const planned = monthlyIncome * (Number(cat.percentage || 0) / 100);
      const spent = monthTransactions
        .filter((t: any) => t.type === 'expense')
        .filter((t: any) => {
    const txCat = normalizeCategory(getPlanningTransactionCategory(t));
    const goalCats = (cat.categories || []).map((c: string) => normalizeCategory(c));
    return goalCats.some((gc: string) => txCat.includes(gc));
  })
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0)
        + (cat.name.toLowerCase().includes('dívida') || cat.name.toLowerCase().includes('divida')
            ? adjustedMonthlyLiabilities
            : 0);

    const remaining = planned - spent;
    const used = planned > 0 ? (spent / planned) * 100 : spent > 0 ? 100 : 0;

    const status =
        monthlyIncome <= 0 && spent > 0 ? 'Sem base' :
        used >= 100 ? 'Estourou' :
        used >= 80 ? 'Atenção' :
        'Saudável';

    
      const isDebtGoal = cat.name.toLowerCase().includes('dívida') || cat.name.toLowerCase().includes('divida');

      const goalTransactions = monthTransactions
        .filter((t: any) => t.type === 'expense')
        .filter((t: any) => {
          const txCat = normalizeCategory(getPlanningTransactionCategory(t));
          const goalCats = (cat.categories || []).map((c: string) => normalizeCategory(c));
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

      const recommendation =
        status === 'Sem base' ? "⚠️ Cadastre ou importe a renda do mês para calcular metas com precisão" :
        used >= 120 ? "🚨 Corte urgente — muito acima do planejado" :
        used >= 100 ? "⚠️ Estourado — reduzir gastos imediatamente" :
        used >= 80 ? "�� Atenção — risco de estourar" :
        used >= 50 ? "👍 Controle moderado" :
        "✅ Excelente controle";

      return {
        ...cat,
        planned,
        spent,
        remaining,
        used,
        status,
        recommendation,
        impacts,
      };

  });

  const pressuredGoal = [...budgetRows]
    .filter((item) => item.spent > 0)
    .sort((a, b) => b.used - a.used)[0];

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
    setCategories([
      {
        id: 'essenciais',
        name: 'Essenciais',
        percentage: 50,
        color: '#38bdf8',
        categories: [
          'Moradia (aluguel, condomínio)',
          'Aluguel',
          'Condomínio',
          'Energia',
          'Água',
          'Gás',
          'Internet',
          'Telefone',
          'Transporte',
          'Combustível',
          'Supermercado',
          'Farmácia',
          'Impostos',
        ],
      },
      {
        id: 'qualidade',
        name: 'Qualidade de vida',
        percentage: 20,
        color: '#34d399',
        categories: [
          'Alimentação',
          'Restaurante',
          'Lazer',
          'Pet',
          'Academia',
          'Saúde',
          'Plano de saúde',
          'Viagem',
          'Livros',
          'Compras',
          'Assinaturas (Netflix, Spotify etc.)',
        ],
      },
      {
        id: 'investimentos',
        name: 'Investimentos e patrimônio',
        percentage: 20,
        color: '#facc15',
        categories: [
          'Investimentos (aporte)',
          'Reserva de emergência',
        ],
      },
      {
        id: 'dividas',
        name: 'Dívidas e juros',
        percentage: 10,
        color: '#f87171',
        categories: [
          'Dívidas / Empréstimos',
          'Juros',
          'Financeiro / Pagamentos',
        ],
      },
    ]);

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
              totalOutflow={totalOutflow}
              monthlyRecurring={monthlyRecurring}
              monthlyLiabilities={monthlyLiabilities}
              financialHealthClass={financialHealthClass}
              financialHealthStatus={financialHealthStatus}
              commitmentPercent={commitmentPercent}
              brl={brl}
            />

            <PlanningAlertCard message={financialHealthMessage} />
            <PlanningGoalsDiagnosisCard
              message={goalDiagnosisMessage}
              pressuredGoal={pressuredGoal}
              biggestGoalExpense={biggestGoalExpense}
              riskyGoalsCount={riskyGoalsCount}
                brl={brl}
              />
            <PlanningGoalRecommendationCard
              pressuredGoal={pressuredGoal}
                brl={brl}
              />
              <PlanningInvestmentOpportunityCard
                investmentSuggestion={investmentSuggestion}
                availableToInvest={availableToInvest}
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
                totalOutflow={budgetOutflow}
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
