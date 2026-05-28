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
  const snap = await getDocs(collection(db, "liabilities"));
  const allLiabilities = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Regra exata usada no UI do PassivosPage
  const activeLiabilities = allLiabilities.filter((item) => {
    const total = Number(item.totalInstallments || 0);
    const current = Number(item.currentInstallment || 0);
    const balance = Number(item.remainingBalance || 0);
    return total > 0 && current < total && balance > 0;
  });

  const totalLiabilities = activeLiabilities.reduce((sum, item) => sum + Number(item.remainingBalance || 0), 0);

  // top 20 liabilities por remainingBalance
  const top20 = [...activeLiabilities].sort((a,b) => Number(b.remainingBalance || 0) - Number(a.remainingBalance || 0)).slice(0, 20);

  // possíveis duplicados (mesmo nome, mesmo institution, mesmo installmentValue)
  const duplicates = [];
  const map = {};
  for(const item of activeLiabilities) {
    const key = `${item.name}-${item.institution}-${item.installmentValue}`;
    if(map[key]) {
      duplicates.push({ a: map[key], b: item });
    } else {
      map[key] = item;
    }
  }

  // possíveis parcelas infinitas (totalInstallments == 999 ou muito alto > 360)
  const infinitas = activeLiabilities.filter(i => Number(i.totalInstallments || 0) > 360);

  // liabilities com currentInstallment > totalInstallments
  const currentMaiorQueTotal = allLiabilities.filter(i => Number(i.currentInstallment || 0) > Number(i.totalInstallments || 0) && Number(i.totalInstallments || 0) > 0);

  // liabilities sem totalInstallments
  const semTotalInstallments = allLiabilities.filter(i => !i.totalInstallments);

  // liabilities sem remainingBalance
  const semRemainingBalance = allLiabilities.filter(i => !i.remainingBalance);

  // liabilities com installmentValue incompatível (>30% diferença entre calculado e real para absorver juros)
  const incompativeis = activeLiabilities.filter(item => {
     const parcelasRestantes = Number(item.totalInstallments || 0) - Number(item.currentInstallment || 0);
     const calc = parcelasRestantes * Number(item.installmentValue || 0);
     const diff = Math.abs(calc - Number(item.remainingBalance || 0));
     return diff > Number(item.remainingBalance || 0) * 0.3;
  });

  console.log("===== AUDITORIA DE PASSIVOS (READ-ONLY) =====");
  console.log("Soma Total Validada (Total Comprometido):", money(totalLiabilities));
  
  console.log("\n===== TOP 20 LIABILITIES POR REMAINING BALANCE =====");
  top20.forEach(i => console.log(` - ${i.name} (${i.institution}): ${money(i.remainingBalance)} | Parcela: ${i.currentInstallment}/${i.totalInstallments} de ${money(i.installmentValue)}`));

  console.log("\n===== POSSÍVEIS DUPLICADOS =====");
  console.log("Encontrados:", duplicates.length);
  duplicates.forEach(d => console.log(` - ${d.a.name} (${d.a.institution}) [${money(d.a.installmentValue)}] -> ID1: ${d.a.id} vs ID2: ${d.b.id}`));

  console.log("\n===== PARCELAS INFINITAS (> 360 MESES) =====");
  console.log("Encontrados:", infinitas.length);
  infinitas.forEach(i => console.log(` - ${i.name}: ${i.totalInstallments} parcelas`));

  console.log("\n===== CURRENT > TOTAL =====");
  console.log("Encontrados:", currentMaiorQueTotal.length);
  currentMaiorQueTotal.forEach(i => console.log(` - ${i.name}: ${i.currentInstallment}/${i.totalInstallments}`));

  console.log("\n===== INCOMPLETOS =====");
  console.log("Sem totalInstallments:", semTotalInstallments.length);
  console.log("Sem remainingBalance:", semRemainingBalance.length);

  console.log("\n===== INCOMPATIBILIDADE DE SALDO (DIFERENÇA > 30%) =====");
  console.log("Encontrados:", incompativeis.length);
  incompativeis.forEach(i => {
     const parcelasRestantes = Number(i.totalInstallments || 0) - Number(i.currentInstallment || 0);
     const calc = parcelasRestantes * Number(i.installmentValue || 0);
     console.log(` - ${i.name}: Cadastrado ${money(i.remainingBalance)} vs Calculado ${money(calc)} (${parcelasRestantes} parcelas restantes)`);
  });

})();
