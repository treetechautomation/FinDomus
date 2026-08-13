"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, ArrowUp, ArrowDown, Banknote, FileText, Calendar, ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react";
import { StatCard } from "@/components/overview/stat-card";
import { formatCurrencyBRL } from '@/lib/utils';
import { NewCompanyDialog } from "@/components/empresas/new-company-dialog";
import { CompanyFilter } from "@/components/empresas/company-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const money = formatCurrencyBRL;

function parseDate(value?: string) {
  if (!value) return null;

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const [, dd, mm, yyyy] = br;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value?: string) {
  const d = parseDate(value);
  return d ? d.toLocaleDateString("pt-BR") : "-";
}

export interface MobileEmpresasViewProps {
  loading: boolean;
  companies: any[];
  selectedCompanyId: string;
  selectedCompany: any;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  openingBalance: number;
  cashInflow: number;
  cashOutflow: number;
  cashResult: number;
  closingBalance: number;
  companyAccounts: any[];
  monthLabel: string;
  prevMonth: string;
  nextMonth: string;
  selectedMonth: string;
  monthClosure: any;
  closingMonth: boolean;
  handleCloseMonth: () => void | Promise<void>;
  handleReopenMonth: () => void | Promise<void>;
  safePage: number;
  totalPages: number;
  paginatedTransactions: any[];
  companyTransactions: any[];
  companyObligations: any[];
  pendingTaxes: number;
}

export function MobileEmpresasView({
  loading,
  companies,
  selectedCompanyId,
  selectedCompany,
  setRefreshTrigger,
  openingBalance,
  cashInflow,
  cashOutflow,
  cashResult,
  closingBalance,
  companyAccounts,
  monthLabel,
  prevMonth,
  nextMonth,
  selectedMonth,
  monthClosure,
  closingMonth,
  handleCloseMonth,
  handleReopenMonth,
  safePage,
  totalPages,
  paginatedTransactions,
  companyTransactions,
  companyObligations,
  pendingTaxes,
}: MobileEmpresasViewProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Empresas
        </h1>

        <div className="rounded-xl border bg-card p-6 text-muted-foreground">
          Carregando módulo empresarial...
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Empresas</h1>
        <Card className="border-zinc-900 bg-zinc-950/20 rounded-3xl p-6">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-zinc-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Nenhuma empresa cadastrada</h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">
              Cadastre sua primeira empresa para gerenciar contas PJ, extratos, DRE e obrigações fiscais.
            </p>
            <NewCompanyDialog onSuccess={() => setRefreshTrigger(k => k + 1)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Módulo Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedCompany ? `Gestão financeira da empresa ${selectedCompany.name}.` : "Cadastre uma empresa para começar."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {companies.length > 0 && (
            <div id="tour-step-empresas-selector">
              <CompanyFilter companies={companies} selectedCompanyId={selectedCompanyId} />
            </div>
          )}
          <NewCompanyDialog onSuccess={() => setRefreshTrigger(k => k + 1)} />
        </div>
      </div>

        <div id="tour-step-empresas-stats" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Saldo Inicial" value={money(openingBalance)} icon={Banknote} />
          <StatCard title="Entradas do Mês" value={money(cashInflow)} icon={ArrowUp} variant="positive" />
          <StatCard title="Saídas do Mês" value={money(cashOutflow)} icon={ArrowDown} variant="negative" />
          <StatCard title="Resultado do Mês" value={money(cashResult)} icon={FileText} variant={cashResult >= 0 ? "positive" : "negative"} />
          <StatCard title="Saldo Final" value={money(closingBalance)} icon={Banknote} />
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card id="tour-step-empresas-contas">
          <CardHeader>
            <CardTitle>Contas da Empresa</CardTitle>
            <CardDescription>Contas PJ vinculadas à empresa selecionada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {companyAccounts.map((account: any) => (
              <div key={account.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground">{account.type}</div>
                </div>
                <div className="font-semibold">{money(account.balance)}</div>
              </div>
            ))}

            {companyAccounts.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhuma conta PJ vinculada a esta empresa.
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="tour-step-empresas-extrato" className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Extrato PJ</CardTitle>
                  <CardDescription>Movimentações reais de {monthLabel}.</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/empresas?companyId=${selectedCompanyId}&month=${prevMonth}`}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="min-w-36 text-center text-sm font-semibold capitalize">
                    {monthLabel}
                  </div>

                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/empresas?companyId=${selectedCompanyId}&month=${nextMonth}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                <div>
                  <div className="text-sm font-medium">Status da Competência</div>
                  <div className="text-xs text-muted-foreground">
                    {monthClosure?.status === "CLOSED"
                      ? "Competência fechada. Lançamentos bloqueados."
                      : "Competência aberta para lançamentos."}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={monthClosure?.status === "CLOSED" ? "destructive" : "default"}>
                    {monthClosure?.status === "CLOSED" ? "CLOSED" : "OPEN"}
                  </Badge>

                  {monthClosure?.status === "CLOSED" ? (
                    <Button size="sm" variant="outline" onClick={handleReopenMonth} disabled={closingMonth}>
                      Reabrir
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleCloseMonth} disabled={closingMonth}>
                      Fechar Mês
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" asChild={safePage > 1}>
                  {safePage > 1 ? (
                    <Link href={`/empresas?companyId=${selectedCompanyId}&month=${selectedMonth}&page=${safePage - 1}`}>
                      ← Anterior
                    </Link>
                  ) : (
                    <span>← Anterior</span>
                  )}
                </Button>

                <span className="text-sm font-medium text-muted-foreground">
                  Página {safePage} de {totalPages}
                </span>

                <Button variant="outline" size="sm" asChild={safePage < totalPages}>
                  {safePage < totalPages ? (
                    <Link href={`/empresas?companyId=${selectedCompanyId}&month=${selectedMonth}&page=${safePage + 1}`}>
                      Próxima →
                    </Link>
                  ) : (
                    <span>Próxima →</span>
                  )}
                </Button>
              </div>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "transfer" ? (
                            <ArrowLeftRight className="h-5 w-5 text-yellow-400" />
                          ) : transaction.type === "income" ? (
                            <ArrowUp className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <ArrowDown className="h-5 w-5 text-red-400" />
                          )}
                          <span className="font-medium">{transaction.description}</span>
                        </div>
                      </TableCell>
                    <TableCell>{transaction.category ?? "-"}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className={transaction.type === "income" ? "text-right text-positive" : "text-right text-negative"}>
                      {transaction.type === "income" ? "+" : "-"} {money(Math.abs(Number(transaction.amount || 0)))}
                    </TableCell>
                  </TableRow>
                ))}

                {companyTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum lançamento PJ para esta empresa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card id="tour-step-empresas-fiscal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Obrigações Fiscais da Empresa
          </CardTitle>
          <CardDescription>
            Pendências fiscais em aberto: {money(pendingTaxes)}
            <Link href="/fiscal-contabil" className="ml-2 text-cyan-400 text-xs hover:underline">
              Gerenciar obrigações →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {companyObligations.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">Vence em: {formatDate(item.dueDate)}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.status === "pending" ? "destructive" : "default"}>
                  {item.status === "pending" ? "Pendente" : "Pago"}
                </Badge>
                <div className="font-semibold">{money(item.value)}</div>
              </div>
            </div>
          ))}

          {companyObligations.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Nenhuma obrigação fiscal vinculada a esta empresa.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
