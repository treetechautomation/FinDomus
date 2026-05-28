const rules = [
  { match: /marina|ubiratan|marineuda|saulo/i, category: "Acertos pessoais" },
  { match: /pop/i, category: "Transporte" },
];

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

(async () => {
  const snap = await getDocs(collection(db, "transactions"));

  let count = 0;

  snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(t => t.type === "expense")
    .filter(t => String(t.category || "").trim().toLowerCase() === "outros")
    .forEach(t => {
      const text = `${t.description || ""} ${t.merchant || ""}`;
      const rule = rules.find(r => r.match.test(text));
      if (!rule) return;

      count++;
      console.log("ALTERAR:", t.date, t.amount, `"${t.category}" -> "${rule.category}"`, t.description);
    });

  console.log("TOTAL:", count);
})();
