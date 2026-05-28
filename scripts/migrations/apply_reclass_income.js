const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch, doc } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

function classify(t) {
  const desc = String(t.description || "").toLowerCase();
  const raw = String(t.description || "");
  const nums = raw.match(/\d{11,14}/g) || [];

  if (desc.includes("remunera")) return "Rendimentos financeiros";
  if (desc.includes("pagamento recebido") || desc.includes("salario")) return "Salário";
  if (desc.includes("ted recebida")) return "Serviços prestados";

  const hasPF = nums.some(n => n.length === 11 || (n.length === 14 && n.startsWith("000")));
  const hasPJ = nums.some(n => n.length === 14 && !n.startsWith("000"));

  if (hasPF) return "Recebimentos";
  if (hasPJ) return "Serviços prestados";

  if (t.type === "income" && String(t.category || "").toLowerCase() === "outros") {
    return "Recebimentos";
  }

  return t.category || "Outros";
}

(async () => {
  const snap = await getDocs(collection(db, "transactions"));
  const batch = writeBatch(db);

  let count = 0;

  snap.forEach(d => {
    const t = { id: d.id, ...d.data() };
    if (t.type !== "income") return;

    const next = classify(t);
    if (next !== t.category) {
      console.log("ATUALIZANDO:", t.date, t.amount, `"${t.category}" -> "${next}"`);
      batch.update(doc(db, "transactions", t.id), {
        category: next,
        updatedAt: new Date().toISOString(),
      });
      count++;
    }
  });

  console.log("TOTAL RECLASSIFICADO:", count);
  if (count > 0) await batch.commit();
  console.log("RECLASS_OK");
})();
