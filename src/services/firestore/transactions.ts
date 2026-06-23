import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  limit,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { generateMonthlySummary } from '@/services/firestore';
import { normalizeTransactionDate } from '@/core/date/normalize-transaction-date';
import { assertMonthOpen } from "@/services/firestore/month-guard";
import { upsertLiabilityFromInstallmentTransaction, reverseLiabilityPaymentByTransactionId } from "@/services/firestore/liabilities";
import { resolveUserHouseholdId } from './users';

export type TransactionDTO = {
  id?: string;
  userId?: string;
  householdId?: string | null;
  accountId?: string;
  companyId?: string | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  fromAccountId?: string;
  toAccountId?: string;
  category?: string;
  description: string;
  date?: string;
  dateISO?: string;
  monthKey?: string;
  competenceMonthKey?: string;
  owner: 'PF' | 'PJ';
  merchant?: string;
    financialSource?: string;
    financialSourceType?: string;
  importHash?: string;
    externalId?: string;
    importSessionName?: string;
    isInstallment?: boolean;
    installmentKey?: string;
    installmentCurrent?: number | null;
    installmentTotal?: number | null;
    remainingInstallments?: number | null;
  transferPairId?: string;
  transferConfidence?: string;
  transferReviewStatus?: 'accepted' | 'ignored' | 'pending';
  transferReviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeHashText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

  export function generateImportHash(data: {
    date?: string;
    amount: number;
    description: string;
    merchant?: string;
    owner?: 'PF' | 'PJ';
    externalId?: string;
  }) {
      const base = data.externalId
        ? [
            data.owner || 'PF',
            'external',
            normalizeHashText(data.externalId),
            data.date || '' ,
            Number(data.amount || 0).toFixed(2),
            normalizeHashText(data.description),
            normalizeHashText(data.merchant || ''),
          ].join('|')
        : [
            data.owner || 'PF',
            data.date || '' ,
            Number(data.amount || 0).toFixed(2),
            normalizeHashText(data.description),
            normalizeHashText(data.merchant || ''),
          ].join('|');

    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = (hash << 5) - hash + base.charCodeAt(i);
      hash |= 0;
    }

    return `imp_${Math.abs(hash)}`;
  }

export async function getTransactions(userId: string): Promise<TransactionDTO[]> {
  if (!userId) return [];
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data() as Partial<TransactionDTO>;

    return {
      id: doc.id,
      ...data,
      type: data.type || 'expense',
      amount: Number(data.amount || 0),
      description: data.description || '',
      owner: data.owner || 'PF',
      companyId: data.companyId ?? null,
      competenceMonthKey: data.competenceMonthKey || data.monthKey,
    } as TransactionDTO;
  });
}

export async function getPersonalTransactions(userId: string) {
  const data = await getTransactions(userId);
  return data.filter((item) => item.owner === 'PF');
}

export async function addTransaction(userId: string, data: TransactionDTO) {
  if (!userId) throw new Error("userId required");
  const now = new Date().toISOString();
  const householdId = await resolveUserHouseholdId(userId);

  const normalizedDate = normalizeTransactionDate(data.date ?? now);

  const normalized: TransactionDTO = {
    ...data,
    userId,
    householdId,
    ...normalizedDate,
    competenceMonthKey: data.competenceMonthKey ?? normalizedDate.monthKey,
    companyId: data.companyId ?? null,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
    merchant: data.merchant ?? '',
    importHash: data.importHash ?? generateImportHash({
      ...data,
      date: normalizedDate.dateISO || normalizedDate.date,
    }),
  };

  await assertMonthOpen(
    userId,
    normalized.owner,
    normalized.competenceMonthKey || normalized.monthKey
  );

  const docRef = await addDoc(collection(db, 'transactions'), normalized);

  if (
    normalized.isInstallment === true &&
    normalized.installmentCurrent !== null && normalized.installmentCurrent !== undefined &&
    normalized.installmentTotal !== null && normalized.installmentTotal !== undefined &&
    normalized.installmentKey
  ) {
    try {
      await upsertLiabilityFromInstallmentTransaction(userId, {
        ...normalized,
        id: docRef.id,
      });
    } catch (err) {
      console.error("[addTransaction] Falha ao atualizar passivo automático do lançamento:", err);
    }
  }

  return docRef.id;
}


export async function addTransactionsBatch(userId: string, items: TransactionDTO[]) {
  if (!userId) throw new Error("userId required");
  const now = new Date().toISOString();
  const householdId = await resolveUserHouseholdId(userId);

  const validItems = items
    .map((item) => {
      const normalizedDate = normalizeTransactionDate(item.date ?? now);

      return {
        ...item,
        userId,
        householdId,
        ...normalizedDate,
        competenceMonthKey: item.competenceMonthKey ?? normalizedDate.monthKey,
        owner: item.owner ?? 'PF',
        companyId: item.companyId ?? null,
        createdAt: item.createdAt ?? now,
        updatedAt: item.updatedAt ?? now,
        merchant: item.merchant ?? '',
        importHash: item.importHash ?? generateImportHash({
          ...item,
          date: normalizedDate.dateISO || normalizedDate.date,
        }),
      };
    })
    .filter((item) => item.description && Number.isFinite(Number(item.amount)));

  if (!validItems.length) {
    return { inserted: 0, skipped: 0, duplicates: [] as TransactionDTO[] };
  }

  const uniqueByHash = new Map<string, TransactionDTO>();

  for (const item of validItems) {
    if (item.importHash && !uniqueByHash.has(item.importHash)) {
      uniqueByHash.set(item.importHash, item as TransactionDTO);
    }
  }

  const uniqueItems = Array.from(uniqueByHash.values());
  const existingHashes = new Set<string>();

  const hashesByOwner = new Map<'PF' | 'PJ', string[]>();
  for (const item of uniqueItems) {
    if (!item.importHash) continue;
    const owner = (item.owner || 'PF') as 'PF' | 'PJ';
    if (!hashesByOwner.has(owner)) hashesByOwner.set(owner, []);
    hashesByOwner.get(owner)!.push(item.importHash);
  }

  for (const [owner, hashes] of hashesByOwner) {
    const chunkQueries: Promise<void>[] = [];

    for (let i = 0; i < hashes.length; i += 30) {
      const chunk = hashes.slice(i, i + 30);
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('owner', '==', owner),
        where('importHash', 'in', chunk)
      );
      chunkQueries.push(
        getDocs(q).then((snap) => {
          snap.docs.forEach((d) => {
            const h = d.data().importHash;
            if (h) existingHashes.add(h);
          });
        })
      );
    }

    await Promise.all(chunkQueries);
  }

  const toInsert = uniqueItems.filter(
    (item) => !existingHashes.has(item.importHash || '')
  );

  for (const item of toInsert) {
    await assertMonthOpen(
      userId,
      item.owner || 'PF',
      item.competenceMonthKey || item.monthKey
    );
  }

  const batch = writeBatch(db);

  for (const item of toInsert) {
    const ref = doc(collection(db, 'transactions'));
    item.id = ref.id;
    const { id, ...data } = item;
    batch.set(ref, data);
  }

  if (toInsert.length) {
    await batch.commit();
  }

  const summaryTargets = new Set(
    toInsert
      .filter((item) => item.monthKey)
      .map((item) => `${item.owner || 'PF'}|${item.monthKey}`)
  );

  for (const target of summaryTargets) {
    const [owner, month] = target.split('|') as ['PF' | 'PJ', string];

    if (month) {
      await generateMonthlySummary(userId, owner, month);
    }
  }

  const installmentItems = toInsert.filter(
    (item) =>
      item.isInstallment === true &&
      item.installmentCurrent !== null && item.installmentCurrent !== undefined &&
      item.installmentTotal !== null && item.installmentTotal !== undefined &&
      item.installmentKey
  );

  for (const item of installmentItems) {
    try {
      await upsertLiabilityFromInstallmentTransaction(userId, item);
    } catch (err) {
      console.error("[addTransactionsBatch] Falha ao atualizar passivo automático do lançamento:", err);
    }
  }

  return {
    inserted: toInsert.length,
    skipped: validItems.length - toInsert.length,
    duplicates: uniqueItems.filter((item) =>
      existingHashes.has(item.importHash || '')
    ),
  };
}


export async function getTransactionsByMonth(
  userId: string,
  owner: 'PF' | 'PJ',
  monthKey: string
): Promise<TransactionDTO[]> {
  if (!userId) return [];
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('owner', '==', owner),
    where('monthKey', '==', monthKey)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TransactionDTO[];
}

export async function getTransactionsByOwnerAndMonth(
  userId: string,
  owner: 'PF' | 'PJ',
  monthKey: string
): Promise<TransactionDTO[]> {
  if (!userId) return [];
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('owner', '==', owner)
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((doc) => {
      const data = doc.data() as Partial<TransactionDTO>;

      return {
        id: doc.id,
        ...data,
        type: data.type || 'expense',
        amount: Number(data.amount || 0),
        description: data.description || '',
        owner: data.owner || 'PF',
        companyId: data.companyId ?? null,
        competenceMonthKey: data.competenceMonthKey || data.monthKey,
      } as TransactionDTO;
    })
    .filter((t) => (t.competenceMonthKey || t.monthKey) === monthKey);
}

export async function getTransactionsByMonthList(
  userId: string,
  owner: 'PF' | 'PJ',
  monthKeys: string[]
): Promise<TransactionDTO[]> {
  if (!userId || monthKeys.length === 0) return [];

  const safeKeys = monthKeys.slice(0, 10);
  const monthSet = new Set(safeKeys);

  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('owner', '==', owner),
    where('monthKey', 'in', safeKeys)
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((doc) => {
      const data = doc.data() as Partial<TransactionDTO>;
      return {
        id: doc.id,
        ...data,
        type: data.type || 'expense',
        amount: Number(data.amount || 0),
        description: data.description || '',
        owner: data.owner || 'PF',
        companyId: data.companyId ?? null,
        competenceMonthKey: data.competenceMonthKey || data.monthKey,
      } as TransactionDTO;
    })
    .filter((t) => monthSet.has(t.competenceMonthKey || t.monthKey || ''));
}

export async function getRecentTransactions(
  userId: string,
  owner?: 'PF' | 'PJ',
  limitCount = 20
): Promise<TransactionDTO[]> {
  if (!userId) return [];
  const constraints: Parameters<typeof query>[1][] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (owner) {
    constraints.unshift(where('owner', '==', owner));
  }

  const q = query(collection(db, 'transactions'), ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data() as Partial<TransactionDTO>;
    return {
      id: doc.id,
      ...data,
      type: data.type || 'expense',
      amount: Number(data.amount || 0),
      description: data.description || '',
      owner: data.owner || 'PF',
      companyId: data.companyId ?? null,
      competenceMonthKey: data.competenceMonthKey || data.monthKey,
    } as TransactionDTO;
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "transactions", transactionId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as any;
    await assertMonthOpen(userId, data.owner, data.competenceMonthKey || data.monthKey);

    // Primeiro estorna o passivo se for parcelado
    if (data.isInstallment && data.installmentKey) {
      try {
        await reverseLiabilityPaymentByTransactionId(userId, transactionId);
      } catch (err) {
        console.error("[deleteTransaction] Falha ao reverter passivo automático:", err);
      }
    }

    await deleteDoc(ref);

    // Regenera o sumário mensal
    const month = data.competenceMonthKey || data.monthKey;
    if (month) {
      await generateMonthlySummary(userId, data.owner, month);
    }
  }
}
