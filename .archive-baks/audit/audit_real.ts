import { getTransactions } from "./src/services/firestore";

function norm(v: any) {
  const s = String(v || "Sem categoria").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function main() {
  const txs = await getTransactions();
  const expenses = txs.filter((t: any) => t.type === "expense");

  const byCat: Record<string, number> = {};
  let total = 0;

  for (const t of expenses) {
    const value = Math.abs(Number(t.amount || 0));
    const cat = norm(t.category);

    total += value;
    byCat[cat] = (byCat[cat] || 0) + value;
  }

  const chartSum = Object.values(byCat).reduce((a, b) => a + b, 0);

  console.log("TOTAL_GERAL=", total.toFixed(2));
  console.log("SOMA_CATEGORIAS=", chartSum.toFixed(2));
  console.log("DIFERENCA=", (total - chartSum).toFixed(2));

  Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, value]) => {
      console.log(`${cat}= ${value.toFixed(2)}`);
    });
}

main();
