import { adminDb } from '../../src/lib/firebase-admin';

const TARGET_UID = 'NRQYH7BbZXb1USX6GxtJqItNDUF3';
const COLLECTIONS = ['monthly_summaries', 'account_identities', 'category_learning'];

async function extraBackfill() {
  console.log('--- Rodando Backfill Extra para Colecoes Esquecidas ---');
  for (const coll of COLLECTIONS) {
    try {
      const snap = await adminDb.collection(coll).get();
      let count = 0;
      let batch = adminDb.batch();
      for (const doc of snap.docs) {
        if (!doc.data().userId) {
          batch.update(doc.ref, { userId: TARGET_UID });
          count++;
        }
      }
      if (count > 0) await batch.commit();
      console.log(`${coll}: ${count} docs vinculados.`);
    } catch (e: any) {
      console.error(`Erro em ${coll}:`, e.message);
    }
  }
}
extraBackfill();
