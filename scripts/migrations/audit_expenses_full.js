const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

(async () => {
  const snap = await getDocs(collection(db, "transactions"));
  const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const byType = {};
  const byCategoryExpense = {};
  const suspicious = [];

  for (const t of txs) {
    const type = String(t.type || "SEM_TYPE");
    byType[type] = (byType[type] || 0) + Math.abs(Number(t.amount || 0));

    const desc = String(t.description || "");
    const cat = String(t.category || "Sem categoria");

    if (type === "expense") {
      byCategoryExpense[cat] = (byCategoryExpense[cat] || 0) + Math.abs(Number(t.amount || 0));
    }

    if (
      type !== "expense" &&
      !["income", "transfer"].includes(type)
    ) {
      suspicious.push(t);
    }
  }

  console.log("\n===== TOTAL POR TYPE =====");
  Object.entries(byType)
    .sort((a,b) => b[1] - a[1])
    .forEach(([k,v]) => console.log(k, money(v)));

  console.log("\n===== GASTOS POR CATEGORIA RAW =====");
  Object.entries(byCategoryExpense)
    .sort((a,b) => b[1] - a[1])
    .forEach(([k,v]) => console.log(k, money(v)));

  console.log("\n===== SUSPEITOS SEM TYPE VALIDO =====");
  suspicious.forEach(t => console.log(t.id, t.date, t.type, t.category, money(t.amount), t.description));
})();
