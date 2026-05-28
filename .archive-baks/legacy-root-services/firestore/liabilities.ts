import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Liability } from "@/services/firestore/types";

export type { Liability } from "@/services/firestore/types";

export async function getLiabilities(): Promise<Liability[]> {
  const snapshot = await getDocs(collection(db, "liabilities"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Liability[];
}

export async function addLiability(data: {
  name: string;
  type: "Financiamento" | "Empréstimo" | "Cartão" | "Outro";
  installmentValue: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingBalance: number;
  institution: string;
}) {
  const docRef = await addDoc(collection(db, "liabilities"), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}


export async function upsertLiabilityFromInstallmentTransaction(transaction: any) {
  if (!transaction?.isInstallment) return null;

  const currentInstallment = Number(transaction.installmentCurrent || 0);
  const totalInstallments = Number(transaction.installmentTotal || 0);
  const installmentValue = Math.abs(Number(transaction.amount || 0));

  if (!currentInstallment || !totalInstallments || !installmentValue) {
    return null;
  }

  const installmentKey =
    transaction.installmentKey ||
    String(transaction.description || '')
      .toLowerCase()
      .trim();

  const remainingInstallments = Math.max(totalInstallments - currentInstallment, 0);
  const remainingBalance = Number((remainingInstallments * installmentValue).toFixed(2));

  const institution =
    transaction.financialSource ||
    transaction.importSessionName ||
    'Importação';

  const name = String(transaction.description || installmentKey)
    .replace(/-\s*Parcela\s*\d+\s+de\s+\d+/i, '')
    .replace(/\(?\s*\d+\s*\/\s*\d+\s*\)?/g, '')
    .trim();

  const q = query(
    collection(db, 'liabilities'),
    where('owner', '==', transaction.owner || 'PF'),
    where('installmentKey', '==', installmentKey)
  );

  const snap = await getDocs(q);

  const payload = {
    name,
    type: 'Cartão',
    installmentValue,
    currentInstallment,
    totalInstallments,
    remainingInstallments,
    remainingBalance,
    institution,
    owner: transaction.owner || 'PF',
    competenceMonthKey: transaction.competenceMonthKey || transaction.monthKey || null,
    category: transaction.category || 'Cartão',
    source: 'import',
    status: remainingInstallments > 0 ? 'active' : 'paid',
    installmentKey,
    updatedAt: new Date().toISOString(),
  };

  if (!snap.empty) {
    const existing = snap.docs[0];
    const existingData = existing.data() as any;

    const existingCurrent = Number(existingData.currentInstallment || 0);

    if (existingCurrent > currentInstallment) {
      return existing.id;
    }

    await updateDoc(doc(db, 'liabilities', existing.id), {
      ...payload,
      createdAt: existingData.createdAt,
    });

    return existing.id;
  }

  const docRef = await addDoc(collection(db, 'liabilities'), {
    ...payload,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}
