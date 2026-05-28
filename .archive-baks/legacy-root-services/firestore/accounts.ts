import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { getTransactions } from "@/services/firestore/transactions";


import type {
  Account,
  Company,
} from "@/services/firestore/types";

export type {
  Account,
  Company,
} from "@/services/firestore/types";

export async function addCompany(data: {
  name: string;
  createdAt?: string;
}) {
  const docRef = await addDoc(collection(db, "companies"), {
    ...data,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });

  return docRef.id;
}

export async function createCompany(name: string) {
  return addCompany({ name });
}

export async function getCompanies(): Promise<Company[]> {
  const q = query(
    collection(db, "companies"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Company[];

  return data;
}
export async function addAccount(data: {
  name: string;
  type: string;
  owner: "PF" | "PJ";
  companyId?: string | null;
  balance: number;
  createdAt?: string;
}) {
  const docRef = await addDoc(collection(db, "accounts"), {
    ...data,
    companyId: data.companyId ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });

  return docRef.id;
}

export async function createAccount(data: Account) {
  return addAccount(data);
}

export async function getAccounts(): Promise<Account[]> {
  const q = query(
    collection(db, "accounts"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Account[];
}


export async function getAccountsWithBalance(): Promise<Account[]> {
  const accounts = await getAccounts();

  return accounts.map((account) => ({
    ...account,
    balance: Number(account.balance || 0),
  }));
}

export async function updateAccount(
  accountId: string,
  data: {
    name?: string;
    type?: string;
    owner?: "PF" | "PJ";
    companyId?: string | null;
    balance?: number;
  }
) {
  const ref = doc(db, "accounts", accountId);

  await updateDoc(ref, data);
}
