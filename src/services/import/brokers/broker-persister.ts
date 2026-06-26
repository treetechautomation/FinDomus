import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { NormalizedBrokerImport } from './broker-types';

export async function persistBrokerData(
  userId: string,
  importData: NormalizedBrokerImport,
  fileName: string
): Promise<{ success: boolean; importId: string }> {
  if (!userId || userId === 'preview') {
    throw new Error('Persistência não permitida em modo de visualização prévia (offline).');
  }

  const { positions, income, transactions } = importData;

  const totalToPersist = 
    positions.filter(p => p.decision?.status === 'NEW' || p.decision?.status === 'UPDATE').length +
    income.filter(i => i.decision?.status === 'NEW' || i.decision?.status === 'UPDATE').length +
    transactions.filter(t => t.decision?.status === 'NEW' || t.decision?.status === 'UPDATE').length;

  if (totalToPersist === 0) {
    throw new Error('Nenhum registro novo ou atualizado para persistir.');
  }

  const batchSize = 400; // safe limit (max 500)
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let currentBatch = adminDb.batch();
  let opCount = 0;

  const commitBatchIfNeeded = () => {
    if (opCount >= batchSize) {
      batches.push(currentBatch);
      currentBatch = adminDb.batch();
      opCount = 0;
    }
  };

  const serverTimestamp = FieldValue.serverTimestamp();

  let positionsCount = 0;
  let incomeCount = 0;
  let transactionsCount = 0;

  // 1. Persist Positions
  for (const pos of positions) {
    const status = pos.decision?.status;
    if (status !== 'NEW' && status !== 'UPDATE') continue;

    const docRef = adminDb.collection('broker_positions').doc(pos.dedupeKey);
    positionsCount++;

    if (status === 'NEW') {
      const data = {
        id: pos.dedupeKey,
        userId,
        broker: pos.broker,
        ticker: pos.ticker,
        assetType: pos.assetType,
        institution: pos.institution,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        marketValue: pos.marketValue,
        currency: pos.currency || 'BRL',
        year: pos.year,
        dedupeKey: pos.dedupeKey,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data);
    } else {
      // UPDATE: Only update allowed fields, preserve createdAt
      const data = {
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        marketValue: pos.marketValue,
        institution: pos.institution,
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data, { merge: true });
    }

    opCount++;
    commitBatchIfNeeded();
  }

  // 2. Persist Income
  for (const inc of income) {
    const status = inc.decision?.status;
    if (status !== 'NEW' && status !== 'UPDATE') continue;

    const docRef = adminDb.collection('broker_income').doc(inc.dedupeKey);
    incomeCount++;

    if (status === 'NEW') {
      const data = {
        id: inc.dedupeKey,
        userId,
        broker: inc.broker,
        ticker: inc.ticker,
        incomeType: inc.incomeType,
        amount: inc.amount,
        currency: inc.currency || 'BRL',
        paymentDate: inc.paymentDate || '',
        year: inc.year,
        dedupeKey: inc.dedupeKey,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data);
    } else {
      // UPDATE: Only update allowed fields, preserve createdAt
      const data = {
        paymentDate: inc.paymentDate || '',
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data, { merge: true });
    }

    opCount++;
    commitBatchIfNeeded();
  }

  // 3. Persist Transactions
  for (const tx of transactions) {
    const status = tx.decision?.status;
    if (status !== 'NEW' && status !== 'UPDATE') continue;

    const docRef = adminDb.collection('broker_transactions').doc(tx.dedupeKey);
    transactionsCount++;

    if (status === 'NEW') {
      const data = {
        id: tx.dedupeKey,
        userId,
        broker: tx.broker,
        ticker: tx.ticker,
        operation: tx.operation,
        quantity: tx.quantity,
        price: tx.price,
        grossAmount: tx.grossAmount,
        netAmount: tx.netAmount || tx.grossAmount,
        fees: tx.fees,
        taxes: tx.taxes || 0,
        date: tx.date,
        currency: tx.currency || 'BRL',
        dedupeKey: tx.dedupeKey,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data);
    } else {
      // UPDATE: Only update allowed fields, preserve createdAt
      const data = {
        quantity: tx.quantity,
        fees: tx.fees,
        taxes: tx.taxes || 0,
        updatedAt: serverTimestamp
      };
      currentBatch.set(docRef, data, { merge: true });
    }

    opCount++;
    commitBatchIfNeeded();
  }

  // 4. Persist Import Log
  const reportYear = importData.metadata.year;
  const source = importData.metadata.source;
  const documentType = importData.metadata.documentType;

  const fileHash = crypto.createHash('md5').update(fileName + reportYear + userId).digest('hex');
  const importId = `imp_${userId}_${source}_${reportYear}_${fileHash}`;

  const importDocRef = adminDb.collection('broker_imports').doc(importId);
  const importDataDoc = {
    id: importId,
    userId,
    broker: source,
    fileName,
    documentType,
    year: reportYear,
    positionsImported: positionsCount,
    incomeImported: incomeCount,
    transactionsImported: transactionsCount,
    importedAt: serverTimestamp,
    summary: importData.decisionSummary || null
  };

  currentBatch.set(importDocRef, importDataDoc, { merge: true });
  opCount++;

  // Commit all batches
  batches.push(currentBatch);
  for (const batch of batches) {
    await batch.commit();
  }

  return { success: true, importId };
}
