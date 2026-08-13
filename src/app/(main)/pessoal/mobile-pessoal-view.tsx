"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, ArrowUp, ArrowDown, Banknote } from "lucide-react";
import { StatCard } from "@/components/overview/stat-card";
import { MonthFilter } from "@/components/pessoal/month-filter";
import { EditBudgetDialog } from "@/components/pessoal/edit-budget-dialog";
import dynamic from 'next/dynamic';

const NewTransactionDialog = dynamic(
  () => import('@/components/pessoal/new-transaction-dialog').then(m => ({ default: m.NewTransactionDialog })),
  { ssr: false }
);

const CategorySpendingChart = dynamic(
  () => import('@/components/pessoal/category-spending-chart').then(m => ({ default: m.CategorySpendingChart })),
  { ssr: false, loading: () => <div className="h-[380px] animate-pulse rounded-xl bg-muted" /> }
);

const RevenueChartPanel = dynamic(
  () => import('@/components/pessoal/revenue-chart-panel').then(m => ({ default: m.RevenueChartPanel })),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-xl bg-muted" /> }
);

import { PersonalTransactionsTable } from '@/components/pessoal/table/personal-transactions-table';

interface MobilePessoalViewProps {
  loading: boolean;
  selectedMonth: number;
  selectedMonthKey: string;
  income: number;
  expenses: number;
  balance: number;
  previousOperationalBalance: number;
  accumulatedBalance: number;
  monthClosure: any;
  closingMonth: boolean;
  handleCloseMonth: () => Promise<void>;
  handleReopenMonth: () => Promise<void>;
  expenseType: string;
  setExpenseType: (value: string) => void;
  expenseTransactions: any[];
  getDisplayCategory: (t: any) => string;
  hasBudget: boolean;
  smartBudget: any[];
  handleRefresh: () => void;
  totalPlanned: number;
  totalSpent: number;
  paginatedTransactions: any[];
  getDisplayMerchant: (t: any) => string;
  formatDateBR: (value: any) => string;
  safePage: number;
  totalPages: number;
  setExpensePage: (value: any) => void;
  activeCategory: string;
  categoryChartData: { name: string; value: number }[];
  mode: string;
  paginatedIncomeTransactions: any[];
  safeIncomePage: number;
  incomeTotalPages: number;
  setIncomePage: (value: any) => void;
  incomeCategoryChartData: { name: string; value: number }[];
}

export default function MobilePessoalView(props: MobilePessoalViewProps) {
  const {
    loading,
    selectedMonth,
    selectedMonthKey,
    income,
    expenses,
    balance,
    previousOperationalBalance,
    accumulatedBalance,
    monthClosure,
    closingMonth,
    handleCloseMonth,
    handleReopenMonth,
    expenseType,
    setExpenseType,
    expenseTransactions,
    getDisplayCategory,
    hasBudget,
    smartBudget,
    handleRefresh,
    totalPlanned,
    totalSpent,
    paginatedTransactions,
    getDisplayMerchant,
    formatDateBR,
    safePage,
    totalPages,
    setExpensePage,
    activeCategory,
    categoryChartData,
    mode,
    paginatedIncomeTransactions,
    safeIncomePage,
    incomeTotalPages,
    setIncomePage,
    incomeCategoryChartData,
  } = props;

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
                onClick={() => setExpensePage((page: number) => Math.max(1, page - 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>

              <div className="text-sm text-muted-foreground">
                Página {safePage} de {totalPages}
              </div>

              <button
                disabled={safePage >= totalPages}
                onClick={() => setExpensePage((page: number) => Math.min(totalPages, page + 1))}
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
                onClick={() => setIncomePage((page: number) => Math.max(1, page - 1))}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>

              <div className="text-sm text-muted-foreground">
                Página {safeIncomePage} de {incomeTotalPages}
              </div>

              <button
                disabled={safeIncomePage >= incomeTotalPages}
                onClick={() => setIncomePage((page: number) => Math.min(incomeTotalPages, page + 1))}
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
