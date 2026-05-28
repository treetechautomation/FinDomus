import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type Budget = {
  id?: string;
  category: string;
  planned: number;
  month: string;
  owner: "PF";
  createdAt: string;
};

export type WealthProfileCategory = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  categories?: string[];
};

export type WealthProfile = {
  id?: string;
  userId: string;
  categories: WealthProfileCategory[];
  updatedAt: string;
  createdAt?: string;
};

export type RecurringExpense = {
  id?: string;
  name: string;
  amount: number;
  category?: string;
  owner: "PF" | "PJ";
  companyId?: string | null;
  frequency: "monthly";
  dayOfMonth?: number;
  isActive: boolean;
  lastDetectedAt?: string;
  createdAt: string;
};

export async function getBudgets(month?: string): Promise<Budget[]> {
  const snap = await getDocs(collection(db, "budgets"));

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Budget[];

  return month ? data.filter((item) => item.month === month) : data;
}

export async function upsertBudget(data: {
  category: string;
  planned: number;
  month: string;
}) {
  return addDoc(collection(db, "budgets"), {
    ...data,
    owner: "PF",
    createdAt: new Date().toISOString(),
  });
}

export async function getWealthProfile(userId: string): Promise<WealthProfile | null> {
  const snap = await getDocs(collection(db, "wealth_profiles"));

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as WealthProfile[];

  return data.find((item) => item.userId === userId) || null;
}

export async function saveWealthProfile(
  userId: string,
  categories: WealthProfileCategory[]
) {
  const existing = await getWealthProfile(userId);

  if (existing?.id) {
    const ref = doc(db, "wealth_profiles", existing.id);
    await updateDoc(ref, {
      categories,
      updatedAt: new Date().toISOString(),
    });
    return existing.id;
  }

  const docRef = await addDoc(collection(db, "wealth_profiles"), {
    userId,
    categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
  const snap = await getDocs(collection(db, "recurring_expenses"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RecurringExpense[];
}

export async function addRecurringExpense(data: RecurringExpense) {
  return addDoc(collection(db, "recurring_expenses"), data);
}

export async function updateRecurringExpense(
  id: string,
  data: Partial<RecurringExpense>
) {
  return updateDoc(doc(db, "recurring_expenses", id), data);
}

export async function deleteRecurringExpense(id: string) {
  return deleteDoc(doc(db, "recurring_expenses", id));
}
