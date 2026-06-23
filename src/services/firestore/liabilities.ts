import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { assertMonthOpen } from "@/services/firestore/month-guard";
import type { Liability, LiabilityPayment } from "@/services/firestore/types";
import { resolveUserHouseholdId } from "./users";

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
  const householdId = await resolveUserHouseholdId(userId);
  const docRef = await addDoc(collection(db, "liabilities"), {
    ...data,
    userId,
    householdId,
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

  let liabilityId = '';

  if (!snap.empty) {
    const existing = snap.docs[0];
    const existingData = existing.data() as any;

    const existingCurrent = Number(existingData.currentInstallment || 0);

    if (existingCurrent <= currentInstallment) {
      await updateDoc(doc(db, 'liabilities', existing.id), {
        ...payload,
        createdAt: existingData.createdAt,
      });
    }
    liabilityId = existing.id;
  } else {
    const householdId = await resolveUserHouseholdId(userId);
    const docRef = await addDoc(collection(db, 'liabilities'), {
      ...payload,
      userId,
      householdId,
      createdAt: new Date().toISOString(),
    });
    liabilityId = docRef.id;
  }

  if (liabilityId && transaction.id) {
    const payment: LiabilityPayment = {
      liabilityId,
      userId,
      owner: transaction.owner || 'PF',
      transactionId: transaction.id,
      installmentNumber: currentInstallment,
      totalInstallments: totalInstallments,
      amount: installmentValue,
      principalAmount: installmentValue,
      interestAmount: 0,
      competenceMonthKey: transaction.competenceMonthKey || transaction.monthKey || '',
      paidAt: transaction.date || new Date().toISOString(),
      status: 'paid',
    };

    await addLiabilityPayment(userId, payment);
  }

  return liabilityId;
}

export async function addLiabilityPayment(userId: string, payment: LiabilityPayment) {
  if (!userId) throw new Error("userId required");
  await assertMonthOpen(userId, payment.owner, payment.competenceMonthKey);

  const now = new Date().toISOString();
  const paymentDocRef = doc(
    db,
    "liabilities",
    payment.liabilityId,
    "payments",
    String(payment.installmentNumber)
  );

  const payload = {
    ...payment,
    userId,
    status: "paid" as const,
    createdAt: payment.createdAt || now,
    updatedAt: now,
  };

  await setDoc(paymentDocRef, payload);

  // Atualiza o passivo pai
  const remainingInstallments = Math.max(payment.totalInstallments - payment.installmentNumber, 0);
  const remainingBalance = Number((remainingInstallments * payment.amount).toFixed(2));

  const liabilityRef = doc(db, "liabilities", payment.liabilityId);
  await updateDoc(liabilityRef, {
    currentInstallment: payment.installmentNumber,
    remainingInstallments,
    remainingBalance,
    status: remainingInstallments > 0 ? "active" : "paid",
    updatedAt: now,
  });
}

export async function reverseLiabilityPayment(
  userId: string,
  liabilityId: string,
  installmentNumber: number
) {
  if (!userId) throw new Error("userId required");

  const paymentRef = doc(db, "liabilities", liabilityId, "payments", String(installmentNumber));
  const paymentSnap = await getDoc(paymentRef);

  if (!paymentSnap.exists()) {
    return;
  }

  const paymentData = paymentSnap.data() as LiabilityPayment;

  // Trava de segurança
  await assertMonthOpen(userId, paymentData.owner, paymentData.competenceMonthKey);

  const now = new Date().toISOString();

  // Atualiza o status do pagamento para "reversed"
  await updateDoc(paymentRef, {
    status: "reversed",
    updatedAt: now
  });

  // Ajusta o passivo pai (estorno do saldo devedor)
  const liabilityRef = doc(db, "liabilities", liabilityId);
  const liabilitySnap = await getDoc(liabilityRef);

  if (liabilitySnap.exists()) {
    const liabilityData = liabilitySnap.data() as any;

    const isLatest = Number(liabilityData.currentInstallment || 0) === installmentNumber;
    const newCurrent = isLatest ? Math.max(installmentNumber - 1, 0) : Number(liabilityData.currentInstallment || 0);

    const remainingInstallments = Math.max(Number(liabilityData.totalInstallments || 0) - newCurrent, 0);
    const liabilityValue = Number(liabilityData.installmentValue || 0) || Number(paymentData.amount || 0);
    const remainingBalance = Number((remainingInstallments * liabilityValue).toFixed(2));

    await updateDoc(liabilityRef, {
      currentInstallment: newCurrent,
      remainingInstallments,
      remainingBalance,
      status: remainingInstallments > 0 ? "active" : "paid",
      updatedAt: now
    });
  }
}

export async function reverseLiabilityPaymentByTransactionId(userId: string, transactionId: string) {
  if (!userId || !transactionId) return;

  const liabilities = await getLiabilities(userId);
  for (const liab of liabilities) {
    if (!liab.id) continue;
    const q = query(
      collection(db, "liabilities", liab.id, "payments"),
      where("transactionId", "==", transactionId),
      where("status", "==", "paid")
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      for (const docSnap of snap.docs) {
        const paymentData = docSnap.data() as LiabilityPayment;
        await reverseLiabilityPayment(userId, liab.id, paymentData.installmentNumber);
      }
    }
  }
}
