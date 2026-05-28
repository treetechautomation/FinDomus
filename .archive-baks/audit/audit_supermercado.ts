import { getTransactions } from "./src/services/firestore";

function n(v: any) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function main() {
  const txs = await getTransactions();

  const items = txs
    .filter((t: any) => t.type === "expense")
    .filter((t: any) => n(t.category).includes("supermercado") || n(t.description).includes("superm"))
    .map((t: any) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.category,
      merchant: t.merchant,
      amount: t.amount,
    }));

  console.table(items);

  const total = items.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);
  console.log("TOTAL_SUPERMERCADO_MATCH=", total.toFixed(2));
}

main();
