import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { assertMonthOpen } from "@/services/firestore/month-guard";
import type { Liability, LiabilityPayment } from "@/services/firestore/types";
import { resolveUserHouseholdId } from "./users";
import { financialEvents } from "@/core/finance/events";

export type { Liability } from "@/services/firestore/types";

/**
 * P30B.2: Derives a deterministic document ID for automatic installment liabilities.
 * Scoped by userId, owner (PF/PJ), and normalized installmentKey.
 * Eliminates query-then-addDoc race condition by ensuring concurrent callers
 * target the exact same Firestore document reference.
 */
export function computeAutoLiabilityId(userId: string, owner: string, installmentKey: string): string {
  const normUser = String(userId || '').trim();
  const normOwner = String(owner || 'PF').trim().toUpperCase();
  const normKey = String(installmentKey || '').trim().toLowerCase();
  const base = `${normUser}|${normOwner}|${normKey}`;

  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < base.length; i++) {
    const code = base.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 = Math.imul(h2 ^ code, 0x5bd1e995);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');

  const safeSlug = normKey.replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 24);
  return `autoliab_${safeSlug}_${hex1}${hex2}`;
}

/**
 * P30B.2: Resolves the upsert target ID ensuring historical compatibility:
 * 1. If deterministic auto doc already exists, reuse it.
 * 2. If exactly one historical random-ID doc exists, reuse it to prevent duplicates.
 * 3. If multiple historical docs exist, fail closed with explicit consistency error.
 * 4. If neither exists, target the deterministic ID.
 */
export function resolveLiabilityUpsertTarget(
  autoDocExists: boolean,
  autoId: string,
  legacyDocs: Array<{ id: string }>
): { targetId: string; isHistorical: boolean } {
  if (autoDocExists) {
    return { targetId: autoId, isHistorical: false };
  }
  if (legacyDocs.length > 1) {
    throw new Error(
      `[upsertLiabilityFromInstallmentTransaction] Inconsistência de dados: múltiplos passivos históricos (${legacyDocs.length}) encontrados.`
    );
  }
  if (legacyDocs.length === 1) {
    return { targetId: legacyDocs[0].id, isHistorical: true };
  }
  return { targetId: autoId, isHistorical: false };
}

/**
 * P30B.2: Monotonic parent progression helper.
 * Guarantees that:
 * - currentInstallment never decreases.
 * - remainingInstallments / remainingBalance never increase due to an older installment.
 * - status never regresses from 'paid' or 'renegotiated' to 'active'.
 */
export function calculateParentLiabilityProgression(
  existingParent: any,
  payment: { installmentNumber: number; totalInstallments: number; amount: number }
): { shouldUpdate: boolean; updates?: Record<string, any> } {
  if (!existingParent) {
    const remainingInstallments = Math.max(payment.totalInstallments - payment.installmentNumber, 0);
    const remainingBalance = Number((remainingInstallments * payment.amount).toFixed(2));
    return {
      shouldUpdate: true,
      updates: {
        currentInstallment: payment.installmentNumber,
        remainingInstallments,
        remainingBalance,
        status: remainingInstallments > 0 ? 'active' : 'paid',
      },
    };
  }

  const lCurrent = Number(existingParent.currentInstallment || 0);
  if (payment.installmentNumber < lCurrent) {
    // Monotonic invariant: older installment arriving later MUST NOT regress parent progression
    return { shouldUpdate: false };
  }

  const remainingInstallments = Math.max(payment.totalInstallments - payment.installmentNumber, 0);
  const remainingBalance = Number((remainingInstallments * payment.amount).toFixed(2));

  let targetStatus: 'active' | 'paid' | 'renegotiated' = remainingInstallments > 0 ? 'active' : 'paid';
  if (existingParent.status === 'paid' || existingParent.status === 'renegotiated') {
    targetStatus = existingParent.status;
  }

  return {
    shouldUpdate: true,
    updates: {
      currentInstallment: payment.installmentNumber,
      remainingInstallments,
      remainingBalance,
      status: targetStatus,
    },
  };
}

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
  remainingInstallments?: number;
  remainingBalance: number;
  institution: string;
  owner?: "PF" | "PJ";
  competenceMonthKey?: string | null;
  category?: string;
  source?: string;
}) {
  if (!userId) throw new Error("userId required");
  const householdId = await resolveUserHouseholdId(userId);

  const docRef = await addDoc(collection(db, "liabilities"), {
    ...data,
    userId,
    householdId,
    owner: data.owner || "PF",
    competenceMonthKey: data.competenceMonthKey || null,
    source: data.source || "manual",
    status: (data.remainingInstallments ?? (data.totalInstallments - data.currentInstallment)) > 0 ? "active" : "paid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  financialEvents.emit({
    type: "liability:created",
    payload: { liabilityId: docRef.id },
    timestamp: new Date().toISOString(),
    source: "addLiability",
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

  financialEvents.emit({
    type: "liability:updated",
    payload: { liabilityId },
    timestamp: new Date().toISOString(),
    source: "updateLiability",
  });
}

export async function deleteLiability(userId: string, liabilityId: string) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "liabilities", liabilityId);
  await deleteDoc(ref);

  financialEvents.emit({
    type: "liability:deleted",
    payload: { liabilityId },
    timestamp: new Date().toISOString(),
    source: "deleteLiability",
  });
}

export function shouldUpsertLiabilityFromTransaction(transaction: any): boolean {
  if (!transaction) return false;
  if (transaction.isRefund === true) return false;
  if (!transaction.isInstallment) return false;

  const currentInstallment = Number(transaction.installmentCurrent || 0);
  const totalInstallments = Number(transaction.installmentTotal || 0);
  const installmentValue = Math.abs(Number(transaction.amount || 0));

  if (!currentInstallment || !totalInstallments || !installmentValue) {
    return false;
  }

  return true;
}

export async function upsertLiabilityFromInstallmentTransaction(userId: string, transaction: any) {
  if (!userId) throw new Error("userId required");
  if (!shouldUpsertLiabilityFromTransaction(transaction)) return null;

  const currentInstallment = Number(transaction.installmentCurrent || 0);
  const totalInstallments = Number(transaction.installmentTotal || 0);
  const installmentValue = Math.abs(Number(transaction.amount || 0));

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

  const owner = transaction.owner || 'PF';
  const autoLiabilityId = computeAutoLiabilityId(userId, owner, installmentKey);
  const autoRef = doc(db, 'liabilities', autoLiabilityId);

  // 1. Check deterministic target first
  const autoSnap = await getDoc(autoRef);

  let legacyDocs: Array<{ id: string }> = [];
  if (!autoSnap.exists()) {
    // 2. Query legacy historical liabilities only if deterministic target does not exist
    const legacyQuery = query(
      collection(db, 'liabilities'),
      where('userId', '==', userId),
      where('owner', '==', owner),
      where('installmentKey', '==', installmentKey)
    );
    const legacySnap = await getDocs(legacyQuery);
    legacyDocs = legacySnap.docs.map((d) => ({ id: d.id }));
  }

  const { targetId } = resolveLiabilityUpsertTarget(autoSnap.exists(), autoLiabilityId, legacyDocs);
  const targetRef = doc(db, 'liabilities', targetId);

  const now = new Date().toISOString();
  const payload = {
    name,
    type: 'Cartão' as const,
    installmentValue,
    currentInstallment,
    totalInstallments,
    remainingInstallments,
    remainingBalance,
    institution,
    owner,
    competenceMonthKey: transaction.competenceMonthKey || transaction.monthKey || null,
    category: transaction.category || 'Cartão',
    source: 'import',
    status: remainingInstallments > 0 ? ('active' as const) : ('paid' as const),
    installmentKey,
    updatedAt: now,
  };

  const householdId = await resolveUserHouseholdId(userId);

  // 3. Concurrency-safe atomic upsert on targetRef using runTransaction
  await runTransaction(db, async (tx) => {
    const existingSnap = await tx.get(targetRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as any;
      const existingCurrent = Number(existingData.currentInstallment || 0);

      if (existingCurrent <= currentInstallment) {
        tx.update(targetRef, {
          ...payload,
          createdAt: existingData.createdAt || now,
        });
      }
    } else {
      tx.set(targetRef, {
        ...payload,
        id: targetId,
        userId,
        householdId,
        createdAt: now,
      });
    }
  });

  const liabilityId = targetId;

  if (liabilityId && transaction.id) {
    const payment: LiabilityPayment = {
      liabilityId,
      userId,
      owner,
      transactionId: transaction.id,
      installmentNumber: currentInstallment,
      totalInstallments,
      amount: installmentValue,
      principalAmount: installmentValue,
      interestAmount: 0,
      competenceMonthKey: transaction.competenceMonthKey || transaction.monthKey || '',
      paidAt: transaction.date || now,
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

  const paymentPayload = {
    ...payment,
    userId,
    status: "paid" as const,
    createdAt: payment.createdAt || now,
    updatedAt: now,
  };

  const liabilityRef = doc(db, "liabilities", payment.liabilityId);

  await runTransaction(db, async (tx) => {
    const liabilitySnap = await tx.get(liabilityRef);

    // 1. Atomically write payment document (deterministic key)
    tx.set(paymentDocRef, paymentPayload, { merge: true });

    // 2. Monotonically update parent progression
    if (liabilitySnap.exists()) {
      const lData = liabilitySnap.data() as any;
      const progression = calculateParentLiabilityProgression(lData, payment);
      if (progression.shouldUpdate && progression.updates) {
        tx.update(liabilityRef, {
          ...progression.updates,
          updatedAt: now,
        });
      }
    } else {
      const progression = calculateParentLiabilityProgression(null, payment);
      if (progression.shouldUpdate && progression.updates) {
        tx.update(liabilityRef, {
          ...progression.updates,
          updatedAt: now,
        });
      }
    }
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
