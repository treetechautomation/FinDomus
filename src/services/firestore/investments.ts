import { addDoc, collection, doc, getDocs, updateDoc, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Investment } from "@/services/firestore/types";
export type { Investment } from '@/services/firestore/types';

export async function getInvestments(userId: string): Promise<Investment[]> {
  if (!userId) return [];
  const q = query(collection(db, "investments"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Investment[];
}

export async function addInvestment(userId: string, data: {
  type: string;
  institution: string;
  ticker?: string;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  currentValue?: number;
  contributions?: number;
  objective?: string;
  liquidity?: string;
  goal?: number;
}) {
  if (!userId) throw new Error("userId required");
  const ticker = String(data.ticker || "").trim().toUpperCase();

  if (ticker) {
    const q = query(collection(db, "investments"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const existing = snapshot.docs.find((item) => {
      const d = item.data();
      return String(d.ticker || "").trim().toUpperCase() === ticker;
    });

    if (existing) {
      const current = existing.data();

      const oldQty = Number(current.quantity || 0);
      const oldAvg = Number(current.averagePrice || 0);
      const newQty = Number(data.quantity || 0);
      const newAvg = Number(data.averagePrice || data.currentPrice || 0);
      const currentPrice = Number(data.currentPrice || current.currentPrice || newAvg || 0);

      const totalQty = oldQty + newQty;
      const weightedAvg =
        totalQty > 0 ? ((oldQty * oldAvg) + (newQty * newAvg)) / totalQty : newAvg;

      await updateDoc(existing.ref, {
        ...data,
        ticker,
        quantity: totalQty,
        averagePrice: weightedAvg,
        currentPrice,
        currentValue: totalQty * currentPrice,
        contributions: totalQty * weightedAvg,
        updatedAt: new Date().toISOString(),
      });

      return existing.id;
    }
  }

  const docRef = await addDoc(collection(db, "investments"), {
    ...data,
    userId,
    ticker,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function updateInvestment(
  userId: string,
  investmentId: string,
  data: Partial<Investment>
) {
  if (!userId) throw new Error("userId required");
  const ref = doc(db, "investments", investmentId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
