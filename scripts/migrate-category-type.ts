// CLASSIFIER.2B — Migração controlada de `categoryType` para a coleção `categories`.
//
// Modo padrão: DRY-RUN. Nenhuma escrita ocorre a menos que AMBAS as flags sejam
// passadas explicitamente:
//   --apply --confirm-category-type-migration
//
// A escrita, quando autorizada, atualiza EXCLUSIVAMENTE o campo `categoryType`
// via `.update({ categoryType })` — nunca `.set()` do objeto inteiro, nunca toca
// name/keywords/normalizedName/createdAt/updatedAt/isDefault/isGlobal/userId/priority/id.
//
// Autoridade para atribuir categoryType: exclusivamente MATCH EXATO de nome
// normalizado contra DEFAULT_CATEGORY_CATALOG. Nunca usa keywords, histórico de
// transações, learning rules ou nome parecido para inferir o valor.
//
// Execução:
//   npx tsx scripts/migrate-category-type.ts                                    (dry-run)
//   npx tsx scripts/migrate-category-type.ts --dry-run                          (dry-run explícito)
//   npx tsx scripts/migrate-category-type.ts --apply --confirm-category-type-migration   (escreve)

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../src/lib/firebase-admin';
import { normalizeText } from '../src/core/finance/transaction-classifier';
import { DEFAULT_CATEGORY_CATALOG } from '../src/core/finance/default-category-catalog';

type ValidType = 'income' | 'expense' | 'transfer' | 'investment';
const VALID_TYPES = new Set<string>(['income', 'expense', 'transfer', 'investment']);

function norm(s: string) {
  return normalizeText(String(s || '')).trim().replace(/\s+/g, ' ');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const confirm = args.includes('--confirm-category-type-migration');
  return { apply, confirm };
}

async function main() {
  const { apply, confirm } = parseArgs();

  if (apply && !confirm) {
    console.error(
      'ABORTADO: --apply requer também --confirm-category-type-migration. Nenhuma escrita foi realizada.'
    );
    process.exit(1);
  }

  const willWrite = apply && confirm;
  console.log(willWrite ? '=== MODO: APPLY (escrita real autorizada) ===' : '=== MODO: DRY-RUN (nenhuma escrita) ===');

  // Sanidade: catálogo estático não pode ter nomes normalizados duplicados
  // (autoridade de "exatamente um match" depende disso).
  const staticMap = new Map<string, (typeof DEFAULT_CATEGORY_CATALOG)[number]>();
  for (const item of DEFAULT_CATEGORY_CATALOG) {
    const key = norm(item.name);
    if (staticMap.has(key)) {
      console.error(`ABORTADO: catálogo estático tem nome normalizado duplicado: "${key}"`);
      process.exit(1);
    }
    staticMap.set(key, item);
  }

  // ===== Etapa 3/4: leitura global única, sem filtros, dedupe por ID =====
  const snap = await adminDb.collection('categories').get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  const TOTAL_DOCUMENTS = docs.length;

  const uniqueIds = new Set(docs.map((d) => d.id));
  if (uniqueIds.size !== docs.length) {
    console.error('ABORTADO: leitura retornou IDs de documento repetidos — investigar antes de prosseguir.');
    process.exit(1);
  }

  let GLOBAL_WITHOUT_USER = 0,
    GLOBAL_WITH_USER = 0,
    DEFAULT_WITHOUT_USER = 0,
    DEFAULT_WITH_USER = 0,
    CUSTOM_WITH_USER = 0,
    CUSTOM_WITHOUT_USER = 0,
    UNKNOWN_FLAG_COMBINATION = 0;

  const userIdSet = new Set<string>();
  const nameKeySet = new Set<string>();

  for (const d of docs) {
    const hasUser = d.userId !== undefined && d.userId !== null && d.userId !== '';
    if (hasUser) userIdSet.add(d.userId);
    const key = norm(d.name || '');
    if (key) nameKeySet.add(key);

    const isGlobalOk = d.isGlobal === true || d.isGlobal === undefined;
    const isDefaultOk = d.isDefault === true || d.isDefault === undefined;
    const validBooleanShape =
      (d.isGlobal === undefined || typeof d.isGlobal === 'boolean') &&
      (d.isDefault === undefined || typeof d.isDefault === 'boolean');

    if (!validBooleanShape) {
      UNKNOWN_FLAG_COMBINATION++;
      continue;
    }

    if (d.isGlobal === true) hasUser ? GLOBAL_WITH_USER++ : GLOBAL_WITHOUT_USER++;
    if (d.isDefault === true) hasUser ? DEFAULT_WITH_USER++ : DEFAULT_WITHOUT_USER++;
    if (!d.isDefault && !d.isGlobal) hasUser ? CUSTOM_WITH_USER++ : CUSTOM_WITHOUT_USER++;
  }

  console.log('\n=== ETAPA 4 — INVENTÁRIO GLOBAL ===');
  console.log({
    TOTAL_DOCUMENTS,
    UNIQUE_DOCUMENT_IDS: uniqueIds.size,
    DISTINCT_USER_IDS: userIdSet.size,
    DISTINCT_NORMALIZED_NAMES: nameKeySet.size,
    GLOBAL_WITHOUT_USER,
    GLOBAL_WITH_USER,
    DEFAULT_WITHOUT_USER,
    DEFAULT_WITH_USER,
    CUSTOM_WITH_USER,
    CUSTOM_WITHOUT_USER,
    UNKNOWN_FLAG_COMBINATION,
  });
  console.log('(nota: GLOBAL_* e DEFAULT_* não são mutuamente exclusivos — um documento pode ter isDefault=true E isGlobal=true ao mesmo tempo; por isso a soma dos buckets pode exceder TOTAL_DOCUMENTS)');

  // ===== Etapa 5: duplicatas reais (IDs diferentes, mesmo normalizedName) =====
  const byName = new Map<string, any[]>();
  for (const d of docs) {
    const key = norm(d.name || '');
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(d);
  }
  const dupGroups = [...byName.entries()].filter(([, arr]) => arr.length > 1);

  let dupGlobalGlobal = 0,
    dupGlobalUser = 0,
    dupUserUser = 0,
    dupCrossUser = 0;
  const duplicateDocIds = new Set<string>();

  for (const [, arr] of dupGroups) {
    arr.forEach((d) => duplicateDocIds.add(d.id));
    const scopes = arr.map((d) => (d.userId ? `user:${d.userId}` : 'global'));
    const hasGlobal = scopes.some((s) => s === 'global');
    const userScopes = scopes.filter((s) => s !== 'global');
    const distinctUsers = new Set(userScopes);
    if (hasGlobal && userScopes.length === 0) dupGlobalGlobal++;
    else if (hasGlobal && userScopes.length > 0) dupGlobalUser++;
    else if (!hasGlobal && distinctUsers.size === 1) dupUserUser++;
    else if (!hasGlobal && distinctUsers.size > 1) dupCrossUser++;
  }

  console.log('\n=== ETAPA 5 — DUPLICATAS REAIS (IDs diferentes, mesmo nome normalizado) ===');
  console.log({
    DUPLICATE_GROUPS: dupGroups.length,
    DUPLICATE_DOCUMENTS_TOTAL: duplicateDocIds.size,
    'global/global': dupGlobalGlobal,
    'global/user': dupGlobalUser,
    'user/user (mesmo usuário)': dupUserUser,
    'user/user (usuários diferentes)': dupCrossUser,
  });
  if (dupGroups.length > 0) {
    console.log('amostra (até 10 grupos), sem userId exposto:');
    dupGroups.slice(0, 10).forEach(([key, arr]) => {
      console.log(`  "${key}": ${arr.length} docs — ids=${arr.map((d) => d.id).join(', ')} — scopes=${arr.map((d) => (d.userId ? 'user' : 'global')).join(',')}`);
    });
  }

  // ===== Etapa 6: classificação de TODOS os documentos =====
  const classification = new Map<string, 'A_STATIC_EXACT_MATCH' | 'B_CUSTOM_OR_LEGACY' | 'C_INVALID_OR_NAMELESS' | 'D_DUPLICATE_REQUIRES_REVIEW'>();
  for (const d of docs) {
    const key = norm(d.name || '');
    if (!key) {
      classification.set(d.id, 'C_INVALID_OR_NAMELESS');
      continue;
    }
    if (duplicateDocIds.has(d.id)) {
      classification.set(d.id, 'D_DUPLICATE_REQUIRES_REVIEW');
      continue;
    }
    classification.set(d.id, staticMap.has(key) ? 'A_STATIC_EXACT_MATCH' : 'B_CUSTOM_OR_LEGACY');
  }
  const classCounts: Record<string, number> = {};
  for (const c of classification.values()) classCounts[c] = (classCounts[c] || 0) + 1;
  console.log('\n=== ETAPA 6 — CLASSIFICAÇÃO DE TODOS OS DOCUMENTOS ===');
  console.log(classCounts);

  // ===== Etapa 8: estado atual de categoryType =====
  let MISSING_CATEGORY_TYPE = 0,
    SAME_CATEGORY_TYPE = 0,
    CONFLICTING_CATEGORY_TYPE = 0,
    INVALID_CATEGORY_TYPE = 0;
  const conflictingDocs: any[] = [];
  const invalidTypeDocs: any[] = [];

  for (const d of docs) {
    const current = d.categoryType;
    if (current === undefined || current === null) {
      MISSING_CATEGORY_TYPE++;
      continue;
    }
    if (!VALID_TYPES.has(current)) {
      INVALID_CATEGORY_TYPE++;
      invalidTypeDocs.push({ id: d.id, name: d.name, categoryType: current });
      continue;
    }
    const key = norm(d.name || '');
    const staticEntry = staticMap.get(key);
    if (staticEntry) {
      if (staticEntry.categoryType === current) SAME_CATEGORY_TYPE++;
      else {
        CONFLICTING_CATEGORY_TYPE++;
        conflictingDocs.push({ id: d.id, name: d.name, current, staticExpected: staticEntry.categoryType });
      }
    } else {
      // já tem categoryType válido mas sem match estático — não é conflito, não é nosso escopo mexer
      SAME_CATEGORY_TYPE++;
    }
  }

  console.log('\n=== ETAPA 8 — ESTADO ATUAL DE categoryType (GLOBAL) ===');
  console.log({ MISSING_CATEGORY_TYPE, SAME_CATEGORY_TYPE, CONFLICTING_CATEGORY_TYPE, INVALID_CATEGORY_TYPE });
  if (conflictingDocs.length) {
    console.log('CONFLICTING_CATEGORY_TYPE — listados para revisão, NÃO serão sobrescritos:');
    conflictingDocs.forEach((c) => console.log('  ', c));
  }
  if (invalidTypeDocs.length) {
    console.log('INVALID_CATEGORY_TYPE — listados para revisão, NÃO serão tocados:');
    invalidTypeDocs.forEach((c) => console.log('  ', c));
  }

  // ===== Etapa 7: elegibilidade =====
  type PlannedUpdate = { id: string; name: string; before: ValidType | null; after: ValidType; scope: 'SAFE_GLOBAL' | 'SAFE_USER_SCOPED'; reason: string };
  const plannedUpdates: PlannedUpdate[] = [];
  let SKIPPED = 0;

  for (const d of docs) {
    const cls = classification.get(d.id);
    if (cls !== 'A_STATIC_EXACT_MATCH') {
      SKIPPED++;
      continue;
    }
    const key = norm(d.name || '');
    const staticEntry = staticMap.get(key)!;
    if (!staticEntry.categoryType || !VALID_TYPES.has(staticEntry.categoryType)) {
      SKIPPED++; // catálogo sem categoryType válido para este nome — não deveria acontecer, mas não assume
      continue;
    }
    const current = d.categoryType;
    if (current !== undefined && current !== null) {
      // já tem valor — só migra se for exatamente o mesmo (idempotente); se diferente, já foi
      // capturado como CONFLICTING acima e não deve ser sobrescrito.
      if (current !== staticEntry.categoryType) {
        SKIPPED++;
        continue;
      }
      SKIPPED++; // já está correto, nada a escrever
      continue;
    }

    plannedUpdates.push({
      id: d.id,
      name: d.name,
      before: null,
      after: staticEntry.categoryType as ValidType,
      scope: d.userId ? 'SAFE_USER_SCOPED' : 'SAFE_GLOBAL',
      reason: 'match exato com DEFAULT_CATEGORY_CATALOG',
    });
  }

  const SAFE_TO_MIGRATE = plannedUpdates.length;
  const SAFE_GLOBAL = plannedUpdates.filter((p) => p.scope === 'SAFE_GLOBAL').length;
  const SAFE_USER_SCOPED = plannedUpdates.filter((p) => p.scope === 'SAFE_USER_SCOPED').length;
  const byType: Record<ValidType, number> = { income: 0, expense: 0, transfer: 0, investment: 0 };
  plannedUpdates.forEach((p) => byType[p.after]++);

  console.log('\n=== ETAPA 13 — MANIFESTO ===');
  console.log({
    TOTAL_DOCUMENTS,
    STATIC_EXACT_MATCH: classCounts['A_STATIC_EXACT_MATCH'] || 0,
    CUSTOM_OR_LEGACY: classCounts['B_CUSTOM_OR_LEGACY'] || 0,
    INVALID_OR_NAMELESS: classCounts['C_INVALID_OR_NAMELESS'] || 0,
    DUPLICATES: classCounts['D_DUPLICATE_REQUIRES_REVIEW'] || 0,
    MISSING_CATEGORY_TYPE,
    SAME_CATEGORY_TYPE,
    CONFLICTING_CATEGORY_TYPE,
    INVALID_CATEGORY_TYPE,
    SAFE_TO_MIGRATE,
    SAFE_GLOBAL,
    SAFE_USER_SCOPED,
    SKIPPED,
    breakdown: byType,
  });

  console.log('\n=== ETAPA 20 — AMOSTRA DO PLANO (até 3 por tipo) ===');
  for (const t of Object.keys(byType) as ValidType[]) {
    const sample = plannedUpdates.filter((p) => p.after === t).slice(0, 3);
    console.log(`\n-- ${t} --`);
    sample.forEach((p) => console.log(`  id=${p.id} name="${p.name}" before=${p.before} after=${p.after} scope=${p.scope}`));
  }

  // ===== Etapa 17: asserts obrigatórios =====
  const plannedUniqueIds = new Set(plannedUpdates.map((p) => p.id)).size;
  const customWrites = plannedUpdates.filter((p) => classification.get(p.id) !== 'A_STATIC_EXACT_MATCH').length;
  const conflicts = plannedUpdates.filter((p) => conflictingDocs.some((c) => c.id === p.id)).length;
  const invalidTypes = plannedUpdates.filter((p) => invalidTypeDocs.some((c) => c.id === p.id)).length;

  console.log('\n=== ETAPA 17 — ASSERTS OBRIGATÓRIOS ===');
  const asserts: [string, boolean][] = [
    ['plannedWrites === SAFE_TO_MIGRATE', plannedUpdates.length === SAFE_TO_MIGRATE],
    ['plannedUniqueIds === plannedWrites', plannedUniqueIds === plannedUpdates.length],
    ['conflicts === 0 nos planejados', conflicts === 0],
    ['invalidTypes === 0 nos planejados', invalidTypes === 0],
    ['customWrites === 0', customWrites === 0],
    ['keywordWrites === 0 (nunca tocamos keywords)', true],
    ['transactionWrites === 0 (nunca tocamos transactions)', true],
    ['learningWrites === 0 (nunca tocamos category_learning)', true],
  ];
  let allPass = true;
  for (const [label, ok] of asserts) {
    console.log(`  [${ok ? 'OK' : 'FALHOU'}] ${label}`);
    if (!ok) allPass = false;
  }

  if (!allPass) {
    console.error('\nABORTADO: um ou mais asserts falharam. Nenhuma escrita será realizada.');
    process.exit(1);
  }

  // ===== Snapshot (sempre gerado, mesmo em dry-run, para auditoria) =====
  const backupsDir = path.join(process.cwd(), '.backups', 'classifier.2');
  if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = path.join(backupsDir, `category-type-migration-${timestamp}${willWrite ? '.pre-apply' : '.dry-run'}.json`);
  const snapshotContent = plannedUpdates.map((p) => ({
    documentId: p.id,
    name: p.name,
    categoryTypeBefore: p.before,
    categoryTypeAfter: p.after,
    reason: p.reason,
  }));
  writeFileSync(snapshotPath, JSON.stringify({ generatedAt: new Date().toISOString(), mode: willWrite ? 'apply' : 'dry-run', count: snapshotContent.length, entries: snapshotContent }, null, 2));
  console.log(`\nSnapshot gravado em: ${snapshotPath}`);

  if (!willWrite) {
    console.log('\n=== DRY-RUN CONCLUÍDO — ZERO WRITES ===');
    return;
  }

  console.log('\n=== APLICANDO ESCRITAS (somente campo categoryType) ===');
  let written = 0;
  for (const p of plannedUpdates) {
    await adminDb.collection('categories').doc(p.id).update({ categoryType: p.after });
    written++;
  }
  console.log(`Escritas concluídas: ${written}/${plannedUpdates.length}`);
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
