import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildForecast } from '../forecast-engine';

describe('R3.2-E FORECAST SEMANTICS', () => {
  const baseMonth = '2026-04';

  it('E01: historical expense: expense1000 + refund300 -> 700', () => {
    const transactions = [
      { type: 'expense', amount: 1000, monthKey: baseMonth },
      { type: 'expense', amount: 300, isRefund: true, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].expenses, 700);
  });

  it('E02: refund não aumenta income', () => {
    const transactions = [
      { type: 'income', amount: 2000, monthKey: baseMonth },
      { type: 'expense', amount: 300, isRefund: true, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].income, 2000);
  });

  it('E03: negative expense: purchase50 + refund100 -> -50', () => {
    const transactions = [
      { type: 'expense', amount: 50, monthKey: baseMonth },
      { type: 'expense', amount: 100, isRefund: true, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].expenses, -50);
  });

  it('E04: média histórica com net expense: month1 700, month2 800, month3 750 -> 750', () => {
    // Historical months: 2026-01, 2026-02, 2026-03. Future month: 2026-05
    const transactions = [
      // 2026-01: 1000 purchase - 300 refund = 700
      { type: 'expense', amount: 1000, monthKey: '2026-01' },
      { type: 'expense', amount: 300, isRefund: true, monthKey: '2026-01' },
      // 2026-02: 900 purchase - 100 refund = 800
      { type: 'expense', amount: 900, monthKey: '2026-02' },
      { type: 'expense', amount: 100, isRefund: true, monthKey: '2026-02' },
      // 2026-03: 750 purchase = 750
      { type: 'expense', amount: 750, monthKey: '2026-03' },
    ];
    // Request 2 months: 2026-04 (baseMonth) and 2026-05 (future)
    const res = buildForecast({ transactions, baseMonth, months: 2 });
    const futureForecast = res[1]; // 2026-05
    assert.strictEqual(futureForecast.monthKey, '2026-05');
    assert.strictEqual(futureForecast.expenses, 750);
  });

  it('E05: legacy transaction sem isRefund mantém resultado anterior', () => {
    const transactions = [
      { type: 'expense', amount: 1000, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].expenses, 1000);
  });

  it('E06: transfer neutralidade preservada', () => {
    const transactions = [
      { type: 'transfer', amount: 500, monthKey: baseMonth },
      { type: 'income', amount: 1000, monthKey: baseMonth },
      { type: 'expense', amount: 400, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].income, 1000);
    assert.strictEqual(res[0].expenses, 400);
  });

  it('E07: category net - NOT APPLICABLE (forecast does not group categories)', () => {
    const transactions = [
      { type: 'expense', amount: 100, category: 'Uber', monthKey: baseMonth },
      { type: 'expense', amount: 30, isRefund: true, category: 'Uber', monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual((res[0] as any).categories, undefined);
  });

  it('E08: negative category - NOT APPLICABLE (forecast does not group categories)', () => {
    const transactions = [
      { type: 'expense', amount: 50, category: 'Uber', monthKey: baseMonth },
      { type: 'expense', amount: 100, isRefund: true, category: 'Uber', monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual((res[0] as any).categories, undefined);
  });

  it('E09: preaggregated input - NOT APPLICABLE (forecast operates on raw transactions)', () => {
    // Confirms buildForecast takes transactions array and does not take or modify preaggregated DRE
    const res = buildForecast({ transactions: [], baseMonth, months: 1 });
    assert.strictEqual(res[0].expenses, 0);
    assert.strictEqual(res[0].income, 0);
  });

  it('E10: refund isolado afeta Forecast como negative expense, não como income', () => {
    const transactions = [
      { type: 'expense', amount: 300, isRefund: true, monthKey: baseMonth },
    ];
    const res = buildForecast({ transactions, baseMonth, months: 1 });
    assert.strictEqual(res[0].income, 0);
    assert.strictEqual(res[0].expenses, -300);
    assert.strictEqual(res[0].projectedBalance, 300); // income (0) - projectedOutflow (-300) = 300
  });
});
