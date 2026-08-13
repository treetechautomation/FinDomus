// CLASSIFIER.3 — FASE B — ETAPA 14/15: regressão CSV e PDF/texto (somente leitura).
//
// Executa os parsers REAIS (parseNubankCSV e parseBankStatementText). Essas funções
// chamam buildClassificationContext() internamente usando o SDK CLIENTE (db de
// @/lib/firebase); em execução Node sem usuário autenticado isso resulta em
// permission-denied e contexto VAZIO (categories=[]), ou seja, a BARREIRA CENTRAL
// NÃO é exercitada aqui (sem categoryType disponível).
//
// A barreira em si é validada separadamente por:
//   - scripts/test-transaction-classifier-category-type.ts  (matriz A..I, 9/9)
//   - scripts/test-ofx-real-context.ts                      (contexto admin real)
// Este script apenas comprova que os parsers CSV/PDF não regrediram na ESTRUTURA
// (retornam transações válidas, sem crash, com type/category coerentes).
//
// Execução:
//   set -a && source .env && set +a && npx tsx scripts/test-csv-pdf-regression.ts

import { parseNubankCSV, parseBankStatementText } from '../src/core/finance/invoice-parser';

const CSV_FIXTURE = [
  'Data;Descrição;Valor',
  '01/08/2026;Supermercado ABC;-100,00',
  '02/08/2026;Salário recebido;5000,00',
  '03/08/2026;Compra custom sem tipo;-30,00',
].join('\n');

const TEXT_FIXTURE = [
  '01/08/2026 Supermercado ABC 100,00 (-)',
  '02/08/2026 Recebimento de cliente 5000,00 (+)',
  '03/08/2026 Despesa generica 30,00 (-)',
].join('\n');

async function main() {
  console.log('=== CSV (parseNubankCSV) ===');
  const csv = await parseNubankCSV(CSV_FIXTURE, 'csv-regression-nonexistent-user');
  console.log(`transações: ${csv.length}`);
  csv.forEach((t) =>
    console.log(`  date=${t.date} type=${t.type} category="${t.category}" amount=${t.amount}`)
  );

  console.log('\n=== PDF/texto (parseBankStatementText) ===');
  const txt = await parseBankStatementText(TEXT_FIXTURE, 'pdf-regression-nonexistent-user');
  console.log(`transações: ${txt.length}`);
  txt.forEach((t) =>
    console.log(`  date=${t.date} type=${t.type} category="${t.category}" amount=${t.amount}`)
  );

  console.log('\nNOTA: contexto vazio (SDK cliente sem auth em Node) — barreira não exercitada aqui.');
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
