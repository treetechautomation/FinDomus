import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
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
  companyId?: string
): Promise<TaxObligation[]> {
  const snap = await getDocs(
    collection(db, "tax_obligations")
  );

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TaxObligation[];

  return companyId
    ? data.filter((item) => item.companyId === companyId)
    : data;
}

export async function addTaxObligation(data: {
  companyId: string;
  name: string;
  dueDate: string;
  value: number;
}) {
  const docRef = await addDoc(
    collection(db, "tax_obligations"),
    {
      ...data,
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
  companyId?: string
): Promise<Receivable[]> {
  const snap = await getDocs(
    collection(db, "receivables")
  );

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Receivable[];

  return companyId
    ? data.filter((item) => item.companyId === companyId)
    : data;
}

export async function addReceivable(data: {
  companyId: string;
  description: string;
  dueDate: string;
  value: number;
}) {
  const docRef = await addDoc(
    collection(db, "receivables"),
    {
      ...data,
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
