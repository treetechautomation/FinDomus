import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BrokerPositionDoc {
  id?: string;
  userId: string;
  broker: string;
  ticker: string;
  assetType: string;
  institution: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  currency?: string;
  year: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface BrokerIncomeDoc {
  id?: string;
  userId: string;
  broker: string;
  ticker: string;
  incomeType: string;
  amount: number;
  currency?: string;
  paymentDate?: string;
  year: number;
  createdAt?: any;
  updatedAt?: any;
}

export async function getBrokerPositions(userId: string): Promise<BrokerPositionDoc[]> {
  if (!userId) return [];
  const q = query(collection(db, "broker_positions"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BrokerPositionDoc[];
}

export async function getBrokerIncome(userId: string): Promise<BrokerIncomeDoc[]> {
  if (!userId) return [];
  const q = query(collection(db, "broker_income"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BrokerIncomeDoc[];
}
