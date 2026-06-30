import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { resolveUserHouseholdId } from "./users";
import { financialEvents } from "@/core/finance/events";

import type {
  Account,
  Company,
} from "@/services/firestore/types";

export type {
  Account,
  Company,
} from "@/services/firestore/types";

export async function addCompany(userId: string, data: {
  name: string;
  createdAt?: string;
}) {
  if (!userId) throw new Error("userId required");
  const householdId = await resolveUserHouseholdId(userId);
  const docRef = await addDoc(collection(db, "companies"), {
    ...data,
    userId,
    householdId,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });

  return docRef.id;
}

export async function createCompany(userId: string, name: string) {
  return addCompany(userId, { name });
}

export async function getCompanies(userId: string): Promise<Company[]> {
  if (!userId) return [];
  const q = query(
    collection(db, "companies"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Company[];

  return data;
}

export async function addAccount(userId: string, data: {
  name: string;
  type: string;
  owner: "PF" | "PJ";
  companyId?: string | null;
  balance: number;
  createdAt?: string;
}) {
  if (!userId) throw new Error("userId required");

  const householdId = await resolveUserHouseholdId(userId);

  const docRef = await addDoc(collection(db, "accounts"), {
    ...data,
    userId,
    householdId,
    companyId: data.companyId ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  });

  financialEvents.emit({
    type: "account:updated",
    payload: { accountId: docRef.id },
    timestamp: new Date().toISOString(),
    source: "addAccount",
  });

  return docRef.id;
}

export async function createAccount(userId: string, data: Account) {
  return addAccount(userId, data);
}

export async function getAccounts(userId: string): Promise<Account[]> {
  if (!userId) return [];

  const q = query(
    collection(db, "accounts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Account[];
}


export async function getAccountsWithBalance(userId: string): Promise<Account[]> {
  const accounts = await getAccounts(userId);

  return accounts.map((account) => ({
    ...account,
    balance: Number(account.balance || 0),
  }));
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: {
    name?: string;
    type?: string;
    owner?: "PF" | "PJ";
    companyId?: string | null;
    balance?: number;
  }
) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "accounts", accountId);

  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  financialEvents.emit({
    type: "account:updated",
    payload: { accountId },
    timestamp: new Date().toISOString(),
    source: "updateAccount",
  });
}

export async function deleteAccount(userId: string, accountId: string) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "accounts", accountId);
  await deleteDoc(ref);

  financialEvents.emit({
    type: "account:updated",
    payload: { accountId },
    timestamp: new Date().toISOString(),
    source: "deleteAccount",
  });
}
