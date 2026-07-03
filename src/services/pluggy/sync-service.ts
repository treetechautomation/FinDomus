import { PluggyClient } from 'pluggy-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { resolveUserHouseholdId } from '@/services/firestore/users';
import { normalizeTransactionDate } from '@/core/date/normalize-transaction-date';
import { generateImportHash } from '@/services/firestore/transactions';
import { buildClassificationContext, classifyTransactionWithContext } from '@/core/finance/transaction-classifier';
import { financialEvents } from '@/core/finance/events';
import { forceUpdateAllSnapshotsAdmin } from './snapshot-updater';
import { ai } from '@/ai/genkit';

/**
 * Mapeia os tipos de conta da Pluggy para os tipos internos do FinDomus
 */
function mapAccountType(pluggyType: string, pluggySubtype: string): string {
  if (pluggyType === 'CREDIT' || pluggySubtype === 'CREDIT_CARD') {
    return 'credit_card';
  }
  if (pluggySubtype === 'SAVINGS_ACCOUNT') {
    return 'savings';
  }
  if (pluggySubtype === 'INVESTMENT') {
    return 'investment';
  }
  return 'checking'; // Default checking (Conta Corrente)
}

/**
 * Verifica se um mês de competência está fechado no FinDomus
 */
async function isMonthClosed(userId: string, owner: 'PF' | 'PJ', monthKey: string): Promise<boolean> {
  if (!monthKey) return false;
  try {
    const closureSnap = await adminDb
      .collection('monthly_closures')
      .where('userId', '==', userId)
      .where('owner', '==', owner)
      .where('month', '==', monthKey)
      .limit(1)
      .get();
    
    if (closureSnap.empty) return false;
    const closureData = closureSnap.docs[0].data();
    return closureData.status === 'CLOSED';
  } catch (e) {
    console.error(`[Pluggy Sync] Error checking monthly closure for month ${monthKey}:`, e);
    return false;
  }
}

/**
 * Executa a sincronização completa das Contas, Saldos, Transações e Investimentos do Item.
 * Implementa Lock Distribuído, Expiração Automática, Novas Métricas de Economia,
 * Atualização Automática de Snapshots de Servidor e Copiloto IA (Genkit).
 */
export async function syncItem(
  userId: string,
  itemId: string,
  trigger: 'MANUAL' | 'SCHEDULER' | 'WEBHOOK' = 'MANUAL',
  schedulerExecutionId: string | null = null
): Promise<{
  success: boolean;
  accountsSynced: number;
  transactionsSynced: number;
  investmentsSynced: number;
}> {
  const startedAt = new Date();
  const lockStartTime = Date.now();
  const executionId = schedulerExecutionId || (trigger === 'SCHEDULER' ? 'sched_' + Math.random().toString(36).substring(2, 11) : 'manual_' + Date.now().toString(36));

  console.log(`[Pluggy Sync] [${trigger}] Starting sync for user ${userId}, itemId ${itemId}. Execution ID: ${executionId}`);

  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  let errors: string[] = [];
  let accountsImported = 0;
  let transactionsImported = 0;
  let transactionsIgnored = 0;
  let transactionsDuplicated = 0;
  let receivedTransactionsCount = 0;
  let investmentsImported = 0;
  let maxDateISO: string | null = null;
  let aiSummary = '';

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  const connectionRef = adminDb.collection('bank_connections').doc(itemId);
  let connectionData: any = {};
  let lockAcquired = false;

  try {
    // 1. Tentar adquirir o lock concorrente de forma atômica
    await adminDb.runTransaction(async (transaction) => {
      const connDoc = await transaction.get(connectionRef);
      if (!connDoc.exists) {
        throw new Error(`Connection ${itemId} not found in database.`);
      }
      
      connectionData = connDoc.data()!;
      const syncLock = connectionData.syncLock || false;
      const syncStartedAtStr = connectionData.syncStartedAt || null;

      let isLockActive = false;
      if (syncLock && syncStartedAtStr) {
        const startedTime = new Date(syncStartedAtStr).getTime();
        const elapsedMinutes = (Date.now() - startedTime) / (60 * 1000);
        // Se o lock tiver menos de 15 minutos, consideramos ativo
        if (elapsedMinutes < 15) {
          isLockActive = true;
        } else {
          console.warn(`[Pluggy Sync] Lock expired (elapsed: ${elapsedMinutes.toFixed(1)}m). Re-acquiring lock.`);
        }
      }

      if (isLockActive) {
        throw new Error('LOCK_ACTIVE');
      }

      // Adquirir o lock atômico e mudar status para SYNCING
      transaction.update(connectionRef, {
        syncLock: true,
        syncStartedAt: startedAt.toISOString(),
        status: 'SYNCING',
        updatedAt: startedAt.toISOString()
      });
      lockAcquired = true;
    });

    const lockWaitMs = Date.now() - lockStartTime;
    console.log(`[Pluggy Sync] [${trigger}] Lock acquired in ${lockWaitMs}ms.`);

    if (!clientId || !clientSecret) {
      throw new Error('Pluggy API credentials missing on server');
    }

    const client = new PluggyClient({
      clientId,
      clientSecret,
    });

    // 2. Resolver householdId do usuário
    let householdId = null;
    try {
      householdId = await resolveUserHouseholdId(userId);
    } catch (e) {
      console.warn(`[Pluggy Sync] Could not resolve householdId for user ${userId}:`, e);
    }

    // 3. Sincronizar Contas e Saldos
    const accountsMap = await syncAccountsAndBalances(userId, itemId, client, householdId);
    accountsImported = accountsMap.size;
    
    // 4. Sincronizar Transações (Incremental ou Fallback 30 dias)
    const lastTransactionDate = connectionData?.lastTransactionDate || null;
    const txResult = await syncTransactions(userId, itemId, client, accountsMap, householdId, lastTransactionDate);
    
    receivedTransactionsCount = txResult.received;
    transactionsImported = txResult.imported;
    transactionsDuplicated = txResult.duplicated;
    transactionsIgnored = txResult.ignored;
    maxDateISO = txResult.maxDateISO;

    // 5. Sincronizar Investimentos
    investmentsImported = await syncInvestments(userId, itemId, client, householdId);

    // 6. Recalcular e atualizar Snapshots do usuário do lado do servidor (offline)
    await forceUpdateAllSnapshotsAdmin(userId);

    // 7. Chamar Copiloto IA (Genkit) para gerar resumo com base exclusiva nos Snapshots
    try {
      const { loadSnapshotsForIA } = await import('@/ai/tools/load-snapshots');
      const snapshots = await loadSnapshotsForIA(userId);

      const promptText = `Você é o Copiloto Financeiro Domus.
Gere um resumo estruturado rápido e inteligente da saúde financeira do usuário logo após uma sincronização automática de contas via Open Finance.
Resumos do ciclo recente:
- Novas transações importadas: ${transactionsImported}
- Transações duplicadas filtradas: ${transactionsDuplicated}
- Transações de meses fechados ignoradas: ${transactionsIgnored}
- Investimentos sincronizados: ${investmentsImported}

Dados consolidados atualizados dos Snapshots:
Dashboard Snapshot: ${JSON.stringify(snapshots.dashboard?.data || {})}
Planejamento Snapshot: ${JSON.stringify(snapshots.planning?.data || {})}
Investimento Snapshot: ${JSON.stringify(snapshots.investment?.data || {})}
Passivos Snapshot: ${JSON.stringify(snapshots.liability?.data || {})}

Gere um resumo em português do Brasil, curto e elegante em Markdown com bullet points curtos (Insights Rápidos de IA). Aponte variações interessantes de gastos por categorias, evolução patrimonial ou cobertura da reserva de emergência se aplicável. Não faça perguntas nem adicione introduções formais. Responda em tópicos curtos.`;

      const aiResponse = await ai.generate({
        prompt: promptText
      });
      aiSummary = aiResponse.text || 'Sem insights disponíveis para esta sincronização.';
    } catch (aiErr) {
      console.warn('[Pluggy Sync] AI Summary generation failed:', aiErr);
      aiSummary = 'A sincronização concluiu com sucesso, mas o resumo de IA não pôde ser gerado temporariamente.';
    }

    // 8. Atualizar conexão como ACTIVE e resetar falhas
    const updatePayload: any = {
      status: 'ACTIVE',
      failureCount: 0,
      lastError: null,
      lastErrorAt: null,
      lastSuccessfulSync: new Date().toISOString(),
      lastSyncAISummary: aiSummary,
      updatedAt: new Date().toISOString()
    };

    if (maxDateISO) {
      const currentMax = connectionData?.lastTransactionDate || '';
      if (maxDateISO > currentMax) {
        updatePayload.lastTransactionDate = maxDateISO;
      }
    }

    if (trigger === 'MANUAL') {
      updatePayload.lastManualSync = new Date().toISOString();
    } else if (trigger === 'WEBHOOK') {
      updatePayload.lastWebhook = new Date().toISOString();
    }

    await connectionRef.update(updatePayload);

  } catch (error: any) {
    if (error.message === 'LOCK_ACTIVE') {
      return { success: false, accountsSynced: 0, transactionsSynced: 0, investmentsSynced: 0 };
    }

    status = 'FAILED';
    const errorMsg = error.message || String(error);
    errors.push(errorMsg);
    console.error(`[Pluggy Sync] [${trigger}] Error during synchronization:`, error);

    // Tratar política de erro e resiliência de falhas
    try {
      const errorMsgLower = errorMsg.toLowerCase();
      const isRevoked = errorMsgLower.includes('consent expired') || 
                        errorMsgLower.includes('revoked') || 
                        errorMsgLower.includes('unauthorized') || 
                        errorMsgLower.includes('401') ||
                        errorMsgLower.includes('403') ||
                        (error.status && (error.status === 401 || error.status === 403));
      
      let nextStatus = 'ACTIVE';
      const failureCount = (connectionData?.failureCount || 0) + 1;
      
      if (isRevoked) {
        nextStatus = 'REVOKED';
      } else if (failureCount >= 3) {
        nextStatus = 'ERROR';
      }

      const updatePayload: any = {
        status: nextStatus,
        failureCount,
        lastError: errorMsg,
        lastErrorAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (trigger === 'MANUAL') {
        updatePayload.lastManualSync = new Date().toISOString();
      } else if (trigger === 'WEBHOOK') {
        updatePayload.lastWebhook = new Date().toISOString();
      }

      await connectionRef.update(updatePayload);
    } catch (e) {
      console.error('[Pluggy Sync] Error updating connection with failure states:', e);
    }
  } finally {
    // 9. Sempre liberar o lock distribuído no final
    if (lockAcquired) {
      try {
        await connectionRef.update({
          syncLock: false,
          syncStartedAt: null
        });
        console.log(`[Pluggy Sync] Lock successfully released for connection ${itemId}.`);
      } catch (e) {
        console.error(`[Pluggy Sync] Failed to release lock for connection ${itemId}:`, e);
      }
    }
  }

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();
  const lockWaitMs = Date.now() - lockStartTime - durationMs;

  // 10. Salvar Auditoria Expandida (pluggy_sync_logs)
  try {
    const importRate = receivedTransactionsCount > 0 ? Math.round((transactionsImported / receivedTransactionsCount) * 100) : 0;
    const duplicateRate = receivedTransactionsCount > 0 ? Math.round((transactionsDuplicated / receivedTransactionsCount) * 100) : 0;

    await adminDb.collection('pluggy_sync_logs').add({
      userId,
      itemId,
      institution: connectionData?.institution || 'Instituição Financeira',
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs,
      accountsImported,
      transactionsImported,
      transactionsIgnored,
      transactionsDuplicated,
      investmentsImported,
      errors,
      status,
      trigger,
      lockWaitMs,
      lockAcquired,
      receivedTransactions: receivedTransactionsCount,
      importRate,
      duplicateRate,
      skippedClosedMonths: transactionsIgnored,
      schedulerExecutionId: executionId,
      serverVersion: '1.1.0',
      buildId: 'production_build_rc4',
      aiSummary: aiSummary || null,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Pluggy Sync] Error saving audit logs:', e);
  }

  // 11. Registrar Métricas Avançadas de Economia em system_metrics
  try {
    // Métricas de Tempo
    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_sync_duration_ms',
      value: durationMs,
      domain: 'pluggy',
      extra: { trigger, status, itemId },
      timestamp: new Date().toISOString(),
    });

    // Novas Métricas de Economia e Transações
    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_transactions_received',
      value: receivedTransactionsCount,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_transactions_imported',
      value: transactionsImported,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_transactions_duplicated',
      value: transactionsDuplicated,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_transactions_skipped_closed_month',
      value: transactionsIgnored,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_accounts_imported',
      value: accountsImported,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    await adminDb.collection('system_metrics').add({
      userId,
      metric: 'pluggy_investments_imported',
      value: investmentsImported,
      domain: 'pluggy',
      extra: { itemId },
      timestamp: new Date().toISOString(),
    });

    // Registrar taxa de sucesso ou falha
    await adminDb.collection('system_metrics').add({
      userId,
      metric: status === 'SUCCESS' ? 'pluggy_sync_success_rate' : 'pluggy_sync_failures',
      value: status === 'SUCCESS' ? 100 : 1,
      domain: 'pluggy',
      extra: { itemId, trigger },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[Pluggy Sync] Error logging system metrics:', e);
  }

  return {
    success: status === 'SUCCESS',
    accountsSynced: accountsImported,
    transactionsSynced: transactionsImported,
    investmentsSynced: investmentsImported,
  };
}

/**
 * Busca e sincroniza as contas bancárias associadas ao Item
 * Retorna um Map unindo o pluggyAccountId -> accountId (interno do FinDomus)
 */
async function syncAccountsAndBalances(
  userId: string,
  itemId: string,
  client: PluggyClient,
  householdId: string | null
): Promise<Map<string, string>> {
  const accountsMap = new Map<string, string>();
  
  const pluggyAccountsResponse = await client.fetchAccounts(itemId);
  const pluggyAccounts = pluggyAccountsResponse.results;
  
  const existingAccountsSnap = await adminDb
    .collection('accounts')
    .where('userId', '==', userId)
    .get();

  const existingAccounts = existingAccountsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  for (const pAcc of pluggyAccounts) {
    const matched = existingAccounts.find(acc => acc.pluggyAccountId === pAcc.id);
    
    const type = mapAccountType(pAcc.type, pAcc.subtype);
    const isPj = pAcc.taxNumber && pAcc.taxNumber.replace(/\D/g, '').length === 14;
    const owner = isPj ? 'PJ' : 'PF';

    const accountData: any = {
      name: pAcc.name || pAcc.marketingName || 'Conta Integrada',
      type,
      owner,
      balance: Number(pAcc.balance || 0),
      userId,
      householdId,
      pluggyAccountId: pAcc.id,
      pluggyItemId: itemId,
      updatedAt: new Date().toISOString(),
    };

    let accountId = '';
    if (matched) {
      accountId = matched.id;
      await adminDb.collection('accounts').doc(accountId).update(accountData);
    } else {
      accountData.createdAt = new Date().toISOString();
      const newDocRef = await adminDb.collection('accounts').add(accountData);
      accountId = newDocRef.id;
    }

    accountsMap.set(pAcc.id, accountId);

    financialEvents.emit({
      type: 'account:updated',
      payload: { accountId },
      timestamp: new Date().toISOString(),
      source: 'pluggySync:accounts',
    });
  }

  return accountsMap;
}

/**
 * Sincroniza as transações de forma incremental ou fallback de 30 dias
 */
async function syncTransactions(
  userId: string,
  itemId: string,
  client: PluggyClient,
  accountsMap: Map<string, string>,
  householdId: string | null,
  lastTransactionDate: string | null
): Promise<{
  received: number;
  imported: number;
  duplicated: number;
  ignored: number;
  maxDateISO: string | null;
}> {
  if (accountsMap.size === 0) {
    return { received: 0, imported: 0, duplicated: 0, ignored: 0, maxDateISO: null };
  }

  let dateFromStr = '';
  if (lastTransactionDate) {
    dateFromStr = lastTransactionDate;
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dateFromStr = thirtyDaysAgo.toISOString().slice(0, 10);
  }

  let totalReceived = 0;
  let totalInserted = 0;
  let totalDuplicated = 0;
  let totalIgnored = 0;
  let globalMaxDateISO = '';

  const classificationContext = await buildClassificationContext(userId);

  for (const [pluggyAccountId, internalAccountId] of accountsMap.entries()) {
    let pluggyTxResponse;
    try {
      pluggyTxResponse = await client.fetchAllTransactions(pluggyAccountId, {
        dateFrom: dateFromStr
      });
    } catch (e) {
      console.error(`[Pluggy Sync] Error fetching transactions for account ${pluggyAccountId}:`, e);
      continue;
    }

    if (!pluggyTxResponse || pluggyTxResponse.length === 0) continue;

    totalReceived += pluggyTxResponse.length;

    const accDoc = await adminDb.collection('accounts').doc(internalAccountId).get();
    const accData = accDoc.data();
    const owner = (accData?.owner || 'PF') as 'PF' | 'PJ';

    const candidates = [];
    for (const pTx of pluggyTxResponse) {
      const amount = Math.abs(pTx.amount || 0);
      if (!amount) continue;

      const dateStr = pTx.date instanceof Date 
        ? pTx.date.toISOString().slice(0, 10)
        : typeof pTx.date === 'string'
          ? (pTx.date as string).slice(0, 10)
          : new Date().toISOString().slice(0, 10);

      if (dateStr > globalMaxDateISO) {
        globalMaxDateISO = dateStr;
      }

      const normalizedDate = normalizeTransactionDate(dateStr);
      const monthKey = normalizedDate.monthKey;

      const isClosed = await isMonthClosed(userId, owner, monthKey);
      if (isClosed) {
        totalIgnored++;
        continue;
      }

      const description = pTx.description || pTx.descriptionRaw || 'Transação';
      const classified = classifyTransactionWithContext(description, pTx.amount, classificationContext);
      const type = pTx.type === 'DEBIT' ? 'expense' : 'income';

      const importHash = generateImportHash({
        date: normalizedDate.dateISO || normalizedDate.date,
        amount,
        description,
        merchant: pTx.descriptionRaw || '',
        owner,
        externalId: pTx.id,
      });

      candidates.push({
        userId,
        householdId,
        accountId: internalAccountId,
        type,
        amount,
        category: classified.category || 'Outros',
        description,
        merchant: pTx.descriptionRaw || description,
        date: normalizedDate.date,
        dateISO: normalizedDate.dateISO,
        monthKey: normalizedDate.monthKey,
        competenceMonthKey: normalizedDate.monthKey,
        owner,
        importHash,
        externalId: pTx.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (candidates.length === 0) continue;

    const hashes = candidates.map(c => c.importHash);
    const existingHashes = new Set<string>();

    for (let i = 0; i < hashes.length; i += 30) {
      const chunk = hashes.slice(i, i + 30);
      const snap = await adminDb
        .collection('transactions')
        .where('userId', '==', userId)
        .where('owner', '==', owner)
        .where('importHash', 'in', chunk)
        .get();

      snap.docs.forEach(doc => {
        const hash = doc.data().importHash;
        if (hash) existingHashes.add(hash);
      });
    }

    const toInsert = candidates.filter(c => !existingHashes.has(c.importHash));
    totalDuplicated += (candidates.length - toInsert.length);

    if (toInsert.length > 0) {
      const batch = adminDb.batch();
      for (const item of toInsert) {
        const docRef = adminDb.collection('transactions').doc();
        batch.set(docRef, item);
      }
      await batch.commit();
      totalInserted += toInsert.length;
    }
  }

  if (totalInserted > 0) {
    financialEvents.emit({
      type: 'transaction:created',
      payload: { count: totalInserted },
      timestamp: new Date().toISOString(),
      source: 'pluggySync:transactions',
    });
  }

  return {
    received: totalReceived,
    imported: totalInserted,
    duplicated: totalDuplicated,
    ignored: totalIgnored,
    maxDateISO: globalMaxDateISO || null,
  };
}

/**
 * Sincroniza investimentos
 */
async function syncInvestments(
  userId: string,
  itemId: string,
  client: PluggyClient,
  householdId: string | null
): Promise<number> {
  let pluggyInvestmentsResponse;
  try {
    pluggyInvestmentsResponse = await client.fetchInvestments(itemId);
  } catch (e) {
    console.warn(`[Pluggy Sync] Investments not supported or failed to fetch:`, e);
    return 0;
  }

  const pluggyInvestments = pluggyInvestmentsResponse.results;
  if (!pluggyInvestments || pluggyInvestments.length === 0) return 0;

  const existingInvestmentsSnap = await adminDb
    .collection('investments')
    .where('userId', '==', userId)
    .get();

  const existingInvestments = existingInvestmentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  let updatedOrCreatedCount = 0;

  for (const pInv of pluggyInvestments) {
    const ticker = pInv.code ? String(pInv.code).trim().toUpperCase() : '';
    
    let matched = null;
    if (ticker) {
      matched = existingInvestments.find(inv => inv.ticker === ticker);
    }
    if (!matched) {
      matched = existingInvestments.find(inv => inv.pluggyInvestmentId === pInv.id || inv.externalId === pInv.id);
    }

    const value = Number(pInv.balance || pInv.amount || 0);

    const investmentData: any = {
      type: pInv.type || pInv.subtype || 'OUTROS',
      institution: pInv.itemId,
      ticker,
      quantity: 1,
      averagePrice: value,
      currentPrice: value,
      currentValue: value,
      contributions: Number(pInv.amountOriginal || value),
      updatedAt: new Date().toISOString(),
      pluggyInvestmentId: pInv.id,
      externalId: pInv.id,
      userId,
      householdId,
    };

    if (matched) {
      await adminDb.collection('investments').doc(matched.id).update(investmentData);
      financialEvents.emit({
        type: 'investment:updated',
        payload: { investmentId: matched.id },
        timestamp: new Date().toISOString(),
        source: 'pluggySync:investments',
      });
    } else {
      investmentData.createdAt = new Date().toISOString();
      const newDocRef = await adminDb.collection('investments').add(investmentData);
      financialEvents.emit({
        type: 'investment:created',
        payload: { investmentId: newDocRef.id },
        timestamp: new Date().toISOString(),
        source: 'pluggySync:investments',
      });
    }

    updatedOrCreatedCount++;
  }

  return updatedOrCreatedCount;
}
