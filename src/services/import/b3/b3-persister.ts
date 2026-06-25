import { adminDb } from '@/lib/firebase-admin';
import { B3ParseResult, InvestmentPosition, InvestmentIncome, InvestmentImport } from '@/types/import/b3';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function persistB3Data(userId: string, parsedData: B3ParseResult, fileName: string) {
  if (!parsedData.positions.length && !parsedData.dividends.length) {
    throw new Error('Nenhum dado válido para persistir.');
  }

  // Find the year from data (assuming the report is for a specific year)
  let reportYear = new Date().getFullYear();
  if (parsedData.positions.length > 0) {
    reportYear = parsedData.positions[0].ano;
  } else if (parsedData.dividends.length > 0) {
    reportYear = parsedData.dividends[0].ano;
  }

  const batchSize = 400; // Safe limit (max 500)
  let batches: FirebaseFirestore.WriteBatch[] = [];
  let currentBatch = adminDb.batch();
  let opCount = 0;

  const commitBatchIfNeeded = () => {
    if (opCount >= batchSize) {
      batches.push(currentBatch);
      currentBatch = adminDb.batch();
      opCount = 0;
    }
  };

  const importedAt = FieldValue.serverTimestamp();

  // 1. Persist Positions
  for (const pos of parsedData.positions) {
    // Deduplication rule: pos_${userId}_B3_${year}_${ticker}_${type}
    const safeType = slugify(pos.tipo);
    const docId = `pos_${userId}_B3_${pos.ano}_${pos.ticker}_${safeType}`;
    
    const docRef = adminDb.collection('investment_positions').doc(docId);
    
    const data: InvestmentPosition = {
      id: docId,
      userId,
      year: pos.ano,
      ticker: pos.ticker,
      name: pos.nome,
      type: pos.tipo,
      institution: pos.instituicao,
      quantity: pos.quantidade,
      price: pos.preco,
      marketValue: pos.valorAtualizado,
      importedAt
    };

    currentBatch.set(docRef, data, { merge: true });
    opCount++;
    commitBatchIfNeeded();
  }

  // 2. Persist Income
  for (const div of parsedData.dividends) {
    // Deduplication rule: inc_${userId}_B3_${year}_${ticker}_${typeSlug}
    // Also include a hash to prevent collisions if same ticker has multiple events of same type? 
    // Usually B3 reports consolidate everything by type.
    const safeType = slugify(div.tipo);
    const docId = `inc_${userId}_B3_${div.ano}_${div.ticker}_${safeType}`;
    
    const docRef = adminDb.collection('investment_income').doc(docId);
    
    const data: InvestmentIncome = {
      id: docId,
      userId,
      year: div.ano,
      ticker: div.ticker,
      type: div.tipo,
      amount: div.valor,
      importedAt
    };

    currentBatch.set(docRef, data, { merge: true });
    opCount++;
    commitBatchIfNeeded();
  }

  // 3. Persist Import Log
  const fileHash = crypto.createHash('md5').update(fileName + reportYear + userId).digest('hex');
  const importId = `imp_${userId}_B3_${reportYear}_${fileHash}`;
  
  const importDocRef = adminDb.collection('investment_imports').doc(importId);
  const importData: InvestmentImport = {
    id: importId,
    userId,
    fileName,
    year: reportYear,
    totalPositions: parsedData.positions.length,
    totalIncome: parsedData.dividends.length,
    importedAt
  };

  currentBatch.set(importDocRef, importData, { merge: true });
  opCount++;

  // Commit all batches
  batches.push(currentBatch);
  for (const batch of batches) {
    await batch.commit();
  }

  return { success: true, importId };
}
