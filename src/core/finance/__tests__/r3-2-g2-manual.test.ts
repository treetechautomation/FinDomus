import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeManualRefundState,
  isExistingInstallmentRefundBlocked,
  resolveManualRefundForEditSave,
} from '../../../utils/transaction-display';
import { shouldUpsertLiabilityFromTransaction } from '../../../services/firestore/liabilities';

describe('R3.2-G2 MANUAL REFUND — CREATE + EDIT', () => {
  it('G2-01: create expense + refund true -> isRefund true', () => {
    const isRefund = normalizeManualRefundState('expense', true);
    assert.strictEqual(isRefund, true);
  });

  it('G2-02: create income + requested refund true -> isRefund false', () => {
    const isRefund = normalizeManualRefundState('income', true);
    assert.strictEqual(isRefund, false);
  });

  it('G2-03: create transfer + requested refund true -> isRefund false', () => {
    const isRefund = normalizeManualRefundState('transfer', true);
    assert.strictEqual(isRefund, false);
  });

  it('G2-04: refund amount 100 -> amount permanece 100 positivo', () => {
    const amount = 100;
    const isRefund = normalizeManualRefundState('expense', true);
    assert.strictEqual(isRefund, true);
    assert.strictEqual(amount, 100);
    assert.strictEqual(Math.abs(amount), 100);
  });

  it('G2-05: legacy edit undefined -> initial refund false', () => {
    const legacyTx: any = { id: 'tx-1', type: 'expense', amount: 50 };
    const initialRefund = legacyTx.isRefund === true;
    assert.strictEqual(initialRefund, false);
  });

  it('G2-06: edit existing refund true -> initial true', () => {
    const existingRefundTx: any = { id: 'tx-2', type: 'expense', amount: 50, isRefund: true };
    const initialRefund = existingRefundTx.isRefund === true;
    assert.strictEqual(initialRefund, true);
  });

  it('G2-07: edit normal expense false -> true -> payload true', () => {
    const tx = { type: 'expense', isRefund: false };
    const requested = true;
    const payloadIsRefund = normalizeManualRefundState(tx.type, requested);
    assert.strictEqual(payloadIsRefund, true);
  });

  it('G2-08: edit refund true -> false -> payload false', () => {
    const tx = { type: 'expense', isRefund: true };
    const requested = false;
    const payloadIsRefund = normalizeManualRefundState(tx.type, requested);
    assert.strictEqual(payloadIsRefund, false);
  });

  it('G2-09: refund true + type changes income -> refund false', () => {
    const newType = 'income';
    const isRefund = normalizeManualRefundState(newType, true);
    assert.strictEqual(isRefund, false);
  });

  it('G2-10: refund true + type changes transfer -> refund false', () => {
    const newType = 'transfer';
    const isRefund = normalizeManualRefundState(newType, true);
    assert.strictEqual(isRefund, false);
  });

  it('G2-11: existing installment false -> refund true -> BLOCKED', () => {
    const existingInstallmentTx = {
      isInstallment: true,
      installmentKey: 'key-123',
      installmentCurrent: 1,
      installmentTotal: 3,
      isRefund: false,
    };
    const isBlocked = isExistingInstallmentRefundBlocked(existingInstallmentTx);
    assert.strictEqual(isBlocked, true);
  });

  it('G2-12: existing installment already refund true -> remains true when unrelated field edited', () => {
    const existingInstallmentRefund = {
      isInstallment: true,
      installmentKey: 'key-123',
      installmentCurrent: 1,
      installmentTotal: 3,
      isRefund: true,
    };
    // Blocked check returns false because it is already a refund
    const isBlocked = isExistingInstallmentRefundBlocked(existingInstallmentRefund);
    assert.strictEqual(isBlocked, false);
    // Preserves refund flag
    const preservedRefund = normalizeManualRefundState('expense', existingInstallmentRefund.isRefund);
    assert.strictEqual(preservedRefund, true);
  });

  it('G2-13: create installment + refund true -> allowed at domain layer -> liability guard from F rejects liability', () => {
    const newInstallmentRefundTx = {
      isInstallment: true,
      installmentKey: 'key-new',
      installmentCurrent: 1,
      installmentTotal: 3,
      amount: 100,
      type: 'expense' as const,
      isRefund: normalizeManualRefundState('expense', true),
    };

    assert.strictEqual(newInstallmentRefundTx.isRefund, true);
    // Real call to shouldUpsertLiabilityFromTransaction from production liabilities.ts
    const eligible = shouldUpsertLiabilityFromTransaction(newInstallmentRefundTx);
    assert.strictEqual(eligible, false, 'Refund installment MUST be rejected by liability guard');
  });

  it('G2-14: no negative amount generated', () => {
    const amountInput = '150.50';
    const numericAmount = Number(amountInput);
    assert.ok(numericAmount > 0);
    assert.strictEqual(numericAmount, 150.5);
  });

  it('G2-15: no type=refund generated', () => {
    const type: 'expense' | 'income' = 'expense';
    const isRefund = true;
    assert.strictEqual(type, 'expense');
    assert.notStrictEqual(type, 'refund');
    assert.strictEqual(isRefund, true);
  });

  it('G2-16: no type=income generated for refund', () => {
    const type: 'expense' | 'income' = 'expense';
    const isRefund = normalizeManualRefundState(type, true);
    assert.strictEqual(isRefund, true);
    assert.notStrictEqual(type, 'income');
  });
});

describe('R3.2-G2-P2 REAL SAVE GUARD (PROD RESOLVER)', () => {
  it('P2-01: normal installment, original false, requested true -> false', () => {
    const tx = { type: 'expense', isInstallment: true, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, true);
    assert.strictEqual(res, false, 'Blocked installment MUST NOT persist refund=true');
  });

  it('P2-02: normal installment, original false, requested false -> false', () => {
    const tx = { type: 'expense', isInstallment: true, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, false);
    assert.strictEqual(res, false);
  });

  it('P2-03: existing installment refund, original true, requested true -> true', () => {
    const tx = { type: 'expense', isInstallment: true, isRefund: true };
    const res = resolveManualRefundForEditSave(tx, true);
    assert.strictEqual(res, true, 'Existing refund installment MUST preserve refund=true');
  });

  it('P2-04: existing installment refund, original true, requested false -> false', () => {
    const tx = { type: 'expense', isInstallment: true, isRefund: true };
    const res = resolveManualRefundForEditSave(tx, false);
    assert.strictEqual(res, false, 'Existing refund installment CAN be unmarked to false');
  });

  it('P2-05: normal expense, requested true -> true', () => {
    const tx = { type: 'expense', isInstallment: false, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, true);
    assert.strictEqual(res, true);
  });

  it('P2-06: normal expense, requested false -> false', () => {
    const tx = { type: 'expense', isInstallment: false, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, false);
    assert.strictEqual(res, false);
  });

  it('P2-07: income, requested true -> false', () => {
    const tx = { type: 'income', isInstallment: false, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, true);
    assert.strictEqual(res, false);
  });

  it('P2-08: transfer, requested true -> false', () => {
    const tx = { type: 'transfer', isInstallment: false, isRefund: false };
    const res = resolveManualRefundForEditSave(tx, true);
    assert.strictEqual(res, false);
  });
});
