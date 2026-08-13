"use client";

import {
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  RefreshCw,
  CreditCard,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { type RecurringExpense } from '@/services/firestore/planning';
import { type Account } from '@/services/firestore/accounts';
import { formatCurrencyBRL as brl, formatCurrencyInput } from '@/lib/utils';
import Link from 'next/link';

interface MobileAssinaturasViewProps {
  loading: boolean;
  categories: string[];
  totals: { pfTotal: number; pjTotal: number; total: number; pfCount: number; pjCount: number; totalCount: number };
  monthlyIncome: number;
  activeTab: string;
  setActiveTab: (value: any) => void;
  suggestions: any[];
  ownerFilter: string;
  setOwnerFilter: (value: any) => void;
  filteredExpenses: RecurringExpense[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  dialogMode: 'create' | 'edit';
  formName: string;
  setFormName: (value: string) => void;
  formAmountRaw: string;
  setFormAmountRaw: (value: string) => void;
  formCategory: string;
  setFormCategory: (value: string) => void;
  formOwner: string;
  setFormOwner: (value: any) => void;
  formDayOfMonth: string;
  setFormDayOfMonth: (value: string) => void;
  formIsActive: boolean;
  setFormIsActive: (value: boolean) => void;
  isPayDialogOpen: boolean;
  setIsPayDialogOpen: (open: boolean) => void;
  payingExpense: RecurringExpense | null;
  payAccountId: string;
  setPayAccountId: (value: string) => void;
  payDate: string;
  setPayDate: (value: string) => void;
  filteredAccountsForPayment: Account[];
  paying: boolean;
  deletingExpense: RecurringExpense | null;
  setDeletingExpense: (value: RecurringExpense | null) => void;
  deleting: boolean;
  handleOpenCreate: () => void;
  handleOpenEdit: (expense: RecurringExpense) => void;
  handleOpenPay: (expense: RecurringExpense) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleToggleActive: (expense: RecurringExpense) => Promise<void>;
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleConfirmPayment: (e: React.FormEvent) => Promise<void>;
  handleQuickImport: (suggestion: any) => Promise<void>;
  isPaidThisMonth: (expense: RecurringExpense) => boolean;
  getDaysUntilDue: (dayOfMonth: number) => number;
}

export default function MobileAssinaturasView(props: MobileAssinaturasViewProps) {
  const {
    loading,
    categories,
    totals,
    monthlyIncome,
    activeTab,
    setActiveTab,
    suggestions,
    ownerFilter,
    setOwnerFilter,
    filteredExpenses,
    isDialogOpen,
    setIsDialogOpen,
    dialogMode,
    formName,
    setFormName,
    formAmountRaw,
    setFormAmountRaw,
    formCategory,
    setFormCategory,
    formOwner,
    setFormOwner,
    formDayOfMonth,
    setFormDayOfMonth,
    formIsActive,
    setFormIsActive,
    isPayDialogOpen,
    setIsPayDialogOpen,
    payingExpense,
    payAccountId,
    setPayAccountId,
    payDate,
    setPayDate,
    filteredAccountsForPayment,
    paying,
    deletingExpense,
    setDeletingExpense,
    deleting,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenPay,
    handleDeleteConfirm,
    handleToggleActive,
    handleSave,
    handleConfirmPayment,
    handleQuickImport,
    isPaidThisMonth,
    getDaysUntilDue,
  } = props;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40 bg-background/95">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-36 animate-pulse rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Assinaturas & Custos Fixos
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Monitore suas assinaturas recorrentes (SaaS, streamings) e despesas fixas (aluguel, contas).
            A IA detecta automaticamente novos padrões a partir do seu extrato.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/?simulate=expense_reduction">
            <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <TrendingUp className="mr-1 h-4 w-4" />
              Simular Redução
            </Button>
          </Link>
          <Button id="tour-step-assinaturas-adicionar" onClick={handleOpenCreate} className="bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-[0_0_20px_rgba(219,39,119,0.25)] transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Novo Custos/Fixos
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Cost Card */}
        <Card id="tour-step-assinaturas-total" className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-pink-500/10 group-hover:text-pink-500/20 transition-colors">
            <RefreshCw className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-pink-400/90 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Comprometimento Mensal Total
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{brl(totals.total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total consolidado de <span className="font-semibold text-foreground">{totals.totalCount}</span> despesas ativas.
            </p>
          </CardContent>
        </Card>

        {/* PF Cost Card */}
        <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            <Wallet className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Pessoa Física (PF)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{brl(totals.pfTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totals.pfCount}</span> despesas ativas sob controle pessoal.
            </p>
          </CardContent>
        </Card>

        {/* PJ Cost Card */}
        <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
            <TrendingUp className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              Pessoa Jurídica (PJ)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">{brl(totals.pjTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totals.pjCount}</span> despesas ativas vinculadas às empresas.
            </p>
          </CardContent>
        </Card>

        {/* Impacto no Orçamento Card */}
        <Card id="tour-step-assinaturas-impacto" className={`border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg relative overflow-hidden group transition-all duration-300 ${
          monthlyIncome > 0 && totals.pfTotal / monthlyIncome > 0.5 ? 'border-amber-500/30' : ''
        }`}>
          <div className="absolute top-0 right-0 p-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
            <AlertCircle className="h-24 w-24 -mr-6 -mt-6" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Impacto no Orçamento (PF)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold">
              {monthlyIncome > 0 ? `${((totals.pfTotal / monthlyIncome) * 100).toFixed(1)}%` : '—'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {monthlyIncome > 0
                ? `${brl(totals.pfTotal)} de ${brl(monthlyIncome)} da renda mensal`
                : 'Importe transações para calcular o impacto.'}
            </p>
            {monthlyIncome > 0 && totals.pfTotal / monthlyIncome > 0.5 && (
              <p className="text-xs text-amber-400 mt-1 font-medium">
                ⚠️ Mais de 50% da renda comprometida com despesas fixas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-2">
          <TabsList className="bg-muted/50 border border-border/40 p-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-background font-medium">
              Minhas Recorrências
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-background font-medium flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              Sugestões da IA
              {suggestions.length > 0 && (
                <Badge className="bg-pink-600 hover:bg-pink-600 text-[10px] h-4 px-1.5 ml-1">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'active' && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={ownerFilter} onValueChange={(v: any) => setOwnerFilter(v)}>
                <SelectTrigger className="w-[140px] h-9 bg-background/50 border-border/40">
                  <SelectValue placeholder="Proprietário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Saved Recurrences Tab */}
        <TabsContent value="active" className="m-0 space-y-4">
          <Card className="border-border/40 bg-background/95">
            <CardContent className="p-0">
              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <div className="rounded-full bg-pink-500/10 p-4 mb-4">
                    <RefreshCw className="h-8 w-8 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Nenhuma recorrência encontrada</h3>
                  <p className="text-sm max-w-sm mt-1 mb-4">
                    Adicione seus gastos mensais fixos ou assinaturas como Netflix, Spotify, aluguel, etc.
                  </p>
                  <Button onClick={handleOpenCreate} variant="outline" className="border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Primeira
                  </Button>
                </div>
              ) : (
                <div id="tour-step-assinaturas-calendario" className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Valor Mensal</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Proprietário</TableHead>
                        <TableHead>Mês Atual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => {
                        const paid = isPaidThisMonth(expense);
                        return (
                          <TableRow key={expense.id} className="hover:bg-muted/10">
                            <TableCell className="font-semibold text-foreground">{expense.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-muted bg-muted/20 font-normal">
                                {expense.category || 'Outros'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{brl(expense.amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                <Calendar className="h-3.5 w-3.5 text-pink-400" />
                                Dia {expense.dayOfMonth || '-'}
                                {expense.isActive && expense.dayOfMonth && (() => {
                                  const days = getDaysUntilDue(Number(expense.dayOfMonth));
                                  if (days <= 3) return (
                                    <Badge className="bg-red-500/15 text-red-400 hover:bg-red-500/15 text-[10px] h-4 px-1 ml-1">
                                      {days === 0 ? 'Hoje' : `${days}d`}
                                    </Badge>
                                  );
                                  if (days <= 7) return (
                                    <Badge className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/15 text-[10px] h-4 px-1 ml-1">
                                      {days}d
                                    </Badge>
                                  );
                                  return null;
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                expense.owner === 'PF'
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-cyan-500/15 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              }>
                                {expense.owner}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {expense.isActive ? (
                                paid ? (
                                  <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1 w-fit font-normal">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    Pago
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 text-xs px-2 flex items-center gap-1 font-semibold"
                                    onClick={() => handleOpenPay(expense)}
                                  >
                                    Pagar
                                  </Button>
                                )
                              ) : (
                                <Badge variant="secondary" className="text-muted-foreground bg-muted/20">
                                  Inativo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={expense.isActive}
                                  onCheckedChange={() => handleToggleActive(expense)}
                                  className="data-[state=checked]:bg-pink-600"
                                />
                                <span className={`text-xs ${expense.isActive ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                  {expense.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleOpenEdit(expense)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                  onClick={() => setDeletingExpense(expense)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA Suggestions Tab */}
        <TabsContent value="suggestions" className="m-0 space-y-4">
          <Card className="border-border/40 bg-background/95">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
                Detecção Inteligente de Padrões
              </CardTitle>
              <CardDescription>
                Nossos algoritmos analisam a frequência e os valores dos seus lançamentos passados para encontrar custos fixos e assinaturas.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <div className="rounded-full bg-pink-500/5 p-4 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-pink-500/50" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Tudo limpo!</h3>
                  <p className="text-sm max-w-sm mt-1">
                    Não identificamos novos gastos recorrentes não mapeados em seu extrato financeiro.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((sug, i) => (
                    <Card key={i} className="border-border/40 bg-muted/20 relative overflow-hidden group hover:border-pink-500/30 transition-all">
                      <div className="absolute top-0 right-0 p-3 text-pink-500/10 group-hover:text-pink-500/20 transition-colors">
                        <Sparkles className="h-12 w-12" />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-[10px] font-normal">
                            Confiança: {Math.round(sug.confidence * 100)}%
                          </Badge>
                          <Badge className={
                            sug.owner === 'PF'
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30 text-[10px]'
                              : 'bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/15 border border-cyan-500/30 text-[10px]'
                          }>
                            {sug.owner}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold text-foreground mt-2 line-clamp-1">{sug.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Detectado {sug.occurrences}x nos lançamentos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-baseline justify-between mb-4">
                          <span className="text-sm text-muted-foreground">Média estimada</span>
                          <span className="text-xl font-extrabold text-foreground">{brl(sug.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-pink-400" />
                            Dia {sug.dayOfMonth}
                          </span>
                          <span className="capitalize">{sug.category}</span>
                        </div>
                        <Button
                          onClick={() => handleQuickImport(sug)}
                          className="w-full mt-4 bg-muted hover:bg-pink-600 hover:text-white border border-border/40 text-xs font-medium py-1.5 transition-all"
                          variant="ghost"
                        >
                          Adicionar Recorrência
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border/40 bg-background supports-[backdrop-filter]:bg-background/95">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              {dialogMode === 'create' ? 'Registrar Recorrência' : 'Editar Recorrência'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Nome/Description */}
            <div className="space-y-1">
              <Label htmlFor="name">Nome da Despesa / Assinatura</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Netflix, Aluguel, Spotify, Canva"
                className="bg-muted/20 border-border/40"
                required
              />
            </div>

            {/* Valor/Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="amount">Valor Mensal (R$)</Label>
                <Input
                  id="amount"
                  value={formAmountRaw ? formatCurrencyInput(formAmountRaw) : ''}
                  onChange={(e) => setFormAmountRaw(e.target.value.replace(/\D/g, ''))}
                  placeholder="R$ 0,00"
                  className="bg-muted/20 border-border/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dayOfMonth">Dia do Vencimento</Label>
                <Select value={formDayOfMonth} onValueChange={setFormDayOfMonth}>
                  <SelectTrigger className="bg-muted/20 border-border/40">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, idx) => (
                      <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                        Dia {idx + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categoria & Proprietário */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="bg-muted/20 border-border/40">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="owner">Proprietário</Label>
                <Select value={formOwner} onValueChange={(v: any) => setFormOwner(v)}>
                  <SelectTrigger className="bg-muted/20 border-border/40">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física (PF)</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica (PJ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ativo Status Switch */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="active-status" className="font-semibold">Recorrência Ativa</Label>
                <p className="text-xs text-muted-foreground">Incluir nos cálculos e previsões mensais.</p>
              </div>
              <Switch
                id="active-status"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
                className="data-[state=checked]:bg-pink-600"
              />
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border/40 bg-muted/10 hover:bg-muted/20">
                Cancelar
              </Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white shadow-[0_0_15px_rgba(219,39,119,0.2)]">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border/40 bg-background supports-[backdrop-filter]:bg-background/95 animate-in fade-in zoom-in duration-250">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-pink-500" />
              Confirmar Pagamento
            </DialogTitle>
          </DialogHeader>
          {payingExpense && (
            <form onSubmit={handleConfirmPayment} className="space-y-4 pt-2">
              <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3.5">
                <p className="text-sm font-semibold text-foreground">{payingExpense.name}</p>
                <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                  <span>Valor:</span>
                  <span className="font-bold text-foreground text-sm">{brl(payingExpense.amount)}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                  <span>Proprietário:</span>
                  <span className="font-medium text-foreground">{payingExpense.owner}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="payAccountId">Conta de Pagamento</Label>
                <Select value={payAccountId} onValueChange={setPayAccountId}>
                  <SelectTrigger className="bg-muted/20 border-border/40">
                    <SelectValue placeholder="Selecione a conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAccountsForPayment.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id || ''}>
                        {acc.name} ({brl(acc.balance)})
                      </SelectItem>
                    ))}
                    {filteredAccountsForPayment.length === 0 && (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        Nenhuma conta {payingExpense.owner} encontrada.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="payDate">Data do Pagamento</Label>
                <Input
                  id="payDate"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="bg-muted/20 border-border/40"
                  required
                />
              </div>

              <DialogFooter className="pt-4 border-t border-border/40 gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsPayDialogOpen(false)} className="border-border/40 bg-muted/10 hover:bg-muted/20">
                  Cancelar
                </Button>
                <Button type="submit" disabled={paying || filteredAccountsForPayment.length === 0} className="bg-pink-600 hover:bg-pink-700 text-white shadow-[0_0_15px_rgba(219,39,119,0.2)]">
                  {paying ? 'Registrando...' : 'Confirmar Pagamento'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingExpense} onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}>
        <AlertDialogContent className="border-border/40 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Despesa Recorrente</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente remover a despesa <strong>{deletingExpense?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-border/40">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
