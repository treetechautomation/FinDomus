import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export type TaxObligation = {
  id?: string;
  companyId: string;
  name: string;
  dueDate: string;
  value: number;
  status: "pending" | "paid";
  createdAt: string;
};

export type Receivable = {
  id?: string;
  companyId: string;
  description: string;
  dueDate: string;
  value: number;
  status: "pending" | "received";
  createdAt: string;
};

export async function getTaxObligations(
  userId: string,
  companyId?: string
): Promise<TaxObligation[]> {
  if (!userId) throw new Error("userId required");
  const q = query(
    collection(db, "tax_obligations"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TaxObligation[];

  return companyId
    ? data.filter((item) => item.companyId === companyId)
    : data;
}

export async function addTaxObligation(
  userId: string,
  data: {
    companyId: string;
    name: string;
    dueDate: string;
    value: number;
  }
) {
  if (!userId) throw new Error("userId required");
  const docRef = await addDoc(
    collection(db, "tax_obligations"),
    {
      ...data,
      userId,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
  );

  return docRef.id;
}

export async function markTaxAsPaid(id: string) {
  const ref = doc(db, "tax_obligations", id);

  await updateDoc(ref, {
    status: "paid",
  });
}

export async function getReceivables(
  userId: string,
  companyId?: string
): Promise<Receivable[]> {
  if (!userId) throw new Error("userId required");
  const q = query(
    collection(db, "receivables"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Receivable[];

  return companyId
    ? data.filter((item) => item.companyId === companyId)
    : data;
}

export async function addReceivable(
  userId: string,
  data: {
    companyId: string;
    description: string;
    dueDate: string;
    value: number;
  }
) {
  if (!userId) throw new Error("userId required");
  const docRef = await addDoc(
    collection(db, "receivables"),
    {
      ...data,
      userId,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
  );

  return docRef.id;
}

export async function markReceivableAsReceived(id: string) {
  const ref = doc(db, "receivables", id);

  await updateDoc(ref, {
    status: "received",
  });
}
