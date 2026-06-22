import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { DEFAULT_CATEGORY_CATALOG } from "@/core/finance/default-category-catalog";

export type Category = {
  id?: string;
  name: string;
  keywords?: string[];
  createdAt: string;
  updatedAt?: string;
  isDefault?: boolean;
  userId?: string | null;
};

export async function getCategories(userId?: string): Promise<Category[]> {
  const q = query(collection(db, "categories"), orderBy("name", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function addCategory(data: { name: string; keywords?: string[] }) {
  const docRef = await addDoc(collection(db, "categories"), {
    name: data.name.trim(),
    keywords: data.keywords || [],
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function deleteCategory(categoryId: string) {
  const ref = doc(db, "categories", categoryId);
  await deleteDoc(ref);
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; keywords?: string[] }
) {
  const ref = doc(db, "categories", categoryId);
  await updateDoc(ref, data);
}

export async function migrateCategoryTransactions(from: string, to: string) {
  const q = query(collection(db, "transactions"), where("category", "==", from));
  const snap = await getDocs(q);

  let count = 0;

  for (const d of snap.docs) {
    await updateDoc(doc(db, "transactions", d.id), {
      category: to,
      updatedAt: new Date().toISOString(),
    });
    count++;
  }

  return count;
}

function normalizeCategoryKey(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function formatCanonicalCategoryName(value: string) {
  const key = normalizeCategoryKey(value);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export async function previewDuplicateCategories() {
  const categories = await getCategories();

  const groups = new Map<string, Category[]>();

  for (const category of categories) {
    const key = normalizeCategoryKey(category.name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(category);
  }

  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({
      key,
      canonicalName: formatCanonicalCategoryName(items[0].name),
      categories: items,
    }));
}

export async function cleanDuplicateCategories() {
  const groups = await previewDuplicateCategories();

  let migratedTransactions = 0;
  let deletedCategories = 0;

  for (const group of groups) {
    const canonical = group.categories[0];
    if (!canonical.id) continue;

    const canonicalName = formatCanonicalCategoryName(canonical.name);
    const mergedKeywords = new Set<string>();

    for (const category of group.categories) {
      for (const keyword of category.keywords || []) {
        const clean = normalizeCategoryKey(keyword);
        if (clean) mergedKeywords.add(clean);
      }
    }

    await updateCategory(canonical.id, {
      name: canonicalName,
      keywords: Array.from(mergedKeywords),
    });

    for (const duplicate of group.categories.slice(1)) {
      if (!duplicate.id) continue;

      migratedTransactions += await migrateCategoryTransactions(
        duplicate.name,
        canonicalName
      );

      await deleteCategory(duplicate.id);
      deletedCategories++;
    }
  }

  return {
    groups: groups.length,
    migratedTransactions,
    deletedCategories,
  };
}

export async function seedDefaultCategoriesForUser(userId?: string) {
  const existingCategories = await getCategories();
  
  // Normalizar os nomes existentes para verificar duplicidade
  const normalizedExisting = new Map<string, Category>();
  for (const cat of existingCategories) {
    const norm = normalizeCategoryKey(cat.name);
    if (norm) {
      normalizedExisting.set(norm, cat);
    }
  }

  const now = new Date().toISOString();

  for (const item of DEFAULT_CATEGORY_CATALOG) {
    const normName = normalizeCategoryKey(item.name);
    const existing = normalizedExisting.get(normName);

    if (!existing) {
      // Cria a categoria
      await addDoc(collection(db, "categories"), {
        name: item.name.trim(),
        keywords: item.keywords || [],
        createdAt: now,
        updatedAt: now,
        isDefault: true,
        userId: userId || null,
      });
    } else {
      // Categoria já existe. Mesclar palavras-chave.
      const currentKeywords = existing.keywords || [];
      const mergedSet = new Set<string>();
      
      // Adiciona as atuais normalizadas
      for (const kw of currentKeywords) {
        const clean = normalizeCategoryKey(kw);
        if (clean) mergedSet.add(clean);
      }
      
      // Adiciona as novas do catálogo normalizadas
      for (const kw of item.keywords) {
        const clean = normalizeCategoryKey(kw);
        if (clean) mergedSet.add(clean);
      }

      const mergedArray = Array.from(mergedSet);

      if (existing.id) {
        const ref = doc(db, "categories", existing.id);
        await updateDoc(ref, {
          keywords: mergedArray,
          updatedAt: now,
        });
      }
    }
  }
}
