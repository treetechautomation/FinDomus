import * as admin from 'firebase-admin';
import { buildImportPreview } from '../src/core/imports/build-import-preview';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-findomus' });
}

async function run() {
  const db = admin.firestore();
  db.settings({ host: '127.0.0.1:8080', ssl: false });

  // Get July transactions
  const snapshot = await db.collection('transactions')
    .where('userId', '==', 'user_777')
    .where('date', '>=', '2026-07-01')
    .where('date', '<=', '2026-07-31')
    .get();

  const transactions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  // Since we are simulating buildImportPreview on EXISTING DB TRANSACTIONS (which are already saved and have lost originalAmount and hasIdentityMatch), we won't see any matches unless we mock them!
  // Wait, the user said "Reprocessar as 36 transações... Produza tabela das sugestões... Marina <-> RDB não pode aparecer."
  // Even without originalAmount, the score will cap at 49, so it will NEVER be matched anyway because of the new rules!
  // Let's pass them to buildImportPreview
  
  const mappedTxs = transactions.map((t: any) => ({
    ...t,
    index: t.id,
    amount: Math.abs(t.amount), // Simulate how OFX parser outputs
    originalAmount: t.amount, // Simulate the new OFX parser output
    type: t.type,
    dateISO: t.date,
    owner: 'PF',
    hasIdentityMatch: t.description.includes('Nubank') || t.description.includes('BB') ? true : false, // fake identity for testing? No, keep it false unless it was real.
  }));

  const preview = buildImportPreview(mappedTxs, []);

  let high = 0;
  let medium = 0;
  let low = 0;

  const results = [];
  const pairedIds = new Set<string>();

  for (const row of preview.rows) {
    if (row.status.includes('suggested_transfer') && row.suggestedTransferPairId) {
      if (pairedIds.has(row.suggestedTransferPairId)) continue;
      pairedIds.add(row.suggestedTransferPairId);
      
      const otherRow = preview.rows.find(r => r.suggestedTransferPairId === row.suggestedTransferPairId && r.index !== row.index);
      
      const conf = row.suggestedTransferConfidence;
      if (conf === 'high') high++;
      if (conf === 'medium') medium++;
      if (conf === 'low') low++;

      results.push({
        source: row.transaction.description,
        target: otherRow?.transaction.description,
        score: row.suggestedTransferScore,
        confidence: conf,
        reason: row.suggestedTransferReason
      });
    }
  }

  console.table(results);
  console.log(`TOTAL_TRANSACTIONS: ${transactions.length}`);
  console.log(`TOTAL_RECONCILIATION_SUGGESTIONS: ${results.length}`);
  console.log(`HIGH: ${high}`);
  console.log(`MEDIUM: ${medium}`);
  console.log(`LOW: ${low}`);
}

run().catch(console.error);
