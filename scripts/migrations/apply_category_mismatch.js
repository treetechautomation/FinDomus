const { initializeApp } = require("firebase/app");
const { getFirestore, writeBatch, doc } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

const fixes = [
  { id: "JHXAqbLLg6wjjo4FjZKC", category: "Plano de saúde" },
  { id: "JhHbapRubAADsVKsm2rx", category: "Internet" },
  { id: "Vuh0cQRwX4v3ZPbSdZeq", category: "Serviços" },
];

(async () => {
  const batch = writeBatch(db);

  for (const f of fixes) {
    console.log("ATUALIZANDO:", f.id, "->", f.category);
    batch.update(doc(db, "transactions", f.id), {
      category: f.category,
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  console.log("CATEGORY_FIX_OK");
})();
