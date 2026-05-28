const rules = [];

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

(async () => {
  const snap = await getDocs(collection(db, "transactions"));

  const batch = writeBatch(db);
let count = 0;

  snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.type === "expense")
    .filter(t => String(t.category || "").trim().toLowerCase() === "outros")
    .forEach(t => {
      const text = `${t.description || ""} ${t.merchant || ""}`;
      const rule = { category: "Acertos pessoais" };

      count++;
      console.log("ATUALIZANDO:", t.date, t.amount, `"${t.category}" -> "${rule.category}"`, t.description);
batch.update(doc(db, "transactions", t.id), {
  category: rule.category,
  updatedAt: new Date().toISOString(),
});
    });

  console.log("TOTAL ATUALIZADO:", count);
if (count > 0) await batch.commit();
console.log("FIX_LAST_OK");
})();
