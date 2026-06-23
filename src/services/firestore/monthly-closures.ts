import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { resolveUserHouseholdId } from './users';

import { buildDRE } from "@/core/finance/dre-engine";
import { buildMonthSnapshot } from "@/core/finance/month-closure-engine";
import { getAccountsWithBalance } from "@/services/firestore/accounts";
import { getTaxObligations } from "@/services/firestore/fiscal";
import { getLiabilities } from "@/services/firestore/liabilities";
import { getTransactionsByOwnerAndMonth } from '@/services/firestore/transactions';

export type MonthlyClosureStatus = "OPEN" | "CLOSED" | "REOPENED";

export type MonthlyClosure = {
  id?: string;
  userId?: string;

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
  userId: string,
  owner?: 'PF' | 'PJ'
) {
  if (!userId) return [];
  const constraints: any[] = [where('userId', '==', userId)];
  if (owner) constraints.push(where('owner', '==', owner));

  const q = query(
    collection(db, 'monthly_closures'),
    ...constraints
  );

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as MonthlyClosure[];
}

export async function getMonthlyClosure(
  userId: string,
  owner: 'PF' | 'PJ',
  month: string
) {
  if (!userId) return null;
  const q = query(
    collection(db, 'monthly_closures'),
    where('userId', '==', userId),
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
  userId: string,
  data: MonthlyClosure
) {
  if (!userId) throw new Error("userId required");
  const now = new Date().toISOString();
  const householdId = await resolveUserHouseholdId(userId);

  const existing = await getMonthlyClosure(
    userId,
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
      userId,
      householdId,
      status: 'OPEN',
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

export async function closeMonthlyCompetence(
  userId: string,
  owner: 'PF' | 'PJ',
  month: string
) {
  if (!userId) throw new Error("userId required");
  const existing = await getMonthlyClosure(userId, owner, month);

  if (existing?.status === 'CLOSED') {
    return existing;
  }

  const [transactions, accounts, obligations, liabilities] = await Promise.all([
    getTransactionsByOwnerAndMonth(userId, owner, month),
    getAccountsWithBalance(userId),
    getTaxObligations(),
    getLiabilities(userId),
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
  const previousClosure = await getMonthlyClosure(userId, owner, previousMonth);

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
    userId,
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
    await createMonthlyClosure(userId, closurePayload);
  } else {
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
  }

  // Sincroniza e propaga saldos para meses posteriores fechados
  await propagateClosingBalance(userId, owner, month, closingBalance);

  return getMonthlyClosure(userId, owner, month);
}

export async function propagateClosingBalance(
  userId: string,
  owner: 'PF' | 'PJ',
  startMonth: string,
  newClosingBalance: number
) {
  console.log(`[propagateClosingBalance] Iniciando propagação para ${owner} a partir de ${startMonth} com saldo inicial ${newClosingBalance}`);
  const closures = await getMonthlyClosures(userId, owner);

  const batch = writeBatch(db);
  let currentMonth = startMonth;
  let currentClosing = newClosingBalance;
  let hasUpdates = false;

  while (true) {
    const nextMonthKey = addMonthsToKey(currentMonth, 1);
    const nextClosure = closures.find((c) => c.month === nextMonthKey);

    if (!nextClosure) {
      console.log(`[propagateClosingBalance] Ausência de fechamento posterior cadastrado para ${nextMonthKey}. Parando propagação.`);
      break;
    }

    if (nextClosure.status !== 'CLOSED') {
      console.log(`[propagateClosingBalance] Fechamento posterior ${nextMonthKey} está com status "${nextClosure.status}". Parando propagação.`);
      break;
    }

    if (!nextClosure.id) {
      console.log(`[propagateClosingBalance] Fechamento ${nextMonthKey} não possui ID válido. Parando propagação.`);
      break;
    }

    const openingBalance = Number(currentClosing.toFixed(2));
    const result = Number(nextClosure.cashflow?.result ?? nextClosure.balance ?? 0);
    const closingBalance = Number((openingBalance + result).toFixed(2));

    console.log(`[propagateClosingBalance] Atualizando ${nextMonthKey}: openingBalance=${openingBalance}, result=${result}, closingBalance=${closingBalance}`);

    const ref = doc(db, 'monthly_closures', nextClosure.id);
    batch.update(ref, {
      "cashflow.openingBalance": openingBalance,
      "cashflow.closingBalance": closingBalance,
      updatedAt: new Date().toISOString()
    });

    currentMonth = nextMonthKey;
    currentClosing = closingBalance;
    hasUpdates = true;
  }

  if (hasUpdates) {
    await batch.commit();
    console.log(`[propagateClosingBalance] Propagação em lote executada com sucesso.`);
  } else {
    console.log(`[propagateClosingBalance] Nenhuma atualização necessária.`);
  }
}
