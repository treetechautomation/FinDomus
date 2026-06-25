import { addDoc, collection, doc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { resolveUserHouseholdId } from "./users";

export type YieldType = 'DIVIDEND' | 'JCP' | 'FII' | 'COUPON' | 'OTHER';

export type InvestmentYield = {
  id?: string;
  userId?: string;
  householdId: string | null;
  investmentId: string;
  ticker: string;
  date: string;
  amount: number;
  type: YieldType;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getInvestmentYields(userId: string): Promise<InvestmentYield[]> {
  if (!userId) return [];
  const q = query(collection(db, "investment_yields"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InvestmentYield[];
}

export async function addInvestmentYield(
  userId: string,
  data: {
    investmentId: string;
    ticker: string;
    date: string;
    amount: number;
    type: YieldType;
    description?: string;
  }
) {
  if (!userId) throw new Error("userId required");
  const householdId = await resolveUserHouseholdId(userId);

  const docRef = await addDoc(collection(db, "investment_yields"), {
    ...data,
    userId,
    householdId,
    amount: Number(data.amount) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function deleteInvestmentYield(userId: string, yieldId: string) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "investment_yields", yieldId);
  await deleteDoc(ref);
}
