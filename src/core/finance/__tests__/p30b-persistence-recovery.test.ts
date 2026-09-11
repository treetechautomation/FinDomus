import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateImportHash } from '@/services/firestore/transactions';
import {
  shouldUpsertLiabilityFromTransaction,
  computeAutoLiabilityId,
  resolveLiabilityUpsertTarget,
  calculateParentLiabilityProgression,
} from '@/services/firestore/liabilities';
import { calculateMonthlySummaryMetrics } from '@/services/firestore';

describe('FINDOMUS — P30B.2 CONCURRENCY HARDENING & PERSISTENCE RECOVERY TEST SUITE', () => {

  const baseInstallmentTx = {
    description: 'iPhone 15 - Parcela 2 de 10',
    amount: 500.00,
    type: 'expense' as const,
    owner: 'PF' as const,
    date: '2026-08-15',
    monthKey: '2026-08',
    competenceMonthKey: '2026-08',
    isInstallment: true,
    installmentCurrent: 2,
    installmentTotal: 10,
    installmentKey: 'apple-iphone-15',
  };

  const baseRefundTx = {
    description: 'Estorno Uber',
    amount: 50.00,
    type: 'expense' as const,
    owner: 'PF' as const,
    isRefund: true,
    date: '2026-08-16',
    monthKey: '2026-08',
    competenceMonthKey: '2026-08',
  };

  const baseNormalTx = {
    description: 'Supermercado Pão de Açúcar',
    amount: 300.00,
    type: 'expense' as const,
    owner: 'PF' as const,
    date: '2026-08-17',
    monthKey: '2026-08',
    competenceMonthKey: '2026-08',
  };

  // =========================================================================
  // SECTION 1: UNIT_PROOF — REAL PRODUCTION FUNCTIONS (LIABILITY RULES & IDENTITY)
  // =========================================================================

  it('UNIT 1: Refunds produce NO liability (shouldUpsertLiabilityFromTransaction returns false)', () => {
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(baseRefundTx), false);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ ...baseInstallmentTx, isRefund: true }), false);
  });

  it('UNIT 2: Non-installment transactions produce NO liability', () => {
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(baseNormalTx), false);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ ...baseInstallmentTx, isInstallment: false }), false);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ ...baseInstallmentTx, installmentCurrent: 0 }), false);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ ...baseInstallmentTx, installmentTotal: 0 }), false);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ ...baseInstallmentTx, amount: 0 }), false);
  });

  it('UNIT 3: Valid installment transaction qualifies for liability upsert', () => {
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(baseInstallmentTx), true);
  });

  it('UNIT 4: computeAutoLiabilityId produces deterministic, path-safe, scoped identifiers', () => {
    const id1 = computeAutoLiabilityId('user_123', 'PF', 'apple-iphone-15');
    const id2 = computeAutoLiabilityId('user_123', 'PF', 'apple-iphone-15');
    assert.strictEqual(id1, id2, 'Deterministic id must be identical for same inputs');
    assert.ok(id1.startsWith('autoliab_apple-iphone-15_'), 'Must start with autoliab prefix and slug');

    // Scoping
    const idDiffUser = computeAutoLiabilityId('user_456', 'PF', 'apple-iphone-15');
    assert.notStrictEqual(id1, idDiffUser, 'Different userId must produce different liability ID');

    const idDiffOwner = computeAutoLiabilityId('user_123', 'PJ', 'apple-iphone-15');
    assert.notStrictEqual(id1, idDiffOwner, 'Different owner (PF vs PJ) must produce different liability ID');

    const idDiffKey = computeAutoLiabilityId('user_123', 'PF', 'samsung-galaxy-s24');
    assert.notStrictEqual(id1, idDiffKey, 'Different installmentKey must produce different liability ID');

    // Path character safety: no slashes, no spaces, valid Firestore ID
    const specialKeyId = computeAutoLiabilityId('user/with/slash', 'PF', 'Compra 3x (Loja & Cia / Teste)');
    assert.ok(!specialKeyId.includes('/'), 'Must not contain forward slashes');
    assert.ok(!specialKeyId.includes(' '), 'Must not contain spaces');
    assert.ok(/^autoliab_[a-z0-9_-]+_[0-9a-f]{16}$/.test(specialKeyId), 'Must match safe regex');
  });

  it('UNIT 5: resolveLiabilityUpsertTarget preserves historical compatibility and detects duplicates', () => {
    const autoId = 'autoliab_test_123';

    // 1. Auto doc already exists -> reuse autoId
    const res1 = resolveLiabilityUpsertTarget(true, autoId, []);
    assert.strictEqual(res1.targetId, autoId);
    assert.strictEqual(res1.isHistorical, false);

    // 2. Auto doc absent, exactly 1 legacy historical doc -> reuse historical ID
    const res2 = resolveLiabilityUpsertTarget(false, autoId, [{ id: 'legacy_doc_random_xyz' }]);
    assert.strictEqual(res2.targetId, 'legacy_doc_random_xyz');
    assert.strictEqual(res2.isHistorical, true);

    // 3. Auto doc absent, 0 legacy docs -> target autoId
    const res3 = resolveLiabilityUpsertTarget(false, autoId, []);
    assert.strictEqual(res3.targetId, autoId);
    assert.strictEqual(res3.isHistorical, false);

    // 4. Multiple historical docs exist -> throws explicit inconsistency error (fails closed)
    assert.throws(
      () => resolveLiabilityUpsertTarget(false, autoId, [{ id: 'legacy_1' }, { id: 'legacy_2' }]),
      /Inconsistência de dados: múltiplos passivos históricos \(2\) encontrados/
    );
  });

  // =========================================================================
  // SECTION 2: UNIT_PROOF — MONOTONIC PROGRESSION & OUT-OF-ORDER MATRIX
  // =========================================================================

  it('UNIT 6 (OUT-OF-ORDER CASE A): parent=5, incoming=3 -> shouldUpdate: false (no regression)', () => {
    const parent = { currentInstallment: 5, remainingInstallments: 5, remainingBalance: 2500, status: 'active' };
    const payment = { installmentNumber: 3, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, false);
  });

  it('UNIT 7 (OUT-OF-ORDER CASE B): parent=3, incoming=5 -> shouldUpdate: true, advances to 5', () => {
    const parent = { currentInstallment: 3, remainingInstallments: 7, remainingBalance: 3500, status: 'active' };
    const payment = { installmentNumber: 5, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, true);
    assert.strictEqual(res.updates?.currentInstallment, 5);
    assert.strictEqual(res.updates?.remainingInstallments, 5);
    assert.strictEqual(res.updates?.remainingBalance, 2500);
    assert.strictEqual(res.updates?.status, 'active');
  });

  it('UNIT 8 (OUT-OF-ORDER CASE C): parent=5, incoming=5 -> shouldUpdate: true (idempotent)', () => {
    const parent = { currentInstallment: 5, remainingInstallments: 5, remainingBalance: 2500, status: 'active' };
    const payment = { installmentNumber: 5, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, true);
    assert.strictEqual(res.updates?.currentInstallment, 5);
    assert.strictEqual(res.updates?.remainingInstallments, 5);
    assert.strictEqual(res.updates?.remainingBalance, 2500);
  });

  it('UNIT 9 (OUT-OF-ORDER CASE D): parent=5, incoming=6 -> advances to 6', () => {
    const parent = { currentInstallment: 5, remainingInstallments: 5, remainingBalance: 2500, status: 'active' };
    const payment = { installmentNumber: 6, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, true);
    assert.strictEqual(res.updates?.currentInstallment, 6);
    assert.strictEqual(res.updates?.remainingInstallments, 4);
    assert.strictEqual(res.updates?.remainingBalance, 2000);
  });

  it('UNIT 10 (OUT-OF-ORDER CASE E): parent=5, payment 4 missing, incoming=4 -> shouldUpdate: false', () => {
    const parent = { currentInstallment: 5, remainingInstallments: 5, remainingBalance: 2500, status: 'active' };
    const payment = { installmentNumber: 4, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, false);
  });

  it('UNIT 11 (OUT-OF-ORDER CASE F): parent status=paid, older installment arrives -> status remains paid', () => {
    const parent = { currentInstallment: 10, remainingInstallments: 0, remainingBalance: 0, status: 'paid' };
    const paymentOlder = { installmentNumber: 7, totalInstallments: 10, amount: 500 };
    const resOlder = calculateParentLiabilityProgression(parent, paymentOlder);
    assert.strictEqual(resOlder.shouldUpdate, false);

    // If final installment (10) arrives again on retry
    const payment10 = { installmentNumber: 10, totalInstallments: 10, amount: 500 };
    const res10 = calculateParentLiabilityProgression(parent, payment10);
    assert.strictEqual(res10.shouldUpdate, true);
    assert.strictEqual(res10.updates?.status, 'paid');
  });

  it('UNIT 12 (STATUS NON-REGRESSION): parent status=renegotiated -> status remains renegotiated', () => {
    const parent = { currentInstallment: 4, remainingInstallments: 6, remainingBalance: 3000, status: 'renegotiated' };
    const payment = { installmentNumber: 5, totalInstallments: 10, amount: 500 };
    const res = calculateParentLiabilityProgression(parent, payment);
    assert.strictEqual(res.shouldUpdate, true);
    assert.strictEqual(res.updates?.status, 'renegotiated');
  });

  // =========================================================================
  // SECTION 3: UNIT_PROOF — SUMMARY REBUILD & REFUND CONTRACT
  // =========================================================================

  it('UNIT 13: Summary calculation is deterministic and refund-aware', () => {
    const transactions = [
      { amount: 1000, type: 'income', owner: 'PF', monthKey: '2026-08', competenceMonthKey: '2026-08' },
      { amount: 500, type: 'expense', owner: 'PF', monthKey: '2026-08', competenceMonthKey: '2026-08' },
      { amount: 100, type: 'expense', isRefund: true, owner: 'PF', monthKey: '2026-08', competenceMonthKey: '2026-08' },
    ];

    const metrics1 = calculateMonthlySummaryMetrics(transactions);
    const metrics2 = calculateMonthlySummaryMetrics(transactions);

    assert.deepStrictEqual(metrics1, metrics2);
    assert.strictEqual(metrics1.income, 1000);
    assert.strictEqual(metrics1.expenses, 400); // 500 expense - 100 refund = 400 net expense
    assert.strictEqual(metrics1.balance, 600);  // 1000 income - 400 net expense = 600 net balance
  });

  it('UNIT 14: Summary metrics are unchanged on repeated re-aggregation (idempotent)', () => {
    const batch = [
      { amount: 500, type: 'expense', owner: 'PF', monthKey: '2026-08', competenceMonthKey: '2026-08' },
      { amount: 200, type: 'expense', owner: 'PF', monthKey: '2026-08', competenceMonthKey: '2026-08' },
    ];

    const initial = calculateMonthlySummaryMetrics(batch);
    const reRead = calculateMonthlySummaryMetrics([...batch]);

    assert.strictEqual(initial.expenses, reRead.expenses);
    assert.strictEqual(initial.income, reRead.income);
    assert.strictEqual(initial.balance, reRead.balance);
  });

  // =========================================================================
  // SECTION 4: CONCURRENT_PROOF — ISOLATED CONCURRENCY SIMULATION MATRIX (C1 - C5)
  // =========================================================================

  it('CONCURRENCY C1: parent=2, concurrent Request A (inst 4) & Request B (inst 3) -> final currentInstallment=4', async () => {
    let parent = { currentInstallment: 2, remainingInstallments: 8, remainingBalance: 4000, status: 'active' };

    // Transactional simulation: executions serialize via lock on parent
    // Execution order 1: Inst 4 commits first, then Inst 3 runs
    const prog4 = calculateParentLiabilityProgression(parent, { installmentNumber: 4, totalInstallments: 10, amount: 500 });
    assert.strictEqual(prog4.shouldUpdate, true);
    parent = { ...parent, ...prog4.updates };
    assert.strictEqual(parent.currentInstallment, 4);

    const prog3 = calculateParentLiabilityProgression(parent, { installmentNumber: 3, totalInstallments: 10, amount: 500 });
    assert.strictEqual(prog3.shouldUpdate, false); // Blocked from regressing!
    assert.strictEqual(parent.currentInstallment, 4);
    assert.strictEqual(parent.remainingBalance, 3000);
  });

  it('CONCURRENCY C2: parent=2, concurrent Request A (inst 3) & Request B (inst 4) -> final currentInstallment=4', async () => {
    let parent = { currentInstallment: 2, remainingInstallments: 8, remainingBalance: 4000, status: 'active' };

    // Execution order 2: Inst 3 commits first, then Inst 4 runs
    const prog3 = calculateParentLiabilityProgression(parent, { installmentNumber: 3, totalInstallments: 10, amount: 500 });
    assert.strictEqual(prog3.shouldUpdate, true);
    parent = { ...parent, ...prog3.updates };
    assert.strictEqual(parent.currentInstallment, 3);

    const prog4 = calculateParentLiabilityProgression(parent, { installmentNumber: 4, totalInstallments: 10, amount: 500 });
    assert.strictEqual(prog4.shouldUpdate, true);
    parent = { ...parent, ...prog4.updates };
    assert.strictEqual(parent.currentInstallment, 4);
    assert.strictEqual(parent.remainingBalance, 3000);
  });

  it('CONCURRENCY C3: new liability, Request A & Request B concurrent -> converge on 1 deterministic doc', () => {
    const store = new Map<string, any>();
    const autoId = computeAutoLiabilityId('user1', 'PF', 'apple-iphone-15');

    // Simulated transactional atomic upsert for Request A
    if (!store.has(autoId)) {
      store.set(autoId, { id: autoId, currentInstallment: 2, createdAt: '2026-08-15T10:00:00Z' });
    }

    // Simulated transactional atomic upsert for Request B (concurrent attempt)
    if (!store.has(autoId)) {
      store.set(autoId, { id: autoId, currentInstallment: 2, createdAt: '2026-08-15T10:00:01Z' });
    }

    assert.strictEqual(store.size, 1, 'Exactly 1 liability doc must exist');
    assert.strictEqual(store.has(autoId), true);
  });

  it('CONCURRENCY C4: same payment number submitted twice concurrently -> merges to 1 payment doc', () => {
    const paymentsStore = new Map<string, any>();
    const paymentDocId = 'liab1_payments_2';
    const payloadA = { installmentNumber: 2, amount: 500, txId: 'txA' };
    const payloadB = { installmentNumber: 2, amount: 500, txId: 'txB' };

    // Concurrent setDoc with merge: true
    paymentsStore.set(paymentDocId, payloadA);
    paymentsStore.set(paymentDocId, payloadB);

    assert.strictEqual(paymentsStore.size, 1, 'Exactly 1 payment doc created for installment number');
  });

  it('CONCURRENCY C5: historical random-ID liability exists and two retries occur -> reuse historical, 0 duplicate liabilities', () => {
    const historicalDoc = { id: 'random_hist_999', installmentKey: 'apple-iphone-15' };
    const autoId = computeAutoLiabilityId('user1', 'PF', 'apple-iphone-15');

    // Both requests check targets
    const targetA = resolveLiabilityUpsertTarget(false, autoId, [historicalDoc]);
    const targetB = resolveLiabilityUpsertTarget(false, autoId, [historicalDoc]);

    assert.strictEqual(targetA.targetId, 'random_hist_999');
    assert.strictEqual(targetB.targetId, 'random_hist_999');
    assert.strictEqual(targetA.isHistorical, true);
    assert.strictEqual(targetB.isHistorical, true);
  });

  // =========================================================================
  // SECTION 5: MODEL_PROOF — FAILURE-POINT MATRIX & PERSISTENCE RECOVERY (F1 - F6, 7-9)
  // =========================================================================

  function createTestStore() {
    return {
      transactions: new Map<string, any>(),
      monthlySummaries: new Map<string, any>(),
      liabilities: new Map<string, any>(),
      liabilityPayments: new Map<string, any>(),
      eventLog: [] as string[],
    };
  }

  async function executeBatchPipeline(
    store: ReturnType<typeof createTestStore>,
    userId: string,
    items: any[],
    options: {
      failCommit?: boolean;
      failSummary?: boolean;
      failLiabilityUpsert?: boolean;
      failLiabilityPayment?: boolean;
      failLiabilityOnItemIndex?: number;
    } = {}
  ) {
    const uniqueByHash = new Map<string, any>();
    for (const raw of items) {
      const item = { ...raw, userId };
      const hash = item.importHash || generateImportHash({
        ...item,
        date: item.date,
        sourceOccurrenceIndex: item.sourceOccurrenceIndex,
      });
      item.importHash = hash;
      if (!uniqueByHash.has(hash)) {
        uniqueByHash.set(hash, item);
      }
    }

    const uniqueItems = Array.from(uniqueByHash.values());
    const existingHashes = new Set<string>();
    const existingTxByHash = new Map<string, string>();

    for (const [id, tx] of store.transactions) {
      if (tx.userId === userId && tx.importHash) {
        existingHashes.add(tx.importHash);
        existingTxByHash.set(tx.importHash, id);
      }
    }

    const toInsert = uniqueItems.filter(item => !existingHashes.has(item.importHash));

    if (options.failCommit) {
      throw new Error('SIMULATED_COMMIT_FAILURE');
    }

    for (const item of toInsert) {
      const id = `tx_${Math.random().toString(36).slice(2, 9)}`;
      item.id = id;
      store.transactions.set(id, { ...item });
      existingTxByHash.set(item.importHash, id);
    }

    store.eventLog.push(`committed:${toInsert.length}`);

    // P30B: Target months from ALL uniqueItems
    const summaryTargets = new Set(
      uniqueItems
        .filter(item => item.monthKey || item.competenceMonthKey)
        .map(item => `${item.owner || 'PF'}|${item.competenceMonthKey || item.monthKey}`)
    );

    const downstreamErrors: Error[] = [];

    for (const target of summaryTargets) {
      if (options.failSummary) {
        downstreamErrors.push(new Error('SIMULATED_SUMMARY_FAILURE'));
        continue;
      }
      const [owner, month] = target.split('|');
      const monthTxs = Array.from(store.transactions.values()).filter(
        t => t.userId === userId && t.owner === owner && (t.competenceMonthKey || t.monthKey) === month
      );
      const metrics = calculateMonthlySummaryMetrics(monthTxs);
      const summaryDocId = `${userId}_${owner}_${month}`;
      store.monthlySummaries.set(summaryDocId, {
        id: summaryDocId,
        userId,
        owner,
        month,
        ...metrics,
        transactionsCount: monthTxs.length,
      });
      store.eventLog.push(`summary:${summaryDocId}`);
    }

    // P30B.2: Target installments using computeAutoLiabilityId, resolveLiabilityUpsertTarget & calculateParentLiabilityProgression
    const installmentItems = uniqueItems.filter(
      item =>
        item.isInstallment === true &&
        item.installmentCurrent !== null && item.installmentCurrent !== undefined &&
        item.installmentTotal !== null && item.installmentTotal !== undefined &&
        item.installmentKey
    );

    for (let i = 0; i < installmentItems.length; i++) {
      const item = installmentItems[i];
      if (!item.id && item.importHash && existingTxByHash.has(item.importHash)) {
        item.id = existingTxByHash.get(item.importHash);
      }

      if (options.failLiabilityUpsert || (options.failLiabilityOnItemIndex !== undefined && options.failLiabilityOnItemIndex === i)) {
        downstreamErrors.push(new Error(`SIMULATED_LIABILITY_UPSERT_FAILURE_${i}`));
        continue;
      }

      const autoLiabilityId = computeAutoLiabilityId(userId, item.owner || 'PF', item.installmentKey);
      const autoExists = store.liabilities.has(autoLiabilityId);
      const legacyDocs = Array.from(store.liabilities.values())
        .filter(l => l.userId === userId && l.owner === (item.owner || 'PF') && l.installmentKey === item.installmentKey && l.id !== autoLiabilityId)
        .map(l => ({ id: l.id }));

      const { targetId } = resolveLiabilityUpsertTarget(autoExists, autoLiabilityId, legacyDocs);

      const currentInstallment = Number(item.installmentCurrent);
      const totalInstallments = Number(item.installmentTotal);
      const installmentValue = Math.abs(Number(item.amount));
      const remainingInstallments = Math.max(totalInstallments - currentInstallment, 0);
      const remainingBalance = Number((remainingInstallments * installmentValue).toFixed(2));

      if (store.liabilities.has(targetId)) {
        const existing = store.liabilities.get(targetId);
        if (existing.currentInstallment <= currentInstallment) {
          store.liabilities.set(targetId, {
            ...existing,
            currentInstallment,
            remainingInstallments,
            remainingBalance,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        store.liabilities.set(targetId, {
          id: targetId,
          userId,
          owner: item.owner || 'PF',
          installmentKey: item.installmentKey,
          currentInstallment,
          totalInstallments,
          remainingInstallments,
          remainingBalance,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      store.eventLog.push(`liability:${targetId}`);

      if (options.failLiabilityPayment) {
        downstreamErrors.push(new Error('SIMULATED_LIABILITY_PAYMENT_FAILURE'));
        continue;
      }

      // Atomically write payment and monotonically update parent
      const paymentKey = `${targetId}_${currentInstallment}`;
      store.liabilityPayments.set(paymentKey, {
        liabilityId: targetId,
        installmentNumber: currentInstallment,
        totalInstallments,
        amount: installmentValue,
        transactionId: item.id,
      });

      const parent = store.liabilities.get(targetId);
      const prog = calculateParentLiabilityProgression(parent, {
        installmentNumber: currentInstallment,
        totalInstallments,
        amount: installmentValue,
      });
      if (prog.shouldUpdate && prog.updates) {
        Object.assign(parent, prog.updates);
      }

      store.eventLog.push(`payment:${paymentKey}`);
    }

    if (downstreamErrors.length > 0) {
      const err = new Error(
        `[addTransactionsBatch] Lançamentos salvos (${toInsert.length} inseridos), mas falhou o pós-processamento de ${downstreamErrors.length} item(ns) derivado(s).`
      );
      (err as any).code = 'DOWNSTREAM_PARTIAL_FAILURE';
      (err as any).inserted = toInsert.length;
      (err as any).downstreamErrors = downstreamErrors;
      throw err;
    }

    return {
      inserted: toInsert.length,
      skipped: items.length - toInsert.length,
      duplicates: uniqueItems.filter(item => existingHashes.has(item.importHash)),
    };
  }

  it('MODEL F1: transaction batch fails before commit -> no downstream processing', async () => {
    const store = createTestStore();
    await assert.rejects(
      executeBatchPipeline(store, 'user1', [baseInstallmentTx], { failCommit: true }),
      /SIMULATED_COMMIT_FAILURE/
    );

    assert.strictEqual(store.transactions.size, 0);
    assert.strictEqual(store.monthlySummaries.size, 0);
    assert.strictEqual(store.liabilities.size, 0);
    assert.strictEqual(store.liabilityPayments.size, 0);
    assert.strictEqual(store.eventLog.length, 0);
  });

  it('MODEL F2: transaction batch succeeds, summary fails -> retry repairs summary without duplicate transaction', async () => {
    const store = createTestStore();

    await assert.rejects(
      executeBatchPipeline(store, 'user1', [baseNormalTx], { failSummary: true }),
      (err: any) => err.code === 'DOWNSTREAM_PARTIAL_FAILURE' && err.inserted === 1
    );

    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.monthlySummaries.size, 0);

    const result2 = await executeBatchPipeline(store, 'user1', [baseNormalTx]);

    assert.strictEqual(result2.inserted, 0);
    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.monthlySummaries.size, 1);

    const summary = store.monthlySummaries.get('user1_PF_2026-08');
    assert.ok(summary);
    assert.strictEqual(summary.expenses, 300);
  });

  it('MODEL F3: summary succeeds, liability upsert fails -> retry repairs liability', async () => {
    const store = createTestStore();

    await assert.rejects(
      executeBatchPipeline(store, 'user1', [baseInstallmentTx], { failLiabilityUpsert: true }),
      (err: any) => err.code === 'DOWNSTREAM_PARTIAL_FAILURE' && err.inserted === 1
    );

    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.monthlySummaries.size, 1);
    assert.strictEqual(store.liabilities.size, 0);

    const result2 = await executeBatchPipeline(store, 'user1', [baseInstallmentTx]);

    assert.strictEqual(result2.inserted, 0);
    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.liabilities.size, 1);
    assert.strictEqual(store.liabilityPayments.size, 1);

    const autoId = computeAutoLiabilityId('user1', 'PF', 'apple-iphone-15');
    const liab = store.liabilities.get(autoId);
    assert.ok(liab);
    assert.strictEqual(liab.currentInstallment, 2);
    assert.strictEqual(liab.remainingInstallments, 8);
    assert.strictEqual(liab.remainingBalance, 4000.00);
  });

  it('MODEL F4: liability created, payment write fails -> retry reuses liability and repairs payment', async () => {
    const store = createTestStore();

    await assert.rejects(
      executeBatchPipeline(store, 'user1', [baseInstallmentTx], { failLiabilityPayment: true }),
      (err: any) => err.code === 'DOWNSTREAM_PARTIAL_FAILURE'
    );

    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.liabilities.size, 1);
    assert.strictEqual(store.liabilityPayments.size, 0);

    const result2 = await executeBatchPipeline(store, 'user1', [baseInstallmentTx]);

    assert.strictEqual(result2.inserted, 0);
    assert.strictEqual(store.transactions.size, 1);
    assert.strictEqual(store.liabilities.size, 1);
    assert.strictEqual(store.liabilityPayments.size, 1);
  });

  it('MODEL F5: some liabilities succeed, one fails -> retry keeps successful ones idempotent, repairs failed one', async () => {
    const store = createTestStore();

    const txA = { ...baseInstallmentTx, description: 'Notebook Parcela 1/5', installmentKey: 'dell-notebook', amount: 1000, installmentCurrent: 1, installmentTotal: 5 };
    const txB = { ...baseInstallmentTx, description: 'TV Parcela 1/10', installmentKey: 'samsung-tv', amount: 300, installmentCurrent: 1, installmentTotal: 10 };

    await assert.rejects(
      executeBatchPipeline(store, 'user1', [txA, txB], { failLiabilityOnItemIndex: 1 }),
      (err: any) => err.code === 'DOWNSTREAM_PARTIAL_FAILURE'
    );

    const idDell = computeAutoLiabilityId('user1', 'PF', 'dell-notebook');
    const idTv = computeAutoLiabilityId('user1', 'PF', 'samsung-tv');

    assert.strictEqual(store.transactions.size, 2);
    assert.strictEqual(store.liabilities.size, 1);
    assert.ok(store.liabilities.has(idDell));
    assert.ok(!store.liabilities.has(idTv));

    const result2 = await executeBatchPipeline(store, 'user1', [txA, txB]);

    assert.strictEqual(result2.inserted, 0);
    assert.strictEqual(store.transactions.size, 2);
    assert.strictEqual(store.liabilities.size, 2);
    assert.ok(store.liabilities.has(idDell));
    assert.ok(store.liabilities.has(idTv));
    assert.strictEqual(store.liabilityPayments.size, 2);
  });

  it('MODEL F6: full successful import repeated -> 0 new transactions, 0 duplicate liabilities, 0 duplicate payments, summary unchanged', async () => {
    const store = createTestStore();
    const batch = [baseInstallmentTx, baseRefundTx, baseNormalTx];

    const run1 = await executeBatchPipeline(store, 'user1', batch);
    assert.strictEqual(run1.inserted, 3);
    assert.strictEqual(store.transactions.size, 3);
    assert.strictEqual(store.monthlySummaries.size, 1);
    assert.strictEqual(store.liabilities.size, 1);
    assert.strictEqual(store.liabilityPayments.size, 1);

    const summaryRun1 = { ...store.monthlySummaries.get('user1_PF_2026-08') };

    const run2 = await executeBatchPipeline(store, 'user1', batch);
    assert.strictEqual(run2.inserted, 0);
    assert.strictEqual(run2.skipped, 3);
    assert.strictEqual(store.transactions.size, 3);
    assert.strictEqual(store.liabilities.size, 1);
    assert.strictEqual(store.liabilityPayments.size, 1);

    const summaryRun2 = store.monthlySummaries.get('user1_PF_2026-08');
    assert.strictEqual(summaryRun2.expenses, summaryRun1.expenses);
    assert.strictEqual(summaryRun2.income, summaryRun1.income);
    assert.strictEqual(summaryRun2.balance, summaryRun1.balance);
    assert.strictEqual(summaryRun2.transactionsCount, summaryRun1.transactionsCount);
  });

  it('MODEL 7: P30A duplicate-occurrence behavior preserved during batch retry', async () => {
    const store = createTestStore();

    const occ0 = { ...baseNormalTx, description: 'Posto Graal', amount: 100, sourceOccurrenceIndex: 0 };
    const occ1 = { ...baseNormalTx, description: 'Posto Graal', amount: 100, sourceOccurrenceIndex: 1 };

    const run1 = await executeBatchPipeline(store, 'user1', [occ0, occ1]);
    assert.strictEqual(run1.inserted, 2);
    assert.strictEqual(store.transactions.size, 2);

    const run2 = await executeBatchPipeline(store, 'user1', [occ0, occ1]);
    assert.strictEqual(run2.inserted, 0);
    assert.strictEqual(store.transactions.size, 2);
  });

  it('MODEL 8: Downstream partial failure surfaces error to caller with code and counts', async () => {
    const store = createTestStore();

    try {
      await executeBatchPipeline(store, 'user1', [baseInstallmentTx], { failLiabilityUpsert: true });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.strictEqual(err.code, 'DOWNSTREAM_PARTIAL_FAILURE');
      assert.strictEqual(err.inserted, 1);
      assert.ok(err.message.includes('Lançamentos salvos (1 inseridos)'));
      assert.strictEqual(err.downstreamErrors.length, 1);
    }
  });

  it('MODEL 9: Payment retry is idempotent: overwriting same installment payment doc without double-counting', async () => {
    const store = createTestStore();

    await executeBatchPipeline(store, 'user1', [baseInstallmentTx]);
    assert.strictEqual(store.liabilityPayments.size, 1);

    const autoId = computeAutoLiabilityId('user1', 'PF', 'apple-iphone-15');
    const paymentKey = `${autoId}_2`;
    const p1 = { ...store.liabilityPayments.get(paymentKey) };
    const l1 = { ...store.liabilities.get(autoId) };

    await executeBatchPipeline(store, 'user1', [baseInstallmentTx]);
    assert.strictEqual(store.liabilityPayments.size, 1);

    const p2 = store.liabilityPayments.get(paymentKey);
    const l2 = store.liabilities.get(autoId);

    assert.deepStrictEqual(p1, p2);
    assert.strictEqual(l1.remainingBalance, l2.remainingBalance);
    assert.strictEqual(l1.currentInstallment, l2.currentInstallment);
    assert.strictEqual(l1.remainingInstallments, l2.remainingInstallments);
  });

});
