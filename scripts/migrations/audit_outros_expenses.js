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
  const rows = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.type === "expense")
    .filter(t => String(t.category || "").trim().toLowerCase() === "outros")
    .sort((a,b) => Math.abs(Number(b.amount || 0)) - Math.abs(Number(a.amount || 0)));

  console.log("QTD_OUTROS:", rows.length);
  console.log("TOTAL_OUTROS:", money(rows.reduce((s,t) => s + Math.abs(Number(t.amount || 0)), 0)));

  for (const t of rows) {
    console.log(`${t.id} | ${t.date} | ${money(t.amount)} | ${t.description} | merchant=${t.merchant || "-"}`);
  }
})();
