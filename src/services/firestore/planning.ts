import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { resolveUserHouseholdId } from "./users";
import { financialEvents } from "@/core/finance/events";

export type Budget = {
  id?: string;
  userId?: string;
  householdId?: string | null;
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
  householdId?: string | null;
  categories: WealthProfileCategory[];
  updatedAt: string;
  createdAt?: string;
};

export type RecurringExpense = {
  id?: string;
  userId?: string;
  householdId?: string | null;
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

export async function getBudgets(userId: string, month?: string): Promise<Budget[]> {
  if (!userId) return [];
  const constraints = [where("userId", "==", userId)];
  if (month) constraints.push(where("month", "==", month));

  const q = query(collection(db, "budgets"), ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Budget[];
}

export async function upsertBudget(userId: string, data: {
  category: string;
  planned: number;
  month: string;
}) {
  if (!userId) throw new Error("userId required");
  const householdId = await resolveUserHouseholdId(userId);
  const docRef = await addDoc(collection(db, "budgets"), {
    ...data,
    userId,
    householdId,
    owner: "PF",
    createdAt: new Date().toISOString(),
  });

  financialEvents.emit({
    type: "planning:updated",
    payload: { userId },
    timestamp: new Date().toISOString(),
    source: "upsertBudget",
  });

  return docRef;
}

export async function getWealthProfile(userId: string): Promise<WealthProfile | null> {
  if (!userId) return null;
  const q = query(collection(db, "wealth_profiles"), where("userId", "==", userId));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  } as WealthProfile;
}

export async function saveWealthProfile(
  userId: string,
  categories: WealthProfileCategory[]
) {
  const existing = await getWealthProfile(userId);
  const householdId = await resolveUserHouseholdId(userId);

  if (existing?.id) {
    const ref = doc(db, "wealth_profiles", existing.id);
    await updateDoc(ref, {
      categories,
      householdId,
      updatedAt: new Date().toISOString(),
    });

    financialEvents.emit({
      type: "planning:updated",
      payload: { userId },
      timestamp: new Date().toISOString(),
      source: "saveWealthProfile:update",
    });

    return existing.id;
  }

  const docRef = await addDoc(collection(db, "wealth_profiles"), {
    userId,
    householdId,
    categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  financialEvents.emit({
    type: "planning:updated",
    payload: { userId },
    timestamp: new Date().toISOString(),
    source: "saveWealthProfile:create",
  });

  return docRef.id;
}

export async function getRecurringExpenses(userId: string): Promise<RecurringExpense[]> {
  if (!userId) return [];
  const q = query(collection(db, "recurring_expenses"), where("userId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RecurringExpense[];
}

export async function addRecurringExpense(userId: string, data: RecurringExpense) {
  if (!userId) throw new Error("userId required");
  const householdId = await resolveUserHouseholdId(userId);
  const docRef = await addDoc(collection(db, "recurring_expenses"), {
    ...data,
    userId,
    householdId,
  });

  financialEvents.emit({
    type: "recurring:updated",
    payload: { id: docRef.id },
    timestamp: new Date().toISOString(),
    source: "addRecurringExpense",
  });

  return docRef;
}

export async function updateRecurringExpense(
  userId: string,
  id: string,
  data: Partial<RecurringExpense>
) {
  const result = await updateDoc(doc(db, "recurring_expenses", id), data);

  financialEvents.emit({
    type: "recurring:updated",
    payload: { id },
    timestamp: new Date().toISOString(),
    source: "updateRecurringExpense",
  });

  return result;
}

export async function deleteRecurringExpense(userId: string, id: string) {
  const result = await deleteDoc(doc(db, "recurring_expenses", id));

  financialEvents.emit({
    type: "recurring:updated",
    payload: { id },
    timestamp: new Date().toISOString(),
    source: "deleteRecurringExpense",
  });

  return result;
}
