import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, getDoc, setDoc, query, orderBy, doc, updateDoc, deleteDoc, writeBatch, where } from "firebase/firestore";
import {
  investments as mockInvestments,
  companies as mockCompanies,
} from "@/lib/data";



// =========================
// MONTHLY SUMMARY
// =========================

function getMonthKey(date?: string) {
  const d = new Date(date || new Date());
  return d.toISOString().slice(0, 7);
}

export async function generateMonthlySummary(userId: string, owner: "PF" | "PJ", month: string) {
  if (!userId) throw new Error("userId required");

  const snap = await getDocs(
    query(
      collection(db, "transactions"),
      where("userId", "==", userId)
    )
  );

  const transactions = snap.docs
    .map(doc => doc.data())
    .filter((t: any) => t.owner === owner && (t.competenceMonthKey || t.monthKey) === month);

  let income = 0;
  let expenses = 0;
  const categories: Record<string, number> = {};

  for (const t of transactions as any[]) {
    const amount = Number(t.amount || 0);
    const category = t.category || "Outros";

    if (t.type === "income") income += amount;
    else expenses += Math.abs(amount);

    categories[category] = (categories[category] || 0) + Math.abs(amount);
  }

  const balance = income - expenses;

  const docId = `${userId}_${owner}_${month}`;

  await setDoc(doc(db, "monthly_summaries", docId), {
    id: docId,
    userId,
    owner,
    month,
    income,
    expenses,
    balance,
    transactionsCount: transactions.length,
    categories,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    owner,
    month,
    income,
    expenses,
    balance,
    transactionsCount: transactions.length,
  };
}



export async function getMonthlySummary(userId: string, owner: "PF" | "PJ", month: string) {
  if (!userId) return null;
  const id = `${userId}_${owner}_${month}`;

  const docRef = doc(db, "monthly_summaries", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }

  const snap = await getDocs(
    query(collection(db, "monthly_summaries"), where("id", "==", id))
  );

  if (!snap.empty) {
    return snap.docs[0].data();
  }

  return null;
}



export async function getLastSixMonthsSummaryFlow(userId: string, owner: "PF" | "PJ") {
  const now = new Date();

  const months = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthKey = d.toISOString().slice(0, 7);

    return {
      key: monthKey,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    };
  });

  const result = [];

  for (const m of months) {
    const summary = await getMonthlySummary(userId, owner, m.key);

    if (summary) {
      result.push({
        month: m.label,
        income: summary.income || 0,
        expenses: summary.expenses || 0,
      });
    } else {
      result.push({
        month: m.label,
        income: 0,
        expenses: 0,
      });
    }
  }

  return result;
}





// ===== RECURRING EXPENSES =====
export type RecurringExpense = {
  id?: string;
  name: string;
  amount: number;
  category?: string;

  owner: "PF" | "PJ";
  companyId?: string | null;
}


// ================================
// INVESTMENT ASSETS (CATÁLOGO)
// ================================

export type InvestmentAsset = {
  id?: string;
  ticker: string;
  name: string;
  type: string;
  exchange?: string;
  currency?: string;
  providerSymbol?: string;
  active?: boolean;
  createdAt?: string;
};

export async function getInvestmentAssets(type?: string): Promise<InvestmentAsset[]> {
  const snap = await getDocs(collection(db, "investmentAssets"));

  let data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InvestmentAsset[];

  if (type) {
    data = data.filter((item) => item.type === type);
  }

  return data;
}

export async function addInvestmentAsset(data: InvestmentAsset) {
  const docRef = await addDoc(collection(db, "investmentAssets"), {
    ...data,
    createdAt: new Date().toISOString(),
    active: true,
  });

  return docRef.id;
}


// ================================
// INVESTMENT GOALS
// ================================
export async function saveInvestmentGoals(userId: string, goals: any[]) {
  if (!userId) throw new Error("userId is required to save investment goals.");
  const ref = doc(db, "settings", `investment_goals_${userId}`);
  await setDoc(ref, {
    goals,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function getInvestmentGoals(userId: string) {
  if (!userId) return [];
  const ref = doc(db, "settings", `investment_goals_${userId}`);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data().goals || [] : [];
}
