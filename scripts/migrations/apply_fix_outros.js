const rules = [
  { match: /joselia|rosilene/i, category: "Serviços domésticos" },
  { match: /laila/i, category: "Doações" },
  { match: /berbigao/i, category: "Restaurante" },
  { match: /liritty/i, category: "Compras" },
];

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

  snap.docs.forEach(d => {
    const t = { id: d.id, ...d.data() };
    if (t.type !== "expense") return;
    if (String(t.category || "").trim().toLowerCase() !== "outros") return;

    const text = `${t.description || ""} ${t.merchant || ""}`;
    const rule = rules.find(r => r.match.test(text));
    if (!rule) return;

    console.log("ATUALIZANDO:", t.date, t.amount, `"${t.category}" -> "${rule.category}"`, t.description);

    batch.update(doc(db, "transactions", t.id), {
      category: rule.category,
      updatedAt: new Date().toISOString(),
    });

    count++;
  });

  console.log("TOTAL ATUALIZADO:", count);
  if (count > 0) await batch.commit();
  console.log("FIX_OUTROS_OK");
})();
