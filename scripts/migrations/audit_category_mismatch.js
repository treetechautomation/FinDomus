const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
require("dotenv").config();

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

const rules = [
  { match: /bradesco saude|bradesco saúde|plano de saude|plano de saúde|amil|sulamerica/i, expected: "Plano de saúde" },
  { match: /fibra|internet|oi fibra|vivo fibra|claro net|nio fibra/i, expected: "Internet" },
  { match: /cobrança referente|cobranca referente/i, expected: "Serviços" },
  { match: /posto|gasolina|etanol|diesel|shell|ipiranga|petrobras/i, expected: "Combustível" },
  { match: /supermercado|mercado|guanabara|panamil|assai|atacadao|atacadão/i, expected: "Supermercado" },
  { match: /farmacia|farmácia|drogaria|raia|pacheco|drogasil/i, expected: "Farmácia" },
  { match: /ampla|enel|light|energia/i, expected: "Energia" },
];

(async () => {
  const snap = await getDocs(collection(db, "transactions"));
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  let count = 0;

  rows
    .filter(t => t.type === "expense")
    .forEach(t => {

      // PANAMIL_IGNORE (supermercado correto)
      if ((t.description || '').toLowerCase().includes('panamil')) return;
      const text = `${t.description || ""} ${t.merchant || ""}`;
      const category = String(t.category || "").trim();
      const rule = rules.find(r => r.match.test(text));

      if (rule && category !== rule.expected) {
        count++;
        console.log(
          "MISMATCH:",
          t.id,
          "|", t.date,
          "|", t.amount,
          "| atual:", category,
          "| esperado:", rule.expected,
          "| desc:", t.description
        );
      }
    });

  console.log("TOTAL_MISMATCH:", count);
})();
