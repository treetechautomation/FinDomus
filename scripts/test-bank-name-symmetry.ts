// OFX.5 — FASE B — ETAPA 8/11 — Prova que o banco/processador da contraparte
// não determina mais a categoria. Antes do patch, o mesmo texto econômico
// ("Transferência recebida pelo Pix - PESSOA TESTE") produzia category
// DIFERENTE dependendo só de qual banco era citado (Santander/Bradesco/
// Itaú/Caixa/Banco Inter → "Outros" via barreira; Banco do Brasil/NU
// PAGAMENTOS, não cobertos pela antiga lista isBanco → "Recebimentos").
//
// Não depende de Firestore/rede.
//
// Execução: npx tsx scripts/test-bank-name-symmetry.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Recebimentos', keywords: ['transferencia recebida'], categoryType: 'income', createdAt: '' } as Category,
  { name: 'Transferência entre contas', keywords: ['transferencia'], categoryType: 'transfer', createdAt: '' } as Category,
];

function buildContext(): ClassificationContext {
  return { categories, accountIdentities: [], learningMap: new Map() };
}

const bancos = [
  'BCO SANTANDER (BRASIL) S.A.',
  'BCO BRADESCO S.A.',
  'ITAÚ UNIBANCO S.A.',
  'CAIXA ECONOMICA FEDERAL',
  'BANCO INTER',
  'BCO DO BRASIL S.A.',
  'NU PAGAMENTOS - IP',
];

let failures = 0;
console.log('OFX.5 FASE B — SIMETRIA: BANCO DA CONTRAPARTE NÃO DETERMINA CATEGORIA\n');

const results = bancos.map((banco) => {
  const text = `Transferência recebida pelo Pix - PESSOA TESTE - •••.000.000-•• - ${banco} Agência: 1 Conta: 1`;
  const r = classifyTransactionWithContext(text, 20, buildContext());
  console.log(`${banco.padEnd(28)} -> type=${r.type} category="${r.category}"`);
  return r;
});

const distinctCategories = new Set(results.map((r) => r.category));
const distinctTypes = new Set(results.map((r) => r.type));

console.log(`\nBANK_DEPENDENT_CATEGORY_DIFFERENCE = ${distinctCategories.size - 1} (esperado: 0)`);
console.log(`categorias distintas encontradas: ${JSON.stringify(Array.from(distinctCategories))}`);
console.log(`types distintos encontrados: ${JSON.stringify(Array.from(distinctTypes))}`);

if (distinctCategories.size === 1 && distinctTypes.size === 1) {
  console.log('\nPASS — mesma descrição financeira + 7 bancos diferentes -> mesma decisão semântica.');
} else {
  failures++;
  console.error('\nFAIL — resultado ainda depende do banco citado.');
}

console.log('');
if (failures > 0) {
  console.error(`${failures} caso(s) falharam.`);
  process.exit(1);
} else {
  console.log('Todos os casos passaram.');
}
