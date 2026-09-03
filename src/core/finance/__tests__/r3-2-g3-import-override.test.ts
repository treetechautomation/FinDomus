import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  resolveImportRefundOverride,
  applyImportReviewOverrides,
} from '../../../utils/transaction-display';
import { shouldUpsertLiabilityFromTransaction } from '../../../services/firestore/liabilities';

describe('R3.2-G3 IMPORT PREVIEW — PURE RESOLVER', () => {
  it('G3-01: auto refund true, no manual override -> true', () => {
    const res = resolveImportRefundOverride('expense', true, undefined);
    assert.strictEqual(res, true);
  });

  it('G3-02: auto refund false, no manual override -> false', () => {
    const res = resolveImportRefundOverride('expense', false, undefined);
    assert.strictEqual(res, false);
  });

  it('G3-03: auto refund true, manual false -> false', () => {
    const res = resolveImportRefundOverride('expense', true, false);
    assert.strictEqual(res, false, 'Manual override to false MUST clear refund');
  });

  it('G3-04: auto refund false, manual true -> true', () => {
    const res = resolveImportRefundOverride('expense', false, true);
    assert.strictEqual(res, true, 'Manual override to true MUST promote to refund');
  });

  it('G3-05: income, manual true -> false', () => {
    const res = resolveImportRefundOverride('income', false, true);
    assert.strictEqual(res, false, 'Income cannot be an expense refund');
  });

  it('G3-06: transfer, manual true -> false', () => {
    const res = resolveImportRefundOverride('transfer', false, true);
    assert.strictEqual(res, false, 'Transfer cannot be an expense refund');
  });

  it('G3-11: installment preview, manual refund true -> allowed', () => {
    const installmentTx = {
      type: 'expense' as const,
      amount: 200,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 5,
      isRefund: false,
    };

    const effectiveIsRefund = resolveImportRefundOverride(installmentTx.type, installmentTx.isRefund, true);
    assert.strictEqual(effectiveIsRefund, true, 'Preview installment CAN be marked as refund');
  });

  it('G3-12: installment preview refund true -> liability guard false', () => {
    const installmentTx = {
      type: 'expense' as const,
      amount: 200,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 5,
      isRefund: resolveImportRefundOverride('expense', false, true),
    };

    assert.strictEqual(installmentTx.isRefund, true);
    const shouldUpsert = shouldUpsertLiabilityFromTransaction(installmentTx);
    assert.strictEqual(shouldUpsert, false, 'Refund installment MUST be rejected by liability guard');
  });

  it('G3-13: installment auto refund true, manual false -> effective normal installment', () => {
    const autoRefundInstallment = {
      type: 'expense' as const,
      amount: 200,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 5,
      isRefund: true,
    };

    const effectiveIsRefund = resolveImportRefundOverride(
      autoRefundInstallment.type,
      autoRefundInstallment.isRefund,
      false
    );
    assert.strictEqual(effectiveIsRefund, false);

    const normalInstallment = { ...autoRefundInstallment, isRefund: effectiveIsRefund };
    const shouldUpsert = shouldUpsertLiabilityFromTransaction(normalInstallment);
    assert.strictEqual(shouldUpsert, true, 'Unmarked installment becomes normal installment eligible for liability');
  });

  it('G3-14: override does not change amount', () => {
    const tx = { amount: 350.75, type: 'expense', isRefund: false };
    const effectiveIsRefund = resolveImportRefundOverride(tx.type, tx.isRefund, true);
    const resultTx = { ...tx, isRefund: effectiveIsRefund };

    assert.strictEqual(resultTx.amount, 350.75);
    assert.strictEqual(Math.abs(resultTx.amount), 350.75);
  });

  it('G3-15: override does not change type', () => {
    const tx = { type: 'expense' as const, isRefund: false };
    const effectiveIsRefund = resolveImportRefundOverride(tx.type, tx.isRefund, true);
    const resultTx = { ...tx, isRefund: effectiveIsRefund };

    assert.strictEqual(resultTx.type, 'expense');
  });

  it('G3-16: no type=refund', () => {
    const type: 'expense' | 'income' = 'expense';
    const isRefund = resolveImportRefundOverride(type, false, true);

    assert.strictEqual(type, 'expense');
    assert.notStrictEqual(type, 'refund');
    assert.strictEqual(isRefund, true);
  });
});

describe('R3.2-G3-P1 REAL CONFIRMATION TRUTH (applyImportReviewOverrides)', () => {
  it('P1-01: accepted normal + override true -> output isRefund=true', () => {
    const txs = [{ id: 'tx1', importHash: 'h1', type: 'expense', amount: 100, isRefund: false }];
    const overrides = { h1: { isRefund: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].isRefund, true);
  });

  it('P1-02: accepted auto refund + override false -> output isRefund=false', () => {
    const txs = [{ id: 'tx2', importHash: 'h2', type: 'expense', amount: 100, isRefund: true }];
    const overrides = { h2: { isRefund: false } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].isRefund, false);
  });

  it('P1-03: ignored + override true -> não aparece no output', () => {
    const txs = [{ id: 'tx3', importHash: 'h3', type: 'expense', amount: 100, isRefund: false }];
    const overrides = { h3: { isRefund: true, ignored: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 0, 'Ignored row must be completely excluded from confirmed output');
  });

  it('P1-04: ignored + override false -> não aparece no output', () => {
    const txs = [{ id: 'tx4', importHash: 'h4', type: 'expense', amount: 100, isRefund: true }];
    const overrides = { h4: { isRefund: false, ignored: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 0, 'Ignored row must be completely excluded from confirmed output');
  });

  it('P1-05: income + override true -> output false', () => {
    const txs = [{ id: 'tx5', importHash: 'h5', type: 'income', amount: 100, isRefund: false }];
    const overrides = { h5: { isRefund: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].isRefund, false);
  });

  it('P1-06: transfer + override true -> output false', () => {
    const txs = [{ id: 'tx6', importHash: 'h6', type: 'transfer', amount: 100, isRefund: false }];
    const overrides = { h6: { isRefund: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].isRefund, false);
  });

  it('P1-07: original transaction não é mutada', () => {
    const originalTx = { id: 'tx7', importHash: 'h7', type: 'expense', amount: 100, isRefund: false };
    const originalSnapshot = JSON.stringify(originalTx);
    const overrides = { h7: { isRefund: true } };

    const confirmed = applyImportReviewOverrides([originalTx], overrides);
    assert.strictEqual(JSON.stringify(originalTx), originalSnapshot, 'Original transaction object must remain unmutated');
    assert.strictEqual(confirmed[0].isRefund, true);
  });

  it('P1-08: amount não muda', () => {
    const txs = [{ id: 'tx8', importHash: 'h8', type: 'expense', amount: 250.45, isRefund: false }];
    const overrides = { h8: { isRefund: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed[0].amount, 250.45);
  });

  it('P1-09: type não muda pelo refund override', () => {
    const txs = [{ id: 'tx9', importHash: 'h9', type: 'expense', amount: 100, isRefund: false }];
    const overrides = { h9: { isRefund: true } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed[0].type, 'expense');
  });

  it('P1-10: expense + refund true + type override income -> income / isRefund=false', () => {
    const txs = [{ id: 'tx10', importHash: 'h10', type: 'expense', amount: 100, isRefund: false }];
    const overrides = { h10: { isRefund: true, type: 'income' } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].type, 'income');
    assert.strictEqual(confirmed[0].isRefund, false, 'Type override to income must clear refund');
  });

  it('P1-11: expense + refund true + type override transfer -> transfer / isRefund=false', () => {
    const txs = [{ id: 'tx11', importHash: 'h11', type: 'expense', amount: 100, isRefund: false }];
    const overrides = { h11: { isRefund: true, type: 'transfer' } };

    const confirmed = applyImportReviewOverrides(txs, overrides);
    assert.strictEqual(confirmed.length, 1);
    assert.strictEqual(confirmed[0].type, 'transfer');
    assert.strictEqual(confirmed[0].isRefund, false, 'Type override to transfer must clear refund');
  });
});
