import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Resolvendo o dotenv na raiz
config();
config({ path: '.env.local' });

// Importando o motor puro via caminho relativo para evitar erro de alias
import { findBestMatches, type ReconciliationCandidate } from '../../src/core/finance/transfer-reconciliation-engine';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function run() {
  console.log('Baixando transações do Firestore...');
  const snap = await getDocs(collection(db, 'transactions'));
  const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  const transfers = txs.filter(t => t.type === 'transfer' && !t.transferPairId);
  console.log(`Encontradas ${transfers.length} transferências órfãs.`);

  const candidates: ReconciliationCandidate[] = transfers.map(t => ({
    id: t.id,
    amount: Number(t.amount || 0),
    date: String(t.dateISO || t.date || ''),
    description: String(t.description || ''),
    type: String(t.type || ''),
    owner: String(t.owner || 'PF'),
  }));

  const plan = {
    highConfidence: [] as any[],
    mediumConfidence: [] as any[],
    lowConfidence: [] as any[],
    conflicts: [] as any[],
  };

  const pairedIds = new Set<string>();

  // Primeiro, vamos detectar triplicados/conflitos explícitos no mesmo dia/valor
  const byDateAmount = new Map<string, string[]>();
  for (const c of candidates) {
    const key = `${c.date}_${Math.abs(c.amount)}`;
    if (!byDateAmount.has(key)) byDateAmount.set(key, []);
    byDateAmount.get(key)!.push(c.id);
  }

  for (const [key, group] of byDateAmount.entries()) {
    if (group.length > 2) {
      console.log(`[CONFLITO] ${group.length} transações no mesmo dia com mesmo valor: ${key}`);
      const conflictItems = group.map(id => transfers.find(t => t.id === id)!);
      
      plan.conflicts.push({
        reason: 'Múltiplas transações com o mesmo valor no mesmo dia. Risco de falso positivo.',
        items: conflictItems.map(t => ({
          id: t.id,
          amount: t.amount,
          date: t.date,
          description: t.description,
          owner: t.owner
        }))
      });

      // Isolamos eles para o engine não tentar parear
      group.forEach(id => pairedIds.add(id));
    }
  }

  // Agora vamos rodar o engine nos itens restantes
  for (const source of candidates) {
    if (pairedIds.has(source.id)) continue;

    const matches = findBestMatches(source, candidates);
    
    // Pegar o melhor que não esteja pareado
    const bestMatch = matches.find(m => !pairedIds.has(m.targetId));

    if (bestMatch && bestMatch.score > 0) {
      // Registrar par
      pairedIds.add(source.id);
      pairedIds.add(bestMatch.targetId);

      const tSource = transfers.find(t => t.id === source.id)!;
      const tTarget = transfers.find(t => t.id === bestMatch.targetId)!;

      const pairData = {
        sourceId: tSource.id,
        targetId: tTarget.id,
        amount: tSource.amount,
        dateSource: tSource.date,
        dateTarget: tTarget.date,
        descriptionSource: tSource.description,
        descriptionTarget: tTarget.description,
        score: bestMatch.score,
        confidence: bestMatch.confidence,
        reason: `Reconciliação sugerida pelo heurístico com score ${bestMatch.score}`,
      };

      if (bestMatch.confidence === 'high') {
        plan.highConfidence.push(pairData);
      } else if (bestMatch.confidence === 'medium') {
        plan.mediumConfidence.push(pairData);
      } else {
        plan.lowConfidence.push(pairData);
      }
    }
  }

  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const outPath = path.join(backupDir, 'reconciliation_plan.json');
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), 'utf-8');

  console.log('\n===== RESULTADO DO PLANO =====');
  console.log(`High Confidence: ${plan.highConfidence.length} pares`);
  console.log(`Medium Confidence: ${plan.mediumConfidence.length} pares`);
  console.log(`Low Confidence: ${plan.lowConfidence.length} pares`);
  console.log(`Conflicts: ${plan.conflicts.length} grupos ignorados`);
  console.log(`Arquivo gerado em: ${outPath}`);
  console.log('\nNENHUM DADO FOI ESCRITO NO FIRESTORE.');
}

run().catch(console.error);
