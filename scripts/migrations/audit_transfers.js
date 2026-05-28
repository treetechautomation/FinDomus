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

  let countPairId = 0;
  const statusCount = { accepted: 0, ignored: 0, pending: 0, none: 0 };
  
  const transfers = txs.filter(t => t.type === 'transfer');
  const possibleTransfers = txs.filter(t => t.type !== 'transfer' && (
    String(t.description).toLowerCase().includes('ted') ||
    String(t.description).toLowerCase().includes('transferencia')
  ));

  // 1 & 2
  for (const t of transfers) {
    if (t.transferPairId) countPairId++;
    const status = t.transferReviewStatus || 'none';
    statusCount[status] = (statusCount[status] || 0) + 1;
  }

  // 3 & 4. Mesmos valores no mesmo dia
  const byDateAmount = {};
  for (const t of transfers) {
    const key = `${t.date}_${Math.abs(Number(t.amount))}`;
    if (!byDateAmount[key]) byDateAmount[key] = [];
    byDateAmount[key].push(t);
  }

  let sameDayAmountCount = 0;
  let possibleFalsePositives = 0;

  for (const [key, group] of Object.entries(byDateAmount)) {
    if (group.length > 1) {
      sameDayAmountCount += group.length;
      // Falso positivo: se todas saem da mesma entidade (PF/PJ) mas há mais saídas que entradas
      // Para auditar simplificadamente, se houver 3+ no mesmo dia/valor, é alto risco
      if (group.length > 2) possibleFalsePositives++;
    }
  }

  console.log("===== AUDITORIA DE RECONCILIAÇÃO =====");
  console.log(`1. Transações com transferPairId: ${countPairId}`);
  console.log(`2. Status: Aceitos (${statusCount.accepted}), Ignorados (${statusCount.ignored}), Pending (${statusCount.pending}), Nenhum (${statusCount.none})`);
  console.log(`3. Transferências mesmo valor no mesmo dia: ${sameDayAmountCount} transações agrupadas`);
  console.log(`4. Possíveis Falsos Positivos (Triplicadas no mesmo dia/valor): ${possibleFalsePositives} grupos`);
  console.log(`5. Possíveis income/expense que deveriam ser transfer: ${possibleTransfers.length} transações`);
  
  if (possibleTransfers.length > 0) {
    console.log("\nExemplos de possíveis transfers perdidos:");
    possibleTransfers.slice(0, 5).forEach(t => {
      console.log(`  - ${t.date} | ${t.type} | ${money(t.amount)} | ${t.description}`);
    });
  }

})();
