// OFX.4 — FASE B.2 — ETAPA 9/10/11 — Compatibilidade de LEITURA entre
// fingerprint legado (PDF/CSV, curto) e fingerprint verboso (OFX Nubank).
// Reproduz o caso real de Rosilene de Jesus e valida que a redução por
// boilerplate conhecido não corrompe nem colide com os demais aprendizados
// reais do usuário (dump read-only da Fase B.1).
//
// Não depende de Firestore/rede.
//
// Execução: npx tsx scripts/test-fingerprint-compatibility.ts

import {
  classifyTransactionWithContext,
  type ClassificationContext,
} from '../src/core/finance/transaction-classifier';
import { buildLearningFingerprint } from '../src/core/finance/category-learning-engine';
import type { Category } from '../src/services/firestore/categories';

const categories: Category[] = [
  { name: 'Serviços domésticos', keywords: ['diarista', 'faxina'], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Educacao', keywords: [], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Prestacao de contas', keywords: [], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Compras', keywords: [], categoryType: 'expense', createdAt: '' } as Category,
  { name: 'Alimentacao', keywords: [], categoryType: 'expense', createdAt: '' } as Category,
];

// Dump real (read-only, Fase B.1) dos 9 documentos de category_learning deste
// usuário — reproduzido aqui como fixture, sem tocar Firestore.
const REAL_LEARNING_DUMP: { fingerprint: string; category: string; originalDescription: string }[] = [
  { fingerprint: 'ig sunoresearch parcela de', category: 'Educacao', originalDescription: 'IG*SUNORESEARCH - Parcela 5 de 12' },
  { fingerprint: 'luiz andre de souza', category: 'Prestacao de contas', originalDescription: 'Luiz André de Souza' },
  { fingerprint: 'joselia maranhao silva de', category: 'Servicos domesticos', originalDescription: '09/04 10:42 Joselia Maranhão Silva de' },
  { fingerprint: 'ifd diego fernando alv', category: 'Prestacao de contas', originalDescription: 'Ifd*Diego Fernando Alv' },
  { fingerprint: 'marineuda nogueira da sil', category: 'Prestacao de contas', originalDescription: '01/04 11:01 Marineuda Nogueira da Sil' },
  { fingerprint: 'cellairis plaza n parcela de', category: 'Compras', originalDescription: 'CELLAIRIS PLAZA N - Parcela 3 de 10' },
  { fingerprint: 'rosilene de jesus', category: 'Servicos domesticos', originalDescription: '30/04 07:14 ROSILENE DE JESUS' },
  { fingerprint: 'thalita brito soares chaves', category: 'Prestacao de contas', originalDescription: 'THALITA BRITO SOARES CHAVES' },
  { fingerprint: 'ifd le depanneur pla', category: 'Alimentacao', originalDescription: 'Ifd*Le Depanneur - Pla' },
];

function buildContext(): ClassificationContext {
  const learningMap = new Map<string, string>();
  for (const d of REAL_LEARNING_DUMP) learningMap.set(d.fingerprint, d.category);
  return { categories, accountIdentities: [], learningMap };
}

console.log('OFX.4 FASE B.2 — COMPATIBILIDADE DE FINGERPRINT (LEITURA)\n');

// --- Etapa 10: risco de colisão nos 9 fingerprints reais ---
const seen = new Map<string, number>();
for (const d of REAL_LEARNING_DUMP) {
  seen.set(d.fingerprint, (seen.get(d.fingerprint) || 0) + 1);
}
const duplicates = Array.from(seen.entries()).filter(([, c]) => c > 1);
console.log(`DUPLICATE_FINGERPRINTS entre os 9 reais: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.error('BLOQUEADO: existe colisão de fingerprint legado — fallback NÃO deve ser aplicado automaticamente.');
  duplicates.forEach(([fp, c]) => console.error(`  "${fp}" x${c}`));
  process.exit(1);
}
console.log('Nenhuma colisão encontrada — seguro aplicar fallback de leitura.\n');

let failures = 0;

// --- Etapa 11: Rosilene deve ser recuperada via fingerprint reduzido ---
{
  const desc = 'Transferência enviada pelo Pix - Rosilene de Jesus (Transferência enviada)';
  const amount = -200;
  const fpVerbose = buildLearningFingerprint(desc);
  const fpStored = 'rosilene de jesus';
  console.log('fingerprint verboso (OFX):', JSON.stringify(fpVerbose));
  console.log('fingerprint armazenado (legado):', JSON.stringify(fpStored));
  console.log('bate direto?', fpVerbose === fpStored, '(esperado: false — por isso precisa do fallback)\n');

  const result = classifyTransactionWithContext(desc, amount, buildContext());
  const pass = result.category === 'Servicos domesticos' && result.type === 'expense';
  if (pass) {
    console.log(`PASS — Rosilene recuperada via fallback de fingerprint legado: type=${result.type} category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — Rosilene NÃO recuperada: type=${result.type} category="${result.category}"`);
  }
}

// --- Os outros 8 aprendizados não usam boilerplate de Pix — não devem ser afetados pelo fallback ---
{
  const desc = 'Luiz André de Souza';
  const result = classifyTransactionWithContext(desc, -100, buildContext());
  const pass = result.category === 'Prestacao de contas';
  if (pass) {
    console.log(`PASS — aprendizado legado sem boilerplate (Luiz André de Souza) continua batendo direto: category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — Luiz André de Souza: category="${result.category}"`);
  }
}

// --- Texto sem nenhum aprendizado correspondente não deve casar por acidente ---
{
  const desc = 'Transferência enviada pelo Pix - Pessoa Desconhecida Qualquer (Transferência enviada)';
  const result = classifyTransactionWithContext(desc, -50, buildContext());
  const pass = result.category === 'Outros';
  if (pass) {
    console.log(`PASS — pessoa sem aprendizado não colide com nenhum fingerprint reduzido: category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — colisão inesperada: category="${result.category}"`);
  }
}

// --- Fingerprint verboso, quando já bate direto (não precisa de fallback), continua funcionando normalmente ---
{
  const desc = 'IG*SUNORESEARCH - Parcela 6 de 12';
  const result = classifyTransactionWithContext(desc, -50, buildContext());
  const pass = result.category === 'Educacao';
  if (pass) {
    console.log(`PASS — match direto (sem boilerplate de Pix) segue funcionando: category="${result.category}"`);
  } else {
    failures++;
    console.error(`FAIL — IG*SUNORESEARCH: category="${result.category}"`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`${failures} caso(s) falharam.`);
  process.exit(1);
} else {
  console.log('Todos os casos passaram.');
}
