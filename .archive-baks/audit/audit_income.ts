import { getTransactions } from "./src/services/firestore";

function money(v: any) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function main() {
  const txs = await getTransactions();

  const incomes = txs
    .filter((t: any) => t.type === "income")
    .sort((a: any, b: any) => String(b.date || "").localeCompare(String(a.date || "")));

  console.log("TOTAL_RECEITAS=", money(incomes.reduce((s: number, t: any) => s + Number(t.amount || 0), 0)));
  console.log("QTD_RECEITAS=", incomes.length);

  console.log("\n===== RECEITAS =====");
  for (const t of incomes) {
    console.log([
      t.date,
      money(t.amount),
      `categoria=${t.category || "-"}`,
      `descricao=${t.description || "-"}`,
      `merchant=${t.merchant || "-"}`,
      `id=${t.id}`,
    ].join(" | "));
  }
}

main();
