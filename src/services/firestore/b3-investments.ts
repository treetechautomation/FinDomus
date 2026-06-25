import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { InvestmentPosition, InvestmentIncome, InvestmentImport } from "@/types/import/b3";

export async function getB3Positions(userId: string): Promise<InvestmentPosition[]> {
  if (!userId) return [];
  const q = query(collection(db, "investment_positions"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InvestmentPosition[];
}

export async function getB3Income(userId: string): Promise<InvestmentIncome[]> {
  if (!userId) return [];
  const q = query(collection(db, "investment_income"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InvestmentIncome[];
}

export async function getB3Imports(userId: string): Promise<InvestmentImport[]> {
  if (!userId) return [];
  const q = query(collection(db, "investment_imports"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InvestmentImport[];
}
