import { adminDb } from '../../src/lib/firebase-admin';
import fs from 'fs';
import path from 'path';

const TARGET_UID = 'NRQYH7BbZXb1USX6GxtJqItNDUF3';
const IS_DRY_RUN = process.argv.includes('--apply') ? false : true;

const COLLECTIONS = [
  'transactions',
  'accounts',
  'liabilities',
  'investments',
  'monthly_closures',
  'month_openings',
  'categories',
  'companies',
  'settings'
];

async function applyBackfill() {
  console.log(`--- Iniciando Backfill para UID: ${TARGET_UID} ---`);
  console.log(`MODO: ${IS_DRY_RUN ? 'DRY RUN (Simulacao)' : 'APPLY (Escrita Real)'}\n`);

  const report: any = {
    timestamp: new Date().toISOString(),
    targetUid: TARGET_UID,
    mode: IS_DRY_RUN ? 'dry-run' : 'apply',
    collections: {}
  };

  for (const collectionName of COLLECTIONS) {
    console.log(`[PROCESS] Colecao: ${collectionName}...`);
    
    const snapshot = await adminDb.collection(collectionName).get();
    let count = 0;
    let batch = adminDb.batch();
    let batchCount = 0;
    const modifiedIds: string[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.userId) {
        if (!IS_DRY_RUN) {
          batch.update(doc.ref, { userId: TARGET_UID });
        }
        
        count++;
        batchCount++;
        modifiedIds.push(doc.id);

        if (batchCount === 500 && !IS_DRY_RUN) {
          await batch.commit();
          batch = adminDb.batch();
          batchCount = 0;
        }
      }
    }

    if (batchCount > 0 && !IS_DRY_RUN) {
      await batch.commit();
    }

    report.collections[collectionName] = {
      count,
      ids: modifiedIds
    };

    console.log(`   -> ${count} documentos ${IS_DRY_RUN ? 'seriam vinculados' : 'vinculados'}.`);
  }

  // Salvar relatório
  if (!IS_DRY_RUN) {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const reportName = `backfill_report_${Date.now()}.json`;
    const reportPath = path.join(backupDir, reportName);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Relatorio salvo em: scripts/migrations/backups/${reportName}`);
  }

  console.log(`\n--- Processo concluido ---`);
}

applyBackfill().catch(err => {
  console.error('Erro no backfill:', err);
  process.exit(1);
});
