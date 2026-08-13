// CLASSIFIER.3 — FASE B — ETAPA 13 (complemento): pipeline OFX real COM CONTEXTO REAL.
//
// O script audit-ofx-preview.ts usa o SDK CLIENTE (db de @/lib/firebase), que em
// execução Node sem usuário autenticado sofre permission-denied e retorna contexto
// VAZIO (categories=[], identities=[], learning={}). Por isso ele NÃO valida a
// barreira central (que depende de categoryType em context.categories).
//
// Este script usa o ADMIN SDK (adminDb), que ignora as regras de segurança, para
// construir um ClassificationContext REAL (categorias com categoryType migrado,
// identidades e learning do usuário real) e então chama resolveOfxTransaction()
// diretamente — a mesma função de produção usada por parseOFX().
//
// Execução:
//   set -a && source .env && set +a && npx tsx scripts/test-ofx-real-context.ts .tmp/ofx/Extrato-conta-corrente-082026.ofx

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { adminDb, adminAuth } from '../src/lib/firebase-admin';
import { resolveOfxTransaction } from '../src/core/finance/ofx-parser';
import { normalizeText, type ClassificationContext } from '../src/core/finance/transaction-classifier';
import type { Category } from '../src/services/firestore/categories';
import type { AccountIdentity } from '../src/services/firestore/account-identities';

const SESSION_EMAIL = 'andersonmaranhao14@gmail.com';

async function buildRealContextAdmin(uid: string): Promise<ClassificationContext> {
  const [defaultSnap, globalSnap, userSnap, identitiesSnap, learningSnap] = await Promise.all([
    adminDb.collection('categories').where('isDefault', '==', true).get(),
    adminDb.collection('categories').where('isGlobal', '==', true).get(),
    adminDb.collection('categories').where('userId', '==', uid).get(),
    adminDb.collection('account_identities').where('userId', '==', uid).get(),
    adminDb.collection('category_learning').where('userId', '==', uid).get(),
  ]);

  const mergedMap = new Map<string, Category>();
  for (const d of [...defaultSnap.docs, ...globalSnap.docs]) {
    const cat = { id: d.id, ...(d.data() as any) } as Category;
    const key = normalizeText(cat.name);
    if (key) mergedMap.set(key, cat);
  }
  for (const d of userSnap.docs) {
    const cat = { id: d.id, ...(d.data() as any) } as Category;
    const key = normalizeText(cat.name);
    if (key) mergedMap.set(key, cat);
  }

  const categories = Array.from(mergedMap.values());
  const accountIdentities = identitiesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AccountIdentity[];
  const learningMap = new Map<string, string>();
  for (const d of learningSnap.docs) {
    const data = d.data();
    if (data.fingerprint && data.category) learningMap.set(data.fingerprint, data.category);
  }
  return { categories, accountIdentities, learningMap };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Uso: npx tsx scripts/test-ofx-real-context.ts <caminho-do-ofx>');
    process.exit(1);
  }

  const buffer = readFileSync(filePath);
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  console.log('sha256:', sha256);

  const userRecord = await adminAuth.getUserByEmail(SESSION_EMAIL);
  const uid = userRecord.uid;
  const context = await buildRealContextAdmin(uid);

  const withCategoryType = context.categories.filter((c: any) => c.categoryType).length;
  console.log(
    `contexto real: categories=${context.categories.length} (com categoryType=${withCategoryType}) identities=${context.accountIdentities.length} learning=${context.learningMap.size}\n`
  );

  const text = buffer.toString('utf-8');
  const blocks = text.split('<STMTTRN>').slice(1);

  console.log('blocos STMTTRN:', blocks.length);

  const results = blocks
    .map((block) => resolveOfxTransaction(block, context))
    .filter(Boolean);

  console.log('movimentações:', results.length);

  const targets = ['600.803.400.049.800', '18.429', '80.601', '81.005'];
  console.log('\n=== FITIDs ALVO ===');
  for (const t of targets) {
    const r = results.find((x: any) => x.externalId === t);
    console.log(
      r
        ? `FITID ${t}: type=${r.type} category="${r.category}" amount=${r.amount}`
        : `FITID ${t}: NÃO ENCONTRADO`
    );
  }
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
