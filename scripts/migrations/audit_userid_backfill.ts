import { adminDb } from '../../src/lib/firebase-admin';

const COLLECTIONS = [
  'transactions',
  'accounts',
  'liabilities',
  'investments',
  'monthly_closures',
  'month_openings',
  'categories',
  'companies',
  'tax_obligations',
  'budgets',
  'wealth_profiles',
  'recurring_expenses',
  'settings'
];

type AuditRow = {
  colecao: string;
  totalDocs: number;
  comUserId: number;
  semUserId: number;
  exemplosFaltantes: string;
};

async function runAudit() {
  console.log('--- Iniciando Auditoria de userId (Read-Only) --- \n');
  
  const results: AuditRow[] = [];

  for (const collectionName of COLLECTIONS) {
    try {
      console.log(`[AUDIT] Lendo colecao: ${collectionName}...`);
      const snapshot = await adminDb.collection(collectionName).get();
      let withUserId = 0;
      let missingUserId = 0;
      const sampleMissingIds: string[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId) {
          withUserId++;
        } else {
          missingUserId++;
          if (sampleMissingIds.length < 5) {
            sampleMissingIds.push(doc.id);
          }
        }
      });

      results.push({
        colecao: collectionName,
        totalDocs: snapshot.size,
        comUserId: withUserId,
        semUserId: missingUserId,
        exemplosFaltantes: sampleMissingIds.join(', ') || 'Nenhum'
      });
    } catch (error: any) {
      console.error(`[ERRO] Colecao ${collectionName}:`, error.message);
    }
  }

  console.log('\n--- Resumo da Auditoria ---');
  console.table(results);
  console.log('\n--- Auditoria concluida ---');
}

runAudit().catch(err => {
  console.error('Erro fatal na auditoria:', err);
  process.exit(1);
});
