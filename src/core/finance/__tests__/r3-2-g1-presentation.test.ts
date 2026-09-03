import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTransactionDisplaySemantics } from '../../../utils/transaction-display';

describe('R3.2-G1 REFUND PRESENTATION LAYER', () => {
  it('G1-01: income 100 -> sign +, positive, label Receita', () => {
    const tx = { type: 'income', amount: 100 };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.sign, '+');
    assert.strictEqual(display.isPositiveEffect, true);
    assert.strictEqual(display.label, 'Receita');
  });

  it('G1-02: expense 100 -> sign -, negative, label Despesa', () => {
    const tx = { type: 'expense', amount: 100 };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.sign, '-');
    assert.strictEqual(display.isPositiveEffect, false);
    assert.strictEqual(display.label, 'Despesa');
  });

  it('G1-03: refund: type expense, amount 100, isRefund true -> sign +, positive, label Estorno', () => {
    const tx = { type: 'expense', amount: 100, isRefund: true };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, true);
    assert.strictEqual(display.sign, '+');
    assert.strictEqual(display.isPositiveEffect, true);
    assert.strictEqual(display.label, 'Estorno');
  });

  it('G1-04: refund continua: type expense, presentation nao altera domain object', () => {
    const tx = { type: 'expense', amount: 150, isRefund: true, description: 'Estorno Compra' };
    const originalSnapshot = JSON.stringify(tx);

    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(tx.type, 'expense');
    assert.strictEqual(tx.amount, 150);
    assert.strictEqual(tx.isRefund, true);
    assert.strictEqual(JSON.stringify(tx), originalSnapshot);
    assert.strictEqual(display.isRefund, true);
  });

  it('G1-05: legacy expense sem isRefund -> exatamente expense normal', () => {
    const tx = { type: 'expense', amount: 250 };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.sign, '-');
    assert.strictEqual(display.isPositiveEffect, false);
    assert.strictEqual(display.label, 'Despesa');
  });

  it('G1-06: legacy income sem isRefund -> exatamente income normal', () => {
    const tx = { type: 'income', amount: 500 };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.sign, '+');
    assert.strictEqual(display.isPositiveEffect, true);
    assert.strictEqual(display.label, 'Receita');
  });

  it('G1-07: type income + isRefund true -> NAO receber semantica visual de refund (defensive invariant)', () => {
    const tx = { type: 'income', amount: 300, isRefund: true };
    const display = getTransactionDisplaySemantics(tx);

    // Deve respeitar a invariante: refund requer type === 'expense'
    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.label, 'Receita');
    assert.strictEqual(display.sign, '+');
    assert.strictEqual(display.isPositiveEffect, true);
  });

  it('G1-08: amount permanece absoluto/inalterado pela presentation', () => {
    const tx = { type: 'expense', amount: 100, isRefund: true };
    getTransactionDisplaySemantics(tx);

    assert.strictEqual(tx.amount, 100);
    assert.strictEqual(Math.abs(tx.amount), 100);
  });

  it('G1-09: presentation helper nao retorna income para refund (retains label Estorno)', () => {
    const tx = { type: 'expense', amount: 100, isRefund: true };
    const display = getTransactionDisplaySemantics(tx);

    assert.notStrictEqual(display.label, 'Receita');
    assert.strictEqual(display.label, 'Estorno');
    assert.strictEqual(tx.type, 'expense');
  });

  it('G1-10: transfer mantem apresentacao legacy', () => {
    const tx = { type: 'transfer', amount: 400 };
    const display = getTransactionDisplaySemantics(tx);

    assert.strictEqual(display.isRefund, false);
    assert.strictEqual(display.sign, '');
    assert.strictEqual(display.isPositiveEffect, false);
    assert.strictEqual(display.label, 'Transferência');
  });
});
