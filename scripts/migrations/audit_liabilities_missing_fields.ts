import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Configurando as variáveis de ambiente
config();
config({ path: '.env.local' });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

function round(val: number) {
  return Number(val.toFixed(2));
}

async function run() {
  console.log('Baixando passivos do Firestore (Dry-Run)...');
  const snap = await getDocs(collection(db, 'liabilities'));
  const allLiabilities = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));

  const plan = {
    totalScanned: allLiabilities.length,
    toNormalize: [] as any[],
    risks: [] as any[],
    impossibleToCalculate: [] as any[]
  };

  for (const item of allLiabilities) {
    const hasRemainingInstallments = item.remainingInstallments !== undefined && item.remainingInstallments !== null;
    const hasRemainingBalance = item.remainingBalance !== undefined && item.remainingBalance !== null;

    // Se ambos já existem de forma íntegra, podemos ignorar para essa normalização
    if (hasRemainingInstallments && hasRemainingBalance) continue;

    const current = Number(item.currentInstallment || 0);
    const total = Number(item.totalInstallments || 0);
    const instValue = Number(item.installmentValue || 0);

    if (total === 0 || instValue === 0) {
      plan.impossibleToCalculate.push({
        id: item.id,
        name: item.name,
        status: item.status,
        reason: 'Falta totalInstallments ou installmentValue (impossível inferir matematicamente).'
      });
      continue;
    }

    const calculatedRemainingInstallments = Math.max(0, total - current);
    const calculatedRemainingBalance = round(calculatedRemainingInstallments * instValue);

    let riskLevel = 'LOW';
    const riskReasons: string[] = [];

    // Verificando riscos de matemática vs regras de negócio
    if (item.status === 'paid' && calculatedRemainingBalance > 0) {
      riskLevel = 'HIGH';
      riskReasons.push('O passivo consta como PAID, mas o cálculo matemático sugere que ainda há parcelas/saldo restante. Normalizar pode "ressuscitá-lo".');
    }
    
    if (calculatedRemainingBalance < 0) {
      riskLevel = 'HIGH';
      riskReasons.push('Matemática resultou em saldo negativo.');
    }

    plan.toNormalize.push({
      id: item.id,
      name: item.name,
      status: item.status,
      currentMissing: {
        remainingInstallments: !hasRemainingInstallments,
        remainingBalance: !hasRemainingBalance
      },
      currentValues: {
        currentInstallment: current,
        totalInstallments: total,
        installmentValue: instValue
      },
      calculated: {
        remainingInstallments: calculatedRemainingInstallments,
        remainingBalance: calculatedRemainingBalance
      },
      riskLevel,
      riskReasons
    });

    if (riskLevel !== 'LOW') {
      plan.risks.push({ id: item.id, name: item.name, reasons: riskReasons });
    }
  }

  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const outPath = path.join(backupDir, 'liabilities_normalization_plan.json');
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), 'utf-8');

  console.log('\n===== RESULTADO DO DRY-RUN (FASE 7) =====');
  console.log(`Total Scanned: ${plan.totalScanned}`);
  console.log(`Aptos para Normalização: ${plan.toNormalize.length}`);
  console.log(`Impossíveis de Calcular: ${plan.impossibleToCalculate.length}`);
  console.log(`Riscos Encontrados: ${plan.risks.length}`);
  console.log(`Arquivo salvo em: ${outPath}`);
  console.log('\nNENHUM DADO FOI ESCRITO NO FIRESTORE.');
}

run().catch(console.error);
