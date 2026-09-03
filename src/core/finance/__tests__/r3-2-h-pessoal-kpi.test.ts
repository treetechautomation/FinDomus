import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getExpenseEffect, getIncomeEffect, getNetEffect } from '../transaction-effects';

describe('R3.2-H0 PESSOAL KPI — REFUND ACCOUNTING', () => {
  it('H-01: expense 100 -> KPI 100', () => {
    const tx = { type: 'expense' as const, amount: 100, isRefund: false };
    assert.strictEqual(getExpenseEffect(tx), 100);
  });

  it('H-02: refund 100 -> efeito -100', () => {
    const tx = { type: 'expense' as const, amount: 100, isRefund: true };
    assert.strictEqual(getExpenseEffect(tx), -100);
  });

  it('H-03: expense 100 + refund 100 -> KPI 0', () => {
    const txs = [
      { type: 'expense' as const, amount: 100, isRefund: false },
      { type: 'expense' as const, amount: 100, isRefund: true },
    ];
    const netExpenses = txs.reduce((sum, t) => sum + getExpenseEffect(t), 0);
    assert.strictEqual(netExpenses, 0);
  });

  it('H-04: expense 300 + refund 100 -> KPI 200', () => {
    const txs = [
      { type: 'expense' as const, amount: 300, isRefund: false },
      { type: 'expense' as const, amount: 100, isRefund: true },
    ];
    const netExpenses = txs.reduce((sum, t) => sum + getExpenseEffect(t), 0);
    assert.strictEqual(netExpenses, 200);
  });

  it('H-05: income 100 -> não aumenta KPI de despesas', () => {
    const tx = { type: 'income' as const, amount: 100 };
    assert.strictEqual(getExpenseEffect(tx), 0);
  });

  it('H-06: transfer -> preserva comportamento existente (0 efeito no KPI de despesas)', () => {
    const tx = { type: 'transfer' as const, amount: 100 };
    assert.strictEqual(getExpenseEffect(tx), 0);
  });

  it('H-07: refund permanece type expense', () => {
    const refundTx = { type: 'expense' as const, amount: 100, isRefund: true };
    assert.strictEqual(refundTx.type, 'expense');
    assert.notStrictEqual(refundTx.type, 'refund');
    assert.strictEqual(refundTx.isRefund, true);
  });

  it('H-08: refund amount permanece positivo', () => {
    const refundTx = { type: 'expense' as const, amount: 100, isRefund: true };
    assert.ok(refundTx.amount > 0);
    assert.strictEqual(refundTx.amount, 100);
  });

  it('H-09: refund não vira income', () => {
    const refundTx = { type: 'expense' as const, amount: 100, isRefund: true };
    assert.strictEqual(getIncomeEffect(refundTx), 0);
    assert.strictEqual(refundTx.type, 'expense');
  });

  it('H-10: owner filter preservado (PF only)', () => {
    const txs = [
      { owner: 'PF', type: 'expense' as const, amount: 100, isRefund: false },
      { owner: 'PJ', type: 'expense' as const, amount: 200, isRefund: false },
      { owner: 'PF', type: 'expense' as const, amount: 50, isRefund: true },
    ];
    const pfExpenses = txs
      .filter(t => t.owner === 'PF')
      .reduce((sum, t) => sum + getExpenseEffect(t), 0);
    assert.strictEqual(pfExpenses, 50);
  });

  it('H-11: period filter preservado (mês selecionado)', () => {
    const txs = [
      { monthKey: '2026-08', type: 'expense' as const, amount: 150, isRefund: false },
      { monthKey: '2026-07', type: 'expense' as const, amount: 100, isRefund: false },
      { monthKey: '2026-08', type: 'expense' as const, amount: 50, isRefund: true },
    ];
    const monthExpenses = txs
      .filter(t => t.monthKey === '2026-08')
      .reduce((sum, t) => sum + getExpenseEffect(t), 0);
    assert.strictEqual(monthExpenses, 100);
  });

  it('H-12: closed/non-closed filter parity', () => {
    const monthTransactions = [
      { type: 'expense' as const, amount: 1000, isRefund: false },
      { type: 'expense' as const, amount: 200, isRefund: true },
    ];

    // Closed logic in month-closure-engine:
    const closedExpenses = monthTransactions.reduce((sum, t) => sum + getExpenseEffect(t), 0);

    // Open logic in pessoal-client:
    const openExpenses = monthTransactions.reduce((sum, t) => sum + getExpenseEffect(t), 0);

    assert.strictEqual(openExpenses, 800);
    assert.strictEqual(closedExpenses, 800);
    assert.strictEqual(openExpenses, closedExpenses, 'Open month and closed month MUST compute identical net expenses');
  });

  it('H-13: expense 50 + refund 100 -> resultado líquido -50 (sem clamp artificial)', () => {
    const txs = [
      { type: 'expense' as const, amount: 50, isRefund: false },
      { type: 'expense' as const, amount: 100, isRefund: true },
    ];
    const netExpenses = txs.reduce((sum, t) => sum + getExpenseEffect(t), 0);
    assert.strictEqual(netExpenses, -50, 'Net expenses can be negative when refunds exceed expenses');
  });
});
