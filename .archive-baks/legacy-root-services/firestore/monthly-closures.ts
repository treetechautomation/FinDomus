import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { buildDRE } from "@/core/finance/dre-engine";
import { buildMonthSnapshot } from "@/core/finance/month-closure-engine";
import { getAccountsWithBalance } from "@/services/firestore/accounts";
import { getTaxObligations } from "@/services/firestore/fiscal";
import { getLiabilities } from "@/services/firestore/liabilities";
export type MonthlyClosureStatus = "OPEN" | "CLOSED" | "REOPENED";

export type MonthlyClosure = {
  id?: string;

  owner: "PF" | "PJ";
  month: string;

  income: number;
  expenses: number;
  balance: number;

    cashflow?: {
      openingBalance: number;
      inflow: number;
      outflow: number;
      result: number;
      closingBalance: number;
    };
  dre?: any;
  snapshot?: any;

  transactionsCount: number;

  status: MonthlyClosureStatus;

  frozenAt?: string;
  reopenedAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

export async function getMonthlyClosures(
  owner?: 'PF' | 'PJ'
) {
  const q = owner
    ? query(
        collection(db, 'monthly_closures'),
        where('owner', '==', owner)
      )
    : collection(db, 'monthly_closures');

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as MonthlyClosure[];
}

export async function getMonthlyClosure(
  owner: 'PF' | 'PJ',
  month: string
) {
  const q = query(
    collection(db, 'monthly_closures'),
    where('owner', '==', owner),
    where('month', '==', month)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  } as MonthlyClosure;
}

export async function createMonthlyClosure(
  data: MonthlyClosure
) {
  const now = new Date().toISOString();

  const existing = await getMonthlyClosure(
    data.owner,
    data.month
  );

  if (existing) {
    return existing.id;
  }

  const docRef = await addDoc(
    collection(db, 'monthly_closures'),
    {
      ...data,
      status: data.status || 'OPEN',
      createdAt: now,
      updatedAt: now,
    }
  );

  return docRef.id;
}

export async function closeMonth(
  id: string
) {
  await updateDoc(
    doc(db, 'monthly_closures', id),
    {
      status: 'CLOSED',
      frozenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function reopenMonth(
  id: string
) {
  await updateDoc(
    doc(db, 'monthly_closures', id),
    {
      status: 'REOPENED',
      reopenedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

function addMonthsToKey(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function isInternalBankMovement(transaction: any) {
  const description = String(
    transaction.description || ""
  ).toLowerCase();

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
  const description = String(
    transaction.description || ""
  ).toLowerCase();

  if (isInternalBankMovement(transaction)) {
    return false;
  }

  return (
    transaction.type === "expense" ||
    description.includes("pix enviado para anderson")
  );
}

import { getTransactions } from '@/services/firestore/transactions';

export async function closeMonthlyCompetence(
  owner: 'PF' | 'PJ',
  month: string
) {
  const existing = await getMonthlyClosure(owner, month);

  if (existing?.status === 'CLOSED') {
    return existing;
  }

  const [transactions, accounts, obligations, liabilities] = await Promise.all([
    getTransactions(),
    getAccountsWithBalance(),
    getTaxObligations(),
    getLiabilities(),
  ]);

  const monthTransactions = transactions.filter((t: any) => {
    return (
      t.owner === owner &&
      (t.competenceMonthKey || t.monthKey) === month
    );
  });

  const income = monthTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => {
      return sum + Number(t.amount || 0);
    }, 0);

  const expenses = monthTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => {
      return sum + Math.abs(Number(t.amount || 0));
    }, 0);

  const balance = income - expenses;

  const previousMonth = addMonthsToKey(month, -1);
  const previousClosure = await getMonthlyClosure(owner, previousMonth);

  const closingAccountBalance =
    accounts
      .filter((account: any) => account.owner === owner)
      .reduce((sum: number, account: any) => sum + Number(account.balance || 0), 0);

  const openingBalance =
    previousClosure?.cashflow?.closingBalance ??
    Number((closingAccountBalance - balance).toFixed(2));

  const closingBalance = Number((openingBalance + balance).toFixed(2));

  const cashflow = {
    openingBalance: Number(openingBalance.toFixed(2)),
    inflow: Number(income.toFixed(2)),
    outflow: Number(expenses.toFixed(2)),
    result: Number(balance.toFixed(2)),
    closingBalance,
  };

  const dre =
    owner === 'PJ'
      ? buildDRE(monthTransactions)
      : undefined;

  const snapshot = buildMonthSnapshot({
    monthKey: month,
    transactions: monthTransactions,
    liabilities: liabilities.filter((l: any) => l.owner === owner),
    taxObligations: obligations.filter((o: any) => o.owner === owner),
  });

  const closurePayload: MonthlyClosure = {
    owner,
    month,
    income,
    expenses,
    balance,
    cashflow,
    snapshot,
    transactionsCount: monthTransactions.length,
    status: 'CLOSED',
    frozenAt: new Date().toISOString(),
    ...(dre ? { dre } : {}),
  };


  if (!existing) {
    await createMonthlyClosure(closurePayload);

    return getMonthlyClosure(owner, month);
  }

  await updateDoc(
    doc(db, 'monthly_closures', existing.id!),
    {
      income,
      expenses,
      balance,
        cashflow,
      snapshot,
      ...(dre ? { dre } : {}),
      transactionsCount: monthTransactions.length,
      status: 'CLOSED',
      frozenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  return getMonthlyClosure(owner, month);
}
