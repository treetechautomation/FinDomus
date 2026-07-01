import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type AccountIdentity = {
  id?: string;
  userId?: string;

  accountId?: string | null;

  name: string;

  normalizedName: string;

  aliases: string[];

  owner: 'PF' | 'PJ';

  ruleType:
    | 'family_account'
    | 'own_account'
    | 'company_account'
    | 'known_transfer';

  targetType: 'transfer';

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export function normalizeIdentityName(
  text: string
) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export async function createAccountIdentity(
  data: Omit<
    AccountIdentity,
    | 'id'
    | 'normalizedName'
    | 'createdAt'
    | 'updatedAt'
  >
) {

  return addDoc(
    collection(db, 'account_identities'),
    {
      ...data,

      normalizedName:
        normalizeIdentityName(data.name),

      aliases: (data.aliases || []).map(
        normalizeIdentityName
      ),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getAccountIdentities(userId?: string) {

  const q = query(
    collection(db, 'account_identities'),
    ...(userId ? [where('userId', '==', userId)] : []),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AccountIdentity[];
}
