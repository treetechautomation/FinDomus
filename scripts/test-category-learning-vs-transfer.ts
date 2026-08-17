// OFX.4 — FASE B — ETAPA 2 — Aprendizado explícito × heurística textual de transferência.
// Reproduz o caso real encontrado na auditoria (Fase A): "Rosilene de Jesus" tem uma
// regra ensinada em category_learning (categoria "Servicos domesticos", learnCount=2),
// mas a transação real do OFX de julho/2026 diz "Transferência enviada pelo Pix -
// Rosilene de Jesus (Transferência enviada)" — texto que, antes do patch, acionava
// isTransfer() e descartava o aprendizado.
//
// Não depende de Firestore/rede: injeta o learningMap sintético diretamente no
// ClassificationContext, do mesmo jeito que buildClassificationContext() faria
// depois de consultar category_learning.
//
// Execução: npx tsx scripts/test-category-learning-vs-transfer.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import { buildLearningFingerprint } from '../src/core/finance/category-learning-engine';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Serviços domésticos', keywords: ['diarista', 'faxina'], categoryType: 'expense', createdAt: new Date().toISOString() } as Category,
  { name: 'Transferência entre contas', keywords: ['transferencia', 'transferencia entre contas', 'transf', 'ted', 'doc'], categoryType: 'transfer', createdAt: new Date().toISOString() } as Category,
];

function buildContext(): ClassificationContext {
  const learningMap = new Map<string, string>();
  // Fingerprint real observado no Firestore de produção (category_learning),
  // ensinado 2x pelo usuário — ver OFX.4 Fase A, Etapa 24.
  const fingerprint = buildLearningFingerprint('transferencia enviada pelo pix rosilene de jesus transferencia enviada');
  learningMap.set(fingerprint, 'Servicos domesticos');
  return { categories, accountIdentities: [], learningMap };
}

type Case = {
  label: string;
  description: string;
  amount: number;
  expectCategory: string;
  expectType: 'income' | 'expense' | 'transfer';
};

const cases: Case[] = [
  {
    label: 'REPRODUÇÃO DO CASO REAL — Rosilene de Jesus deve usar a categoria ensinada, não "Transferência"',
    description: 'Transferência enviada pelo Pix - Rosilene de Jesus (Transferência enviada)',
    amount: -200,
    expectCategory: 'Servicos domesticos',
    expectType: 'expense',
  },
  {
    label: 'Sem aprendizado para esse texto, "transferência" genérica não decide category sozinha (cai em Outros)',
    description: 'Transferência enviada pelo Pix - Fulano de Tal Desconhecido (Transferência enviada)',
    amount: -50,
    expectCategory: 'Outros',
    expectType: 'expense',
  },
];

let failures = 0;

console.log('OFX.4 FASE B — APRENDIZADO × TRANSFERÊNCIA GENÉRICA\n');

// Prova adicional: o fingerprint da transação bate exatamente com o aprendido,
// mesmo com a palavra "transferência" (mecanismo) presente no texto.
const fp = buildLearningFingerprint('Transferência enviada pelo Pix - Rosilene de Jesus (Transferência enviada)');
console.log('fingerprint calculado:', fp);
console.log('bate com o fingerprint aprendido?', buildContext().learningMap.has(fp) ? 'SIM' : 'NÃO');
console.log('');

for (const c of cases) {
  const result = classifyTransactionWithContext(c.description, c.amount, buildContext());
  const okCategory = result.category === c.expectCategory;
  const okType = result.type === c.expectType;

  if (okCategory && okType) {
    console.log(`PASS — ${c.label}`);
    console.log(`       type=${result.type} category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — ${c.label}`);
    console.error(`       esperado: type=${c.expectType} category="${c.expectCategory}"`);
    console.error(`       obtido:   type=${result.type} category="${result.category}"`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures}/${cases.length} casos falharam.`);
  process.exit(1);
} else {
  console.log(`${cases.length}/${cases.length} casos passaram.`);
}
