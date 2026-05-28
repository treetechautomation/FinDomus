const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

function normalizeCategory(cat) {
  if (!cat) return "Outros";

  let c = String(cat).trim();

  // padronização
  if (c.toLowerCase().includes("financeiro")) return "Transferência";
  if (c.toLowerCase().includes("pagamento")) return "Transferência";
  if (c.toLowerCase().includes("aporte")) return "Transferência";

  if (c.toLowerCase() === "outros") return "Outros";

  return c;
}

(async () => {
  const snap = await getDocs(collection(db, "transactions"));

  const batch = writeBatch(db);
  let count = 0;

  snap.forEach(d => {
    const t = { id: d.id, ...d.data() };

    if (t.type !== "expense") return;

    const fixed = normalizeCategory(t.category);

    if (fixed !== t.category) {
      const nextType = fixed === "Transferência" ? "transfer" : t.type;

      console.log(
        "ATUALIZANDO:",
        t.date,
        `"${t.category}" -> "${fixed}"`,
        `type: "${t.type}" -> "${nextType}"`,
        t.description
      );

      batch.update(doc(db, "transactions", t.id), {
        category: fixed,
        type: nextType,
        updatedAt: new Date().toISOString(),
      });

      count++;
    }
  });

  console.log("TOTAL ATUALIZADO:", count);
  if (count > 0) await batch.commit();
  console.log("FIX_EXPENSES_OK");
})();
