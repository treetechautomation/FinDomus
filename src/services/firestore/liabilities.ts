import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Liability } from "@/services/firestore/types";

export type { Liability } from "@/services/firestore/types";

export async function getLiabilities(userId: string): Promise<Liability[]> {
  if (!userId) return [];
  const q = query(collection(db, "liabilities"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Liability[];
}

export async function addLiability(userId: string, data: {
  name: string;
  type: "Financiamento" | "Empréstimo" | "Cartão" | "Outro";
  installmentValue: number;
  currentInstallment: number;
  totalInstallments: number;
  remainingBalance: number;
  institution: string;
}) {
  if (!userId) throw new Error("userId required");
  const docRef = await addDoc(collection(db, "liabilities"), {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateLiability(userId: string, liabilityId: string, data: Partial<Liability>) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "liabilities", liabilityId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteLiability(userId: string, liabilityId: string) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "liabilities", liabilityId);
  await deleteDoc(ref);
}

export async function upsertLiabilityFromInstallmentTransaction(userId: string, transaction: any) {
  if (!userId) throw new Error("userId required");
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
    where('userId', '==', userId),
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
    userId,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}
