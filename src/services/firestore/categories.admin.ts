import { adminDb } from '@/lib/firebase-admin';
import type { Category } from '@/services/firestore/categories';

export async function getCategoriesAdmin(): Promise<Category[]> {
  const snap = await adminDb.collection("categories").orderBy("name", "asc").get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}
