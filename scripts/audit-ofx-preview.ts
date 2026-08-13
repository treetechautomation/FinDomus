// OFX.3-R — Auditoria determinística do pipeline OFX real, sem UI e sem persistência.
// Importa e executa o código de PRODUÇÃO (parseOFX, resolveOfxTransaction, buildImportPreview,
// buildClassificationContext) contra o arquivo real. Não reimplementa nenhuma regra de
// classificação — a única lógica local aqui é extração de tags só para fins de exibição
// (rótulo dos blocos de saldo descartados), nunca para decidir type/category.
//
// Execução:
//   set -a && source .env && set +a && npx tsx scripts/audit-ofx-preview.ts <caminho-do-ofx>

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import {
  parseOFX,
  resolveOfxTransaction,
} from '../src/core/finance/ofx-parser';
import { buildClassificationContext } from '../src/core/finance/transaction-classifier';
import { buildImportPreview } from '../src/core/imports/build-import-preview';
import { DEFAULT_CATEGORY_CATALOG } from '../src/core/finance/default-category-catalog';

const AUDIT_USER_ID = 'ofx-audit-readonly-nonexistent-user';

function money(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Extração de tag só para RÓTULO no relatório (não decide classificação nenhuma).
function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}>([^<\r\n]*)`));
  return m ? m[1].trim() : '';
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: npx tsx scripts/audit-ofx-preview.ts <caminho-do-ofx>');
    process.exit(1);
  }

  const buffer = readFileSync(filePath);
  const text = buffer.toString('utf-8');
  const sha256 = createHash('sha256').update(buffer).digest('hex');

  console.log('=== ETAPA 1 — ARQUIVO ===');
  console.log('caminho:', filePath);
  console.log('tamanho:', buffer.length, 'bytes');
  console.log('sha256:', sha256);

  const rawBlocks = text.split('<STMTTRN>').slice(1);
  console.log('blocos <STMTTRN> brutos:', rawBlocks.length);

  console.log('\n=== ETAPA 2/3 — PIPELINE REAL (parseOFX -> buildImportPreview) ===');
  const context = await buildClassificationContext(AUDIT_USER_ID);
  const transactions = await parseOFX(text, AUDIT_USER_ID);
  const preview = buildImportPreview(transactions);

  console.log('movimentações retornadas por parseOFX:', transactions.length);

  console.log('\n=== DIAGNÓSTICO POR BLOCO BRUTO (resolveOfxTransaction, mesma função real) ===');
  const discarded: { index: number; fitId: string; name: string; memo: string; reason: string }[] = [];
  rawBlocks.forEach((block, i) => {
    const result = resolveOfxTransaction(block, context);
    if (!result) {
      discarded.push({
        index: i + 1,
        fitId: tag(block, 'FITID'),
        name: tag(block, 'NAME'),
        memo: tag(block, 'MEMO'),
        reason: 'descartado por resolveOfxTransaction (saldo ou sem date/amount)',
      });
    }
  });
  console.log('blocos descartados:', discarded.length);
  discarded.forEach((d) =>
    console.log(`  #${d.index} FITID="${d.fitId}" NAME="${d.name}" MEMO="${d.memo}"`)
  );

  console.log('\n=== ETAPA 3 — TABELA DAS MOVIMENTAÇÕES (payload real do preview) ===');
  const catTypeMap = new Map(
    DEFAULT_CATEGORY_CATALOG.filter(
      (c) => c.categoryType === 'income' || c.categoryType === 'expense'
    ).map((c) => [c.name.toLowerCase(), c.categoryType])
  );

  preview.rows.forEach((row, i) => {
    const t = row.transaction;
    const sign = t.type === 'income' ? '+' : '-';
    console.log(
      `#${i + 1} | FITID=${t.externalId || '(vazio)'} | date=${t.date} | desc="${t.description}" | amount=${t.amount} | type=${t.type} | category="${t.category}" | sinal=${sign} | valor=${sign} ${money(Math.abs(t.amount))}`
    );
  });

  console.log('\n=== ETAPA 5/6 — CASOS CRÍTICOS ===');
  const caso1 = transactions.find((t: any) => t.externalId === '600.803.400.049.800');
  const caso2 = transactions.find((t: any) => t.externalId === '18.429');
  console.log('FITID 600.803.400.049.800:', caso1 ? JSON.stringify(caso1) : 'NÃO ENCONTRADO');
  console.log('FITID 18.429:', caso2 ? JSON.stringify(caso2) : 'NÃO ENCONTRADO');

  console.log('\n=== ETAPA 7 — TOTAIS (buildImportPreview.totals, baseado em type+amount) ===');
  console.log(JSON.stringify(preview.totals, null, 2));

  console.log('\n=== ETAPA 8 — TRANSFERS ===');
  const transfers = transactions.filter((t: any) => t.type === 'transfer');
  console.log('quantidade type=transfer:', transfers.length);
  transfers.forEach((t: any) =>
    console.log(`  FITID=${t.externalId} desc="${t.description}" amount=${t.amount}`)
  );

  console.log('\n=== ETAPA 9 — CATEGORIA × TYPE ===');
  let inconsistencies = 0;
  transactions.forEach((t: any) => {
    const known = catTypeMap.get(String(t.category).toLowerCase());
    if (known && (t.type === 'income' || t.type === 'expense') && known !== t.type) {
      inconsistencies++;
      console.log(`  INCONSISTENTE: FITID=${t.externalId} category="${t.category}" (catálogo=${known}) type=${t.type}`);
    }
  });
  console.log('inconsistências encontradas:', inconsistencies);

  console.log('\n=== ETAPA 11 — DATAS (DTPOSTED vs MEMO) ===');
  rawBlocks.forEach((block, i) => {
    const dtposted = tag(block, 'DTPOSTED');
    const memo = tag(block, 'MEMO');
    const memoHasDate = /\b\d{2}\/\d{2}\b/.test(memo);
    if (memoHasDate) {
      const dtDay = dtposted.slice(6, 8);
      const dtMonth = dtposted.slice(4, 6);
      const memoDateMatch = memo.match(/\b(\d{2})\/(\d{2})\b/);
      const differs = memoDateMatch && (memoDateMatch[1] !== dtDay || memoDateMatch[2] !== dtMonth);
      console.log(
        `  #${i + 1} FITID="${tag(block, 'FITID')}" DTPOSTED=${dtposted.slice(0, 8)} MEMO="${memo}" ${differs ? '<-- DIVERGE' : '(igual)'}`
      );
    }
  });

  console.log('\n=== FIRESTORE ===');
  console.log('confirmImport chamado? NÃO');
  console.log('addTransactionsBatch chamado? NÃO');
  console.log('setDoc/addDoc/batch.commit chamado? NÃO');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
