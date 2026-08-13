"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getTaxObligations } from "@/services/firestore/fiscal";
import { getTransactionsByMonth } from "@/services/firestore/transactions";
import { getAccountsWithBalance, getCompanies } from "@/services/firestore/accounts";
import { buildDRE } from '@/core/finance/dre-engine';
import { useAuth } from "@/providers/auth-provider";
import {
  getMonthlyClosure,
  closeMonthlyCompetence,
  reopenMonth,
} from "@/services/firestore/monthly-closures";
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileEmpresasView } from '@/app/(main)/empresas/mobile-empresas-view';

type EmpresasPageProps = {
  searchParams?: Promise<{
    companyId?: string;
      month?: string;
      page?: string;
  }>;
};

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

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, amount: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

function amountClass(type: string) {
  if (type === "income") return "text-right text-positive";
  if (type === "expense") return "text-right text-negative";
  return "text-right text-muted-foreground";
}

function amountPrefix(type: string) {
  if (type === "income") return "+ ";
  if (type === "expense") return "- ";
  return "↔ ";
}

export default function EmpresasClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [companies, setCompanies] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [monthClosure, setMonthClosure] = useState<any>(null);
  const [closingMonth, setClosingMonth] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadEmpresasData() {
      if (!user?.uid) return;

      try {
        const [
          companiesResult,
          accountsResult,
          obligationsResult,
        ] = await Promise.all([
          getCompanies(user.uid),
          getAccountsWithBalance(user.uid),
          getTaxObligations(user.uid),
        ]);

        setCompanies(companiesResult || []);
        setAccounts(accountsResult || []);
        setObligations(obligationsResult || []);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEmpresasData();
  }, [user?.uid, refreshTrigger]);

  const resolvedSearchParams = {
    companyId: searchParams.get('companyId') || undefined,
    month: searchParams.get('month') || undefined,
    page: searchParams.get('page') || undefined,
  };

  const selectedMonthDate = resolvedSearchParams.month
    ? new Date(`${resolvedSearchParams.month}-01T00:00:00`)
    : new Date();

  // TODO: unificar tipos de data com as helpers do financial-period-engine
  const selectedMonth = monthKey(selectedMonthDate);
  const prevMonth = monthKey(addMonths(selectedMonthDate, -1));
  const nextMonth = monthKey(addMonths(selectedMonthDate, 1));
  const monthLabel = selectedMonthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  useEffect(() => {
    async function loadSelectedMonthClosure() {
      if (!user?.uid) return;
      const result = await getMonthlyClosure(user.uid, "PJ", selectedMonth);
      setMonthClosure(result);
    }

    async function loadTransactions() {
      if (!user?.uid) return;
      const result = await getTransactionsByMonth(user.uid, 'PJ', selectedMonth);
      setTransactions(result || []);
    }

    loadSelectedMonthClosure();
    loadTransactions();
  }, [selectedMonth, user?.uid, refreshTrigger]);

  const selectedCompanyId = resolvedSearchParams.companyId ?? companies[0]?.id ?? "";
  const selectedCompany = companies.find((company: any) => company.id === selectedCompanyId);

    async function handleCloseMonth() {
      if (!user?.uid) return;
      try {
        setClosingMonth(true);
        const result = await closeMonthlyCompetence(user.uid, "PJ", selectedMonth);
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
        const result = await getMonthlyClosure(user.uid, "PJ", selectedMonth);
        setMonthClosure(result);
      } finally {
        setClosingMonth(false);
      }
    }


  const companyAccounts = accounts.filter((account: any) => account.companyId === selectedCompanyId);

  const allCompanyTransactions = transactions.filter((transaction: any) => transaction.companyId === selectedCompanyId);

    const companyTransactions = allCompanyTransactions
      .filter((transaction: any) => {
        return (transaction.competenceMonthKey || transaction.monthKey) === selectedMonth;
      })
    .sort((a: any, b: any) => {
      const da = parseDate(a.date || a.createdAt)?.getTime() || 0;
      const db = parseDate(b.date || b.createdAt)?.getTime() || 0;
      return db - da;
    });

  const pageSize = 8;
  const currentPage = Math.max(1, Number(resolvedSearchParams.page || 1));
  const totalPages = Math.max(1, Math.ceil(companyTransactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTransactions = companyTransactions.slice((safePage - 1) * pageSize, safePage * pageSize);

  const companyObligations = obligations.filter((item: any) => item.companyId === selectedCompanyId);

  const accountBalance = companyAccounts.reduce(
    (sum: number, account: any) => sum + Number(account.balance || 0),
    0
  );


    const closedSnapshot = monthClosure?.status === "CLOSED"
      ? monthClosure?.snapshot
      : null;

    const snapshotDRE = closedSnapshot?.dre || null;
    const dre = snapshotDRE ?? buildDRE(companyTransactions);

    const {
      receitaBruta: dreReceitaBruta,
      impostos: dreImpostos,
      receitaLiquida: dreReceitaLiquida,
      despesas: dreDespesasOperacionais,
      lucroOperacional: dreLucroOperacional,
      lucroLiquido: dreLucroLiquido,
    } = dre;

    const dreResultadoFinanceiro = 0;
    const dreMargemLiquida = dreReceitaBruta > 0 ? (dreLucroLiquido / dreReceitaBruta) * 100 : 0;

    const revenue = closedSnapshot?.kpis?.income ?? (dreReceitaBruta + dreResultadoFinanceiro);
    const expenses = closedSnapshot?.kpis?.expenses ?? (dreImpostos + dreDespesasOperacionais);

    const pendingTaxes = companyObligations
      .filter((item: any) => item.status === "pending")
      .reduce((sum: number, item: any) => sum + Number(item.value || 0), 0);

    function isInternalBankMovement(transaction: any) {
      const description = String(transaction.description || "").toLowerCase();

      return (
        description.includes("aplicação conta remunerada") ||
        description.includes("aplicacao conta remunerada") ||
        description.includes("resgate conta remunerada") ||
        description.includes("crédito na conta corrente") ||
        description.includes("credito na conta corrente") ||
        description.includes("débito na conta corrente") ||
        description.includes("debito na conta corrente")
      );
    }

    function isCashOutflow(transaction: any) {
      const description = String(transaction.description || "").toLowerCase();

      if (isInternalBankMovement(transaction)) return false;

      return (
        transaction.type === "expense" ||
        description.includes("pix enviado para anderson")
      );
    }

    const closedCashflow = monthClosure?.status === "CLOSED"
      ? monthClosure?.cashflow
      : null;

    const liveCashInflow = companyTransactions
      .filter((transaction: any) => transaction.type === "income")
      .filter((transaction: any) => !isInternalBankMovement(transaction))
      .reduce((sum: number, transaction: any) => sum + Math.abs(Number(transaction.amount || 0)), 0);

    const liveCashOutflow = companyTransactions
      .filter((transaction: any) => isCashOutflow(transaction))
      .reduce((sum: number, transaction: any) => sum + Math.abs(Number(transaction.amount || 0)), 0);

    const liveCashResult = liveCashInflow - liveCashOutflow;

    const cashInflow = closedCashflow?.inflow ?? liveCashInflow;
    const cashOutflow = closedCashflow?.outflow ?? liveCashOutflow;
    const cashResult = closedCashflow?.result ?? liveCashResult;
    const openingBalance = closedCashflow?.openingBalance ?? accountBalance - liveCashResult;
    const closingBalance = closedCashflow?.closingBalance ?? accountBalance;

  const viewProps = {
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
  };

  if (isMobile) {
    return (
      <MobileEmpresasView
        {...viewProps}
      />
    );
  }

  return (
    <MobileEmpresasView
      {...viewProps}
    />
  );
}
