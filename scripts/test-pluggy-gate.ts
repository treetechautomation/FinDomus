// CLASSIFIER.3 — FASE B — ETAPA 8: Pluggy gate (somente leitura).
//
// Prova a consistência entre o `type` calculado INTERNAMENTE pelo classificador
// (usado pela barreira central) e o `type` FINAL usado pelo sync-service.ts:
//
//   sync-service.ts:568  ->  type = pTx.type === 'DEBIT' ? 'expense' : 'income'
//
// Convenção Pluggy: DEBIT => amount negativo; CREDIT => amount positivo.
// O classificador recebe pTx.amount CRU (sinal preservado) e deriva:
//   inferred?.type || (amount >= 0 ? 'income' : 'expense')
//
// Execução: npx tsx scripts/test-pluggy-gate.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Receita de Serviços', keywords: ['receita de servicos'], createdAt: new Date().toISOString(), categoryType: 'income' },
  { name: 'Supermercado', keywords: ['supermercado'], createdAt: new Date().toISOString(), categoryType: 'expense' },
];

function buildContext(): ClassificationContext {
  return { categories, accountIdentities: [], learningMap: new Map() };
}

type GateCase = {
  label: string;
  pluggyType: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
};

const cases: GateCase[] = [
  { label: 'P1 — Pluggy CREDIT / amount positivo (receita)', pluggyType: 'CREDIT', amount: 100, description: 'Receita de Serviços' },
  { label: 'P2 — Pluggy DEBIT / amount negativo (despesa)', pluggyType: 'DEBIT', amount: -100, description: 'Supermercado' },
];

let failures = 0;

for (const c of cases) {
  const classified = classifyTransactionWithContext(c.description, c.amount, buildContext());
  const pluggyFinalType = c.pluggyType === 'DEBIT' ? 'expense' : 'income';

  const ok =
    classified.type === pluggyFinalType &&
    classified.category !== 'Outros';

  console.log(
    `${ok ? 'PASS' : 'FAIL'} — ${c.label}: classifier.type=${classified.type} pluggyFinal.type=${pluggyFinalType} category="${classified.category}"`
  );
  if (!ok) failures++;
}

console.log('');
console.log('NOTA (edge case documentado, pré-existente e NÃO regressivo):');
console.log('  Se pTx.type e o sinal de pTx.amount divergirem (anomalia), ou se');
console.log('  inferCategoryFromDescription forçar type (ex.: "rendimento" => income)');
console.log('  num DEBIT, classifier.type pode diferir do type final do Pluggy. Nesse');
console.log('  caso a barreira central usa o type interno, e o Pluggy sobrescreve o');
console.log('  type depois — idêntico ao comportamento anterior a CLASSIFIER.3 (o');
console.log('  sync-service.ts nunca teve barreira e sempre derivou type de pTx.type).');

if (failures > 0) process.exit(1);
