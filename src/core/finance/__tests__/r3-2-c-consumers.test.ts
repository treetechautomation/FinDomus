import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateReportsMetrics } from '../../../lib/reports-snapshot-builder';
import { calculateMonthlySummaryMetrics } from '../../../services/firestore';
import { calculateAdminMetrics } from '../../../services/firestore/dashboard.admin';

describe('R3.2-C REPORT CONSUMERS SEMANTICS (REAL CONSUMERS PURE HELPERS)', () => {

  const baseTransactions = [
    { type: 'income' as const, amount: 2000, category: 'Salário' },
    { type: 'expense' as const, amount: 1000, category: 'Uber' },
    { type: 'expense' as const, amount: 300, isRefund: true, category: 'Uber' }
  ];

  it('C01: reports snapshot REAL HELPER - income2000 + expense1000 + refund300 -> expenses700', () => {
    const { income, expenses, balance } = calculateReportsMetrics(baseTransactions);
    assert.strictEqual(income, 2000);
    assert.strictEqual(expenses, 700);
    assert.strictEqual(balance, 1300);
  });

  it('C02: reports category REAL HELPER - Uber100 + refund30 -> Uber70', () => {
    const transactions = [
      { type: 'expense' as const, amount: 100, category: 'Uber' },
      { type: 'expense' as const, amount: 30, isRefund: true, category: 'Uber' }
    ];
    const { byCategory } = calculateReportsMetrics(transactions);
    assert.strictEqual(byCategory['Uber'], 70);
  });

  it('C03: reports REAL HELPER - refund não entra como income', () => {
    const transactions = [
      { type: 'income' as const, amount: 500, category: 'Pix' },
      { type: 'expense' as const, amount: 100, isRefund: true, category: 'Refund' }
    ];
    const { income } = calculateReportsMetrics(transactions);
    assert.strictEqual(income, 500);
  });

  it('C04: firestore financial summary REAL HELPER - expenses700 balance1300', () => {
    const { income, expenses, balance } = calculateMonthlySummaryMetrics(baseTransactions);
    assert.strictEqual(income, 2000);
    assert.strictEqual(expenses, 700);
    assert.strictEqual(balance, 1300);
  });

  it('C05: Firestore category aggregation REAL HELPER - purchase500 + refund100 -> 400', () => {
    const transactions = [
      { type: 'expense' as const, amount: 500, category: 'Mercado' },
      { type: 'expense' as const, amount: 100, isRefund: true, category: 'Mercado' }
    ];
    const { categories } = calculateMonthlySummaryMetrics(transactions);
    assert.strictEqual(categories['Mercado'], 400);
  });

  it('C06: admin dashboard raw transaction aggregation REAL HELPER - expense1000 + refund300 -> 700', () => {
    const { income, expenses } = calculateAdminMetrics(baseTransactions);
    assert.strictEqual(income, 2000);
    assert.strictEqual(expenses, 700);
  });

  it('C07: legacy sem isRefund REAL HELPER permanece igual (reports)', () => {
    const transactions = [
      { type: 'income' as const, amount: 2000 },
      { type: 'expense' as const, amount: 1000 }
    ];
    const { income, expenses } = calculateReportsMetrics(transactions);
    assert.strictEqual(income, 2000);
    assert.strictEqual(expenses, 1000);
  });

  it('C08: transfer permanece neutra REAL HELPER (firestore)', () => {
    const transactions = [
      { type: 'income' as const, amount: 1000 },
      { type: 'transfer' as const, amount: 500 },
      { type: 'expense' as const, amount: 200 }
    ];
    const { income, expenses } = calculateMonthlySummaryMetrics(transactions);
    assert.strictEqual(income, 1000);
    assert.strictEqual(expenses, 200);
  });

  it('C09: negative category bucket purchase50 + refund100 -> -50 REAL HELPER (firestore)', () => {
    const transactions = [
      { type: 'expense' as const, amount: 50, category: 'Uber' },
      { type: 'expense' as const, amount: 100, isRefund: true, category: 'Uber' }
    ];
    const { categories } = calculateMonthlySummaryMetrics(transactions);
    assert.strictEqual(categories['Uber'], -50);
  });

});

