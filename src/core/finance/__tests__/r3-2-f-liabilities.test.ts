import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  shouldUpsertLiabilityFromTransaction,
  upsertLiabilityFromInstallmentTransaction
} from '../../../services/firestore/liabilities';

describe('R3.2-F LIABILITIES POLICY (EXCLUDE_REFUNDS + LEGACY CONTRACT)', () => {

  it('F01: installment expense normal: eligible=true', () => {
    const tx = {
      type: 'expense',
      amount: 300,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 3,
      installmentKey: 'smartphone-123'
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), true);
  });

  it('F02: mesma transaction com isRefund=false: eligible=true', () => {
    const tx = {
      type: 'expense',
      amount: 300,
      isRefund: false,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 3,
      installmentKey: 'smartphone-123'
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), true);
  });

  it('F03: installment expense com isRefund=true: eligible=false', () => {
    const tx = {
      type: 'expense',
      amount: 300,
      isRefund: true,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 3,
      installmentKey: 'smartphone-123'
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), false);
  });

  it('F04: refund com installmentKey válido: eligible=false', () => {
    const tx = {
      description: 'Estorno de Parcela Smartphone',
      amount: 150,
      isRefund: true,
      isInstallment: true,
      installmentKey: 'valid-installment-key-xyz',
      installmentCurrent: 2,
      installmentTotal: 5
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), false);
  });

  it('F05: refund com installmentNumber/installmentTotal sem installmentCurrent: eligible=false', () => {
    const tx = {
      amount: 200,
      isRefund: true,
      isInstallment: true,
      installmentNumber: 1,
      installmentTotal: 10
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), false);
  });

  it('F06: refund NÃO chega ao boundary de Firestore write (retorna null imediatamente)', async () => {
    const tx = {
      id: 'tx-refund-id',
      type: 'expense',
      amount: 300,
      isRefund: true,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 3,
      installmentKey: 'key-123'
    };
    const res = await upsertLiabilityFromInstallmentTransaction('mock-user-123', tx);
    assert.strictEqual(res, null);
  });

  it('F07: legacy equivalence - amount negativo usa Math.abs e prossegue (L07)', () => {
    const tx = {
      amount: -100,
      isInstallment: true,
      installmentCurrent: 2,
      installmentTotal: 10
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(tx), true);
  });

  it('F08: legacy equivalence - non-installment ou installmentCurrent ausente/zero (L01, L02, L04)', () => {
    // L01: isInstallment=false
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ isInstallment: false, amount: 100, installmentCurrent: 1, installmentTotal: 2 }), false);
    // L02: installmentCurrent ausente
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ isInstallment: true, amount: 100, installmentTotal: 2 }), false);
    // L04: installmentCurrent=0
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ isInstallment: true, amount: 100, installmentCurrent: 0, installmentTotal: 2 }), false);
  });

  it('F09: legacy equivalence - zero amount ou installmentTotal=0 (L05, L06)', () => {
    // L05: installmentTotal=0
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ isInstallment: true, amount: 100, installmentCurrent: 1, installmentTotal: 0 }), false);
    // L06: amount=0
    assert.strictEqual(shouldUpsertLiabilityFromTransaction({ isInstallment: true, amount: 0, installmentCurrent: 1, installmentTotal: 2 }), false);
  });

  it('F10: legacy equivalence - normal transaction apenas com installmentNumber sem installmentCurrent (L08)', () => {
    // L08: SOMENTE installmentNumber=1 sem installmentCurrent -> baseline null -> helper false
    const txOnlyInstallmentNumber = {
      amount: 100,
      isInstallment: true,
      installmentNumber: 1,
      installmentTotal: 3
    };
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(txOnlyInstallmentNumber), false);

    // E comprova que normal transaction com installmentCurrent passa sem exigir campos refundOf
    const normalTx = {
      amount: 100,
      isInstallment: true,
      installmentCurrent: 1,
      installmentTotal: 3
    };
    assert.strictEqual((normalTx as any).refundOf, undefined);
    assert.strictEqual((normalTx as any).refundOfLiabilityId, undefined);
    assert.strictEqual(shouldUpsertLiabilityFromTransaction(normalTx), true);
  });

});
