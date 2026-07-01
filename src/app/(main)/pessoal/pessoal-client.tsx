"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import {
  getCurrentMonthKey,
  parseMonthKey,
  addMonths,
  formatMonthLabel,
  isTransactionInMonth,
} from '@/core/finance/financial-period-engine';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, ArrowUp, ArrowDown, Banknote } from "lucide-react";
import { StatCard } from "@/components/overview/stat-card";
import { getBudgets, getWealthProfile } from "@/services/firestore/planning";
import { getTransactionsByMonth } from "@/services/firestore/transactions";
import { financialEvents } from "@/core/finance/events";
import {
  getMonthlyClosure,
  closeMonthlyCompetence,
  reopenMonth,
} from "@/services/firestore/monthly-closures";
import { getMonthOpening } from "@/services/firestore/month-openings";
import { useAuth } from '@/providers/auth-provider';
import { MonthFilter } from "@/components/pessoal/month-filter";
import { EditBudgetDialog } from "@/components/pessoal/edit-budget-dialog";
import dynamic from 'next/dynamic';

// NewTransactionDialog: dynamic import — carrega form + deps (CATEGORY_PF/PJ, TransactionFormFields)
// somente quando o usuário clica em "Novo Lançamento"; não impacta o first paint
const NewTransactionDialog = dynamic(
  () => import('@/components/pessoal/new-transaction-dialog').then(m => ({ default: m.NewTransactionDialog })),
  { ssr: false }
);

// CategorySpendingChart: dynamic import — adia recharts PieChart para após o first paint
const CategorySpendingChart = dynamic(
  () => import('@/components/pessoal/category-spending-chart').then(m => ({ default: m.CategorySpendingChart })),
  { ssr: false, loading: () => <div className="h-[380px] animate-pulse rounded-xl bg-muted" /> }
);

// SpendingTrendChart — removido fase 1: dead import (não renderizado nesta página)
// RevenueDashboard   — removido fase 1: dead import (não renderizado nesta página)

// RevenueChartPanel: dynamic import — adia recharts PieChart para após o first paint
const RevenueChartPanel = dynamic(
  () => import('@/components/pessoal/revenue-chart-panel').then(m => ({ default: m.RevenueChartPanel })),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-xl bg-muted" /> }
);

import { PersonalTransactionsTable } from '@/components/pessoal/table/personal-transactions-table';

const MERCHANT_CATEGORY_MAP: Record<string, string> = {
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

function normalizeTxText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getDisplayCategory(t: any) {
  // prioridade: categoria salva no banco
  if (t.category) return t.category;

  const raw = String(t.description || '');
  const mapped = MERCHANT_CATEGORY_MAP[normalizeTxText(raw)];

  return mapped || 'Sem categoria';
}

function getDisplayMerchant(t: any) {
  if (t.merchant) return t.merchant;
  const raw = String(t.category || '');
  const mapped = MERCHANT_CATEGORY_MAP[normalizeTxText(raw)];
  return mapped ? raw : '-';
}

function parseDateSafe(value: any): Date {
  if (!value) return new Date(0);

  if (value instanceof Date) return value;

  const raw = String(value).trim();

  const br = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const day = Number(br[1]);
    const month = Number(br[2]);
    const year = Number(br[3]);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function formatDateBR(value: any) {
  const d = parseDateSafe(value);
  return d.getTime() === 0 ? '-' : d.toLocaleDateString('pt-BR');
}

type PessoalPageProps = {
  searchParams?: Promise<{
    month?: string;
    mode?: string;
    category?: string;
    page?: string;
  }>;
};

const CATEGORY_TO_WEALTH = {
  'Alimentação': 'Essenciais',
  'Moradia': 'Essenciais',
  'Transporte': 'Essenciais',
  'Lazer': 'Estilo de vida',
  'Saúde': 'Qualidade de vida',
  'Educação': 'Capital intelectual',
};

export default function PessoalClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [personalTransactions, setPersonalTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [wealthProfile, setWealthProfile] = useState<any>(null);
  const [monthClosure, setMonthClosure] = useState<any>(null);
  const [monthOpening, setMonthOpening] = useState<any>(null);
  const [closingMonth, setClosingMonth] = useState(false);

  const [expenseType, setExpenseType] = useState('ALL');
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    async function loadPessoalData() {
      if (!user?.uid) return;
      try {
        const currentMonthKey = getCurrentMonthKey();
        const [budgetsResult, wealthResult] = await Promise.all([
          getBudgets(user.uid, currentMonthKey),
          getWealthProfile(user.uid)
        ]);

        setBudgets(budgetsResult || []);
        setWealthProfile(wealthResult || null);
      } catch (error) {
        console.error("Erro ao carregar módulo pessoal:", error);
        setPersonalTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    loadPessoalData();
  }, [user?.uid, refreshTrigger]);

  const resolvedSearchParams = {
    month: searchParams.get("month") || undefined,
    mode: searchParams.get("mode") || undefined,
    category: searchParams.get("category") || undefined,
    page: searchParams.get("page") || undefined,
  };

  const now = parseMonthKey(getCurrentMonthKey());
  const selectedMonth =
    resolvedSearchParams?.month !== undefined
      ? Number(resolvedSearchParams.month)
      : now.getMonth();

  const currentYear = now.getFullYear();

  const mode =
    resolvedSearchParams?.mode === "all"
      ? "all"
      : resolvedSearchParams?.mode === "month"
        ? "month"
        : "invoice";

  const selectedMonthKey = `${currentYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  useEffect(() => {
    async function loadSelectedMonthClosure() {
        if (!user?.uid) return;
        const [closureResult, openingResult] = await Promise.all([
          getMonthlyClosure(user.uid, "PF", selectedMonthKey),
          getMonthOpening("PF", selectedMonthKey),
        ]);

        setMonthClosure(closureResult);
        setMonthOpening(openingResult);
    }

    async function loadTransactions() {
      if (!user?.uid) return;
      const result = await getTransactionsByMonth(user.uid, 'PF', selectedMonthKey);
      setPersonalTransactions(result || []);
    }

    loadSelectedMonthClosure();
    loadTransactions();
  }, [selectedMonthKey, user?.uid, refreshTrigger]);

  // Listener reativo para novos lançamentos via importador (sem F5)
  useEffect(() => {
    const handler = async () => {
      if (!user?.uid) return;
      const result = await getTransactionsByMonth(user.uid, 'PF', selectedMonthKey);
      setPersonalTransactions(result || []);
    };
    financialEvents.on('transaction:created', handler);
    return () => {
      financialEvents.off('transaction:created', handler);
    };
  }, [selectedMonthKey, user?.uid]);


  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Módulo Pessoal / Familiar
        </h1>
        <div className="rounded-xl border bg-card p-6 text-muted-foreground">
          Carregando módulo pessoal...
        </div>
      </div>
    );
  }

  const sortedTransactions = [...personalTransactions].sort((a: any, b: any) => {
    return parseDateSafe(b.date).getTime() - parseDateSafe(a.date).getTime();
  });

  const latestImport = sortedTransactions
    .map((t: any) => String(t.createdAt || ''))
    .filter(Boolean)
    .sort()
    .at(-1);

  const invoiceTransactions = latestImport
    ? sortedTransactions.filter((t: any) => String(t.createdAt || '') === latestImport)
    : sortedTransactions;

  const invoiceDates = invoiceTransactions
    .map((t: any) => parseDateSafe(t.date))
    .filter((d: Date) => d.getTime() > 0)
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

  const invoiceStart = invoiceDates[0];
  const invoiceEnd = invoiceDates[invoiceDates.length - 1];


    const monthTransactions = sortedTransactions.filter((t: any) => {
      return isTransactionInMonth(t, selectedMonthKey);
    });

    const filteredTransactions =
      mode === "all"
        ? sortedTransactions
        : monthTransactions;


    const activeCategory = resolvedSearchParams?.category
      ? decodeURIComponent(String(resolvedSearchParams.category))
      : '';

    const expenseTransactions = filteredTransactions.filter((t: any) => t.type === 'expense');
    const incomeTransactions = filteredTransactions.filter((t: any) => t.type === 'income');

    const visibleTransactions = activeCategory
      ? filteredTransactions.filter((t: any) => getDisplayCategory(t) === activeCategory)
      : filteredTransactions;

    const visibleExpenseTransactions = activeCategory
      ? expenseTransactions.filter((t: any) => getDisplayCategory(t) === activeCategory)
      : expenseTransactions;


  const today = parseMonthKey(getCurrentMonthKey());
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const monthProgress = currentDay / daysInMonth;

  const baseBudget = budgets.map(b => ({
    category: b.category,
    planned: b.planned
  }));
  const hasBudget = baseBudget.length > 0;


const wealthMap = Object.fromEntries(
  (wealthProfile?.categories || []).map((c: any) => [c.name.toLowerCase(), c.percentage])
);


const incomeData = incomeTransactions;

  const closedSnapshot = monthClosure?.status === "CLOSED" ? monthClosure?.snapshot : null;
  const income = closedSnapshot?.kpis?.income ?? filteredTransactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
const categoryChartData: { name: string; value: number }[] = Object.values(
  expenseTransactions
    .reduce((acc: any, t: any) => {
      const cat = getDisplayCategory(t);
      if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
      acc[cat].value += Math.abs(Number(t.amount || 0));
      return acc;
    }, {})
);

let runningBalance = 0;

const incomeCategoryChartData: { name: string; value: number }[] = Object.values(
  incomeTransactions.reduce((acc: any, t: any) => {
    const cat = getDisplayCategory(t);
    if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
    acc[cat].value += Number(t.amount || 0);
    return acc;
  }, {})
);

const trendChartData = Object.values(
  filteredTransactions.reduce((acc: any, t: any) => {
    const d = parseDateSafe(t.date);
    if (d.getTime() <= 0) return acc;

    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    if (!acc[key]) {
      acc[key] = {
        key,
        label,
        expenses: 0,
        income: 0,
        balance: 0,
      };
    }

    const amount = Math.abs(Number(t.amount || 0));

    if (t.type === 'income') {
      acc[key].income += amount;
    }

    if (t.type === 'expense') {
      acc[key].expenses += amount;
    }

    return acc;
  }, {})
).sort((a: any, b: any) => String(a.key).localeCompare(String(b.key)))
.map((item: any) => {
  runningBalance += item.income - item.expenses;
  return {
    ...item,
    balance: runningBalance
  };
});

    const expenses = closedSnapshot?.kpis?.expenses ?? filteredTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);

    const openingBalance = Number(monthOpening?.openingBalance || 0);

    const operationalBalance =
      closedSnapshot?.kpis?.balance ?? (income - expenses);

    const previousOperationalBalance =
      Number(monthOpening?.previousOperationalBalance ?? 0);

    const balance = operationalBalance;

    const accumulatedBalance =
      previousOperationalBalance + operationalBalance;

  const smartBudget = baseBudget.map((budget) => {
    const spent = filteredTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

    const wealthCategory =
      CATEGORY_TO_WEALTH[budget.category as keyof typeof CATEGORY_TO_WEALTH] || budget.category;

    const strategyPercent = wealthMap[String(wealthCategory).toLowerCase()] || 0;

    const planned = income * (strategyPercent / 100);

    const percent = planned > 0 ? (spent / planned) * 100 : 0;

    const projected = monthProgress > 0 ? spent / monthProgress : spent;
    const projectedPercent = planned > 0 ? (projected / planned) * 100 : 0;

    let status = 'OK';
    if (percent >= 100 || projectedPercent >= 110) status = 'Estourou';
    else if (percent >= 80 || projectedPercent >= 95) status = 'Atenção';

    const suggestedPlanned =
      projected > planned * 1.1
        ? Math.ceil((projected * 1.05) / 50) * 50
        : null;

    return {
      ...budget,
      spent,
      percent,
      projected,
      projectedPercent,
      suggestedPlanned,
      status,
    };
  }).sort((a, b) => b.spent - a.spent);

  const criticalCategories = smartBudget.filter((item) => item.status === 'Estourou');
  const totalPlanned = smartBudget.reduce((sum, item) => sum + item.planned, 0);
  const totalSpent = smartBudget.reduce((sum, item) => sum + item.spent, 0);
  const attentionCategories = smartBudget.filter((item) => item.status === 'Atenção');

  
  const pageSize = 10;
  const currentPage = Math.max(1, expensePage);
  const totalPages = Math.max(1, Math.ceil(visibleTransactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  async function handleCloseMonth() {
    if (!user?.uid) return;
    try {
      setClosingMonth(true);
      const result = await closeMonthlyCompetence(user.uid, "PF", selectedMonthKey);
      setMonthClosure(result);
    } finally {
      setClosingMonth(false);
    }
  }

  async function handleReopenMonth() {
    if (!monthClosure?.id || !user?.uid) return;

    try {
      setClosingMonth(true);
      await reopenMonth(monthClosure.id);
      const result = await getMonthlyClosure(user.uid, "PF", selectedMonthKey);
      setMonthClosure(result);
    } finally {
      setClosingMonth(false);
    }
  }

  const incomePageSize = 10;
  const incomeTotalPages = Math.max(1, Math.ceil(incomeTransactions.length / incomePageSize));
  const safeIncomePage = Math.min(incomePage, incomeTotalPages);
  const paginatedIncomeTransactions = incomeTransactions.slice((safeIncomePage - 1) * incomePageSize, safeIncomePage * incomePageSize);
  const paginatedTransactions = visibleExpenseTransactions.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize
    );

  

return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Módulo Pessoal / Familiar
          </h1>
          <p className="text-muted-foreground mt-1">Controle suas finanças pessoais e da sua família.</p>
        </div>

        <div className="flex items-center gap-2">
          <MonthFilter currentMonth={selectedMonth} />
          <div id="tour-step-pessoal-novo">
            <NewTransactionDialog />
          </div>
          <Link href="/importacoes" id="tour-step-pessoal-importar">
            <Button variant="outline" size="sm" className="h-9 rounded-xl">
              Importar Extrato
            </Button>
          </Link>
        </div>
      </div>

      <div id="tour-step-pessoal-stats" className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard

          title="Receitas do Mês"
          value={income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={ArrowUp}
          description="Receitas totais no mês selecionado"
          variant="positive"
        />
        <StatCard
          title="Despesas do Mês"
          value={expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={ArrowDown}
          description="Despesas totais no mês selecionado"
          variant="negative"
        />
        <StatCard
          title="Saldo do Mês"
          value={balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={Banknote}
          description="Receitas - Despesas"
        />
          <StatCard
            title="Resultado anterior"
            value={previousOperationalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            icon={Banknote}
            description="Resultado operacional do mês anterior"
            variant="warning"
          />
          <StatCard
            title="Saldo acumulado"
            value={accumulatedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            icon={Banknote}
            description="Resultado anterior + saldo do mês"
            variant={accumulatedBalance >= 0 ? 'positive' : 'negative'}
          />
      </div>
        <div id="tour-step-pessoal-fechar" className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border px-3 py-1 text-xs font-medium">
            Status do mês: {monthClosure?.status || "OPEN"}
          </div>

          {monthClosure?.status === "CLOSED" ? (
            <button
              type="button"
              disabled={closingMonth}
              onClick={handleReopenMonth}
              className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-40"
            >
              Reabrir mês
            </button>
          ) : (
            <button
              type="button"
              disabled={closingMonth}
              onClick={handleCloseMonth}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              Fechar mês
            </button>
          )}

          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">Todas despesas</option>
            {Array.from(new Set(expenseTransactions.map((t: any) => getDisplayCategory(t))))
              .filter(Boolean)
              .sort()
              .map((category: any) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>

        {/* Seção de Orçamentos e Alinhamento Financeiro */}
        <div className="grid gap-6 xl:grid-cols-2 mt-6">
          <Card className="rounded-3xl border border-zinc-900 bg-zinc-950/20 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-cyan-400" />
                    Orçamentos Mensais
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1">Acompanhe seus limites de gastos por categoria.</p>
                </div>
                <EditBudgetDialog category="Alimentação" month={selectedMonthKey} onSuccess={handleRefresh} />
              </div>

              {!hasBudget ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-800 rounded-2xl p-4 mt-6">
                  <p className="text-sm text-zinc-400 font-semibold">Nenhum orçamento definido para este mês</p>
                  <p className="text-xs text-zinc-500 mt-1">Clique em "Definir orçamento" para planejar seus gastos.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {smartBudget.map((b) => (
                    <div key={b.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300 font-medium">{b.category}</span>
                        <span className="text-zinc-400 text-xs">
                          {b.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / <span className="text-zinc-300 font-bold">{b.planned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </span>
                      </div>
                      <Progress value={Math.min(b.percent, 100)} className="h-1.5 bg-zinc-900" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-3xl border border-zinc-900 bg-zinc-950/20 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                Wealth Alignment
              </h3>
              <p className="text-zinc-500 text-xs mt-1">Distribuição alinhada com as recomendações de construção patrimonial.</p>
              <div className="space-y-4 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Receitas Totais:</span>
                  <span className="text-emerald-500 font-bold">{income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Limites Totais Planejados:</span>
                  <span className="text-zinc-400 font-semibold">{totalPlanned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-zinc-900 pt-2">
                  <span className="text-zinc-300">Total Utilizado:</span>
                  <span className={`font-bold ${totalSpent > totalPlanned ? 'text-red-500' : 'text-zinc-300'}`}>
                    {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({totalPlanned > 0 ? ((totalSpent / totalPlanned) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 font-light border-t border-zinc-900/50 pt-3 mt-4">
              Alinhamento automático com o perfil de investimento e planejamento financeiro central.
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mt-6">
          <div id="tour-step-pessoal-tabela" className="space-y-3">
            <PersonalTransactionsTable
              title="Lançamentos Recentes: Despesas"
              description="Últimas despesas pessoais/familiares no período selecionado."
              transactions={paginatedTransactions}
              getDisplayCategory={getDisplayCategory}
              getDisplayMerchant={getDisplayMerchant}
              formatDateBR={formatDateBR}
              cn={cn}
              onSuccess={handleRefresh}
            />
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => setExpensePage((page) => Math.max(1, page - 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>

              <div className="text-sm text-muted-foreground">
                Página {safePage} de {totalPages}
              </div>

              <button
                disabled={safePage >= totalPages}
                onClick={() => setExpensePage((page) => Math.min(totalPages, page + 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          </div>

          <div id="tour-step-pessoal-grafico">
            <CategorySpendingChart
              data={categoryChartData}
              selectedCategory={activeCategory}
              month={selectedMonth}
              mode={mode}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <PersonalTransactionsTable
              title="Lançamentos Recentes: Receitas por Tipo"
              description="Receitas, recebimentos e serviços prestados no período selecionado."
              transactions={paginatedIncomeTransactions}
              getDisplayCategory={getDisplayCategory}
              getDisplayMerchant={getDisplayMerchant}
              formatDateBR={formatDateBR}
              cn={cn}
              onSuccess={handleRefresh}
            />

            <div className="flex items-center justify-center gap-2">
              <button
                disabled={safeIncomePage <= 1}
                onClick={() => setIncomePage((page) => Math.max(1, page - 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>

              <div className="text-sm text-muted-foreground">
                Página {safeIncomePage} de {incomeTotalPages}
              </div>

              <button
                disabled={safeIncomePage >= incomeTotalPages}
                onClick={() => setIncomePage((page) => Math.min(incomeTotalPages, page + 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                Próxima →
              </button>
            </div>
          </div>

          <RevenueChartPanel
            data={incomeCategoryChartData}
          />
        </div>

    </div>
  );
}
