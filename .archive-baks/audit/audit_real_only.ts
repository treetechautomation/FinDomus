import { getTransactions } from "./src/services/firestore";

function isRealExpense(t: any) {
  const cat = String(t.category || "").toLowerCase();

  if (cat.includes("financeiro")) return false;
  if (cat.includes("investimento")) return false;

  return t.type === "expense";
}

async function main() {
  const txs = await getTransactions();

  const real = txs.filter(isRealExpense);

  const total = real.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);

  console.log("TOTAL_REAL=", total.toFixed(2));
}

main();
