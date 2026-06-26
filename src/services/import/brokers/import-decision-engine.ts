import { adminDb } from '@/lib/firebase-admin';
import { 
  NormalizedBrokerImport, 
  NormalizedBrokerPosition, 
  NormalizedBrokerIncome, 
  NormalizedBrokerTransaction,
  ImportDecision,
  ImportDecisionSummary
} from './broker-types';

/**
 * Compares incoming broker records with Firestore data to decide import status for each.
 * This function is stritcly READ-ONLY and will never modify Firestore.
 */
export async function evaluateImportDecisions(
  normalized: NormalizedBrokerImport,
  userId: string
): Promise<NormalizedBrokerImport> {
  const isPreview = !userId || userId === 'preview';

  // 1. Initialize decision structures
  const summary: ImportDecisionSummary = {
    total: 0,
    newCount: 0,
    updateCount: 0,
    duplicateCount: 0,
    conflictCount: 0,
    ignoredCount: 0
  };

  const positions: NormalizedBrokerPosition[] = [];
  const income: NormalizedBrokerIncome[] = [];
  const transactions: NormalizedBrokerTransaction[] = [];

  // If in preview or no user, treat all valid records as NEW, invalid as IGNORE
  if (isPreview) {
    // Process Positions
    normalized.positions.forEach(p => {
      summary.total++;
      const isInvalid = !p.ticker || p.quantity <= 0 || p.marketValue < 0 || !p.year || p.year < 1900 || p.year > 2100;
      if (isInvalid) {
        summary.ignoredCount++;
        positions.push({
          ...p,
          decision: { status: 'IGNORE', reason: 'Campos obrigatórios inválidos ou ausentes.' }
        });
      } else {
        summary.newCount++;
        positions.push({
          ...p,
          decision: { status: 'NEW', reason: 'Usuário em modo de visualização prévia (offline).' }
        });
      }
    });

    // Process Income
    normalized.income.forEach(inc => {
      summary.total++;
      const isInvalid = !inc.ticker || inc.amount <= 0 || !inc.year || inc.year < 1900 || inc.year > 2100;
      if (isInvalid) {
        summary.ignoredCount++;
        income.push({
          ...inc,
          decision: { status: 'IGNORE', reason: 'Campos obrigatórios inválidos ou ausentes.' }
        });
      } else {
        summary.newCount++;
        income.push({
          ...inc,
          decision: { status: 'NEW', reason: 'Usuário em modo de visualização prévia (offline).' }
        });
      }
    });

    // Process Transactions
    normalized.transactions.forEach(t => {
      summary.total++;
      const op = String(t.operation).toUpperCase();
      const isInvalid = !t.ticker || t.quantity <= 0 || t.price <= 0 || t.grossAmount <= 0 || 
                        !['C', 'V', 'COMPRA', 'VENDA'].some(o => op.includes(o)) || 
                        !t.date || !t.date.match(/^\d{2}\/\d{2}\/\d{4}$/);
      if (isInvalid) {
        summary.ignoredCount++;
        transactions.push({
          ...t,
          decision: { status: 'IGNORE', reason: 'Campos obrigatórios inválidos ou ausentes.' }
        });
      } else {
        summary.newCount++;
        transactions.push({
          ...t,
          decision: { status: 'NEW', reason: 'Usuário em modo de visualização prévia (offline).' }
        });
      }
    });

    return {
      ...normalized,
      positions,
      income,
      transactions,
      decisionSummary: summary
    };
  }

  // 2. Fetch existing documents from Firestore (Read-Only)
  const existingPositionsMap = new Map<string, any>();
  const existingIncomeMap = new Map<string, any>();
  const existingTransactionsMap = new Map<string, any>();

  try {
    const [positionsSnapshot, incomeSnapshot] = await Promise.all([
      adminDb.collection('investment_positions').where('userId', '==', userId).get(),
      adminDb.collection('investment_income').where('userId', '==', userId).get()
    ]);

    positionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      existingPositionsMap.set(doc.id, { ...data, id: doc.id });
      if (data.dedupeKey) {
        existingPositionsMap.set(data.dedupeKey, { ...data, id: doc.id });
      }
    });

    incomeSnapshot.docs.forEach(doc => {
      const data = doc.data();
      existingIncomeMap.set(doc.id, { ...data, id: doc.id });
      if (data.dedupeKey) {
        existingIncomeMap.set(data.dedupeKey, { ...data, id: doc.id });
      }
    });

    // broker_transactions (if it exists)
    try {
      const txSnapshot = await adminDb.collection('broker_transactions').where('userId', '==', userId).get();
      txSnapshot.docs.forEach(doc => {
        const data = doc.data();
        existingTransactionsMap.set(doc.id, { ...data, id: doc.id });
        if (data.dedupeKey) {
          existingTransactionsMap.set(data.dedupeKey, { ...data, id: doc.id });
        }
      });
    } catch (txError) {
      console.warn('Coleção broker_transactions não encontrada ou erro ao buscar:', txError);
    }

  } catch (dbError) {
    console.error('Erro ao buscar dados do Firestore para decisão:', dbError);
  }

  const isNear = (a: number, b: number) => Math.abs(a - b) < 1e-4;

  // 3. Process Positions Decisions
  normalized.positions.forEach(p => {
    summary.total++;
    const isInvalid = !p.ticker || p.quantity <= 0 || p.marketValue < 0 || !p.year || p.year < 1900 || p.year > 2100;
    
    if (isInvalid) {
      summary.ignoredCount++;
      positions.push({
        ...p,
        decision: { status: 'IGNORE', reason: 'Campos obrigatórios inválidos ou ausentes.' }
      });
      return;
    }

    const existing = existingPositionsMap.get(p.dedupeKey);
    if (!existing) {
      summary.newCount++;
      positions.push({
        ...p,
        decision: { status: 'NEW', reason: 'Nova posição de custódia identificada.' }
      });
      return;
    }

    // Check Conflict
    const hasConflict = (existing.broker && existing.broker !== p.broker) ||
                        (existing.assetType && existing.assetType !== p.assetType) ||
                        (existing.currency && existing.currency !== p.currency);
    
    if (hasConflict) {
      summary.conflictCount++;
      positions.push({
        ...p,
        decision: { 
          status: 'CONFLICT', 
          reason: 'Conflito crítico detectado (divergência de Corretora, Classe de Ativo ou Moeda).',
          matchedId: existing.id
        }
      });
      return;
    }

    // Check Update
    const hasUpdate = !isNear(existing.quantity || 0, p.quantity) ||
                      !isNear(existing.averagePrice || existing.price || 0, p.averagePrice) ||
                      !isNear(existing.marketValue || 0, p.marketValue) ||
                      (existing.institution && existing.institution !== p.institution);

    if (hasUpdate) {
      summary.updateCount++;
      positions.push({
        ...p,
        decision: { 
          status: 'UPDATE', 
          reason: 'Valores financeiros ou instituição atualizados.',
          matchedId: existing.id
        }
      });
      return;
    }

    // Duplicate
    summary.duplicateCount++;
    positions.push({
      ...p,
      decision: { 
        status: 'DUPLICATE', 
        reason: 'Posição idêntica já existente no banco de dados.',
        matchedId: existing.id
      }
    });
  });

  // 4. Process Income Decisions
  normalized.income.forEach(inc => {
    summary.total++;
    const isInvalid = !inc.ticker || inc.amount <= 0 || !inc.year || inc.year < 1900 || inc.year > 2100;
    
    if (isInvalid) {
      summary.ignoredCount++;
      income.push({
        ...inc,
        decision: { status: 'IGNORE', reason: 'Campos obrigatórios de rendimento inválidos ou ausentes.' }
      });
      return;
    }

    const existing = existingIncomeMap.get(inc.dedupeKey);
    if (!existing) {
      summary.newCount++;
      income.push({
        ...inc,
        decision: { status: 'NEW', reason: 'Novo provento identificado.' }
      });
      return;
    }

    // Check Conflict
    const hasConflict = (existing.broker && existing.broker !== inc.broker) ||
                        (existing.currency && existing.currency !== inc.currency);
    
    if (hasConflict) {
      summary.conflictCount++;
      income.push({
        ...inc,
        decision: { 
          status: 'CONFLICT', 
          reason: 'Conflito crítico detectado (divergência de Corretora ou Moeda).',
          matchedId: existing.id
        }
      });
      return;
    }

    // Check Update
    const hasUpdate = existing.paymentDate !== inc.paymentDate;
    if (hasUpdate) {
      summary.updateCount++;
      income.push({
        ...inc,
        decision: { 
          status: 'UPDATE', 
          reason: 'Data de pagamento atualizada.',
          matchedId: existing.id
        }
      });
      return;
    }

    // Duplicate
    summary.duplicateCount++;
    income.push({
      ...inc,
      decision: { 
        status: 'DUPLICATE', 
        reason: 'Provento idêntico já existente no banco de dados.',
        matchedId: existing.id
      }
    });
  });

  // 5. Process Transactions Decisions
  normalized.transactions.forEach(t => {
    summary.total++;
    const op = String(t.operation).toUpperCase();
    const isInvalid = !t.ticker || t.quantity <= 0 || t.price <= 0 || t.grossAmount <= 0 || 
                      !['C', 'V', 'COMPRA', 'VENDA'].some(o => op.includes(o)) || 
                      !t.date || !t.date.match(/^\d{2}\/\d{2}\/\d{4}$/);
    
    if (isInvalid) {
      summary.ignoredCount++;
      transactions.push({
        ...t,
        decision: { status: 'IGNORE', reason: 'Campos obrigatórios de transação inválidos ou ausentes.' }
      });
      return;
    }

    const existing = existingTransactionsMap.get(t.dedupeKey);
    if (!existing) {
      summary.newCount++;
      transactions.push({
        ...t,
        decision: { status: 'NEW', reason: 'Nova negociação identificada.' }
      });
      return;
    }

    // Check Conflict
    const hasConflict = (existing.broker && existing.broker !== t.broker) ||
                        (existing.operation && existing.operation !== t.operation) ||
                        (existing.currency && existing.currency !== t.currency);

    if (hasConflict) {
      summary.conflictCount++;
      transactions.push({
        ...t,
        decision: { 
          status: 'CONFLICT', 
          reason: 'Conflito crítico detectado (divergência de Corretora, Operação ou Moeda).',
          matchedId: existing.id
        }
      });
      return;
    }

    // Check Update
    const hasUpdate = !isNear(existing.fees || 0, t.fees) || 
                      (existing.netAmount !== undefined && !isNear(existing.netAmount, t.netAmount || 0));

    if (hasUpdate) {
      summary.updateCount++;
      transactions.push({
        ...t,
        decision: { 
          status: 'UPDATE', 
          reason: 'Taxas ou valor líquido da operação atualizados.',
          matchedId: existing.id
        }
      });
      return;
    }

    // Duplicate
    summary.duplicateCount++;
    transactions.push({
      ...t,
      decision: { 
        status: 'DUPLICATE', 
        reason: 'Negociação idêntica já existente no banco de dados.',
        matchedId: existing.id
      }
    });
  });

  return {
    ...normalized,
    positions,
    income,
    transactions,
    decisionSummary: summary
  };
}
