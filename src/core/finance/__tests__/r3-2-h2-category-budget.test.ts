import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getExpenseEffect, getIncomeEffect } from '../transaction-effects';

// Helper simulating the exact production calculation in pessoal-client.tsx
function computeCategoryPresentation(expenseTransactions: any[]) {
  const categoryNetMap = expenseTransactions.reduce((acc: Record<string, number>, t: any) => {
    const cat = t.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + getExpenseEffect(t);
    return acc;
  }, {});

  let refundSurplus = 0;
  const categoryChartData: { name: string; value: number }[] = [];

  for (const [cat, net] of Object.entries(categoryNetMap)) {
    if (net < 0) {
      refundSurplus += Math.abs(net);
    } else if (net > 0) {
      categoryChartData.push({ name: cat, value: net });
    }
  }

  return { categoryNetMap, categoryChartData, refundSurplus };
}

// Helper simulating the exact smartBudget calculation in pessoal-client.tsx
function computeSmartBudget(
  baseBudget: { category: string }[],
  filteredTransactions: any[],
  plannedAmount: number
) {
  return baseBudget.map((budget) => {
    const spent = filteredTransactions
      .filter((t: any) => t.type === 'expense' && t.category === budget.category)
      .reduce((sum: number, t: any) => sum + getExpenseEffect(t), 0);

    const planned = plannedAmount;
    const percent = planned > 0 ? (spent / planned) * 100 : 0;
    const visualPercent = Math.min(Math.max(percent, 0), 100);
    const remaining = planned - spent;

    let status = 'OK';
    if (percent >= 100) status = 'Estourou';
    else if (percent >= 80) status = 'Atenção';

    return {
      category: budget.category,
      spent,
      planned,
      remaining,
      percent,
      visualPercent,
      status,
    };
  });
}

describe('R3.2-H2 CATEGORY PRESENTATION CONTRACT', () => {
  it('H2-C01: Mercado expense 300 + refund 100 -> net=200, pie=200, surplus=0', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 300, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const { categoryNetMap, categoryChartData, refundSurplus } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], 200);
    assert.deepStrictEqual(categoryChartData, [{ name: 'Mercado', value: 200 }]);
    assert.strictEqual(refundSurplus, 0);
  });

  it('H2-C02: Mercado expense 50 + refund 100 -> net=-50, pie=0 (not in chart), surplus=50', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const { categoryNetMap, categoryChartData, refundSurplus } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], -50);
    assert.strictEqual(categoryChartData.length, 0);
    assert.strictEqual(refundSurplus, 50);
  });

  it('H2-C03: Mercado net=-50, Lazer net=180 -> Pie only positive values, surplus=50', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
      { type: 'expense', category: 'Lazer', amount: 200, isRefund: false },
      { type: 'expense', category: 'Lazer', amount: 20, isRefund: true },
    ];
    const { categoryNetMap, categoryChartData, refundSurplus } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], -50);
    assert.strictEqual(categoryNetMap['Lazer'], 180);
    assert.deepStrictEqual(categoryChartData, [{ name: 'Lazer', value: 180 }]);
    assert.strictEqual(refundSurplus, 50);
  });

  it('H2-C04: refund categoria A não reduz categoria B', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 300, isRefund: false },
      { type: 'expense', category: 'Transporte', amount: 100, isRefund: true },
    ];
    const { categoryNetMap, categoryChartData, refundSurplus } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], 300);
    assert.strictEqual(categoryNetMap['Transporte'], -100);
    assert.deepStrictEqual(categoryChartData, [{ name: 'Mercado', value: 300 }]);
    assert.strictEqual(refundSurplus, 100);
  });

  it('H2-C05: income não entra em expense category', () => {
    const txs = [
      { type: 'income', category: 'Mercado', amount: 500 },
      { type: 'expense', category: 'Mercado', amount: 200, isRefund: false },
    ];
    const { categoryNetMap } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], 200);
  });

  it('H2-C06: transfer não entra', () => {
    const txs = [
      { type: 'transfer', category: 'Mercado', amount: 500 },
      { type: 'expense', category: 'Mercado', amount: 200, isRefund: false },
    ];
    const { categoryNetMap } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryNetMap['Mercado'], 200);
  });

  it('H2-C07: all category net values <= 0 -> Pie has no negative slice, surplus preserved', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
      { type: 'expense', category: 'Farmacia', amount: 30, isRefund: true },
    ];
    const { categoryChartData, refundSurplus } = computeCategoryPresentation(txs);
    assert.strictEqual(categoryChartData.length, 0);
    assert.strictEqual(refundSurplus, 80);
  });
});

describe('R3.2-H2 SMART BUDGET CONTRACT', () => {
  const baseBudget = [{ category: 'Mercado' }, { category: 'Lazer' }];

  it('H2-B01: planned=1000, expense=600, refund=100 -> spent=500', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 600, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.spent, 500);
  });

  it('H2-B02: remaining=500 (planned - spent)', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 600, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.remaining, 500);
  });

  it('H2-B03: rawPercent=50', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 600, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.percent, 50);
  });

  it('H2-B04: visualPercent=50', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 600, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.visualPercent, 50);
  });

  it('H2-B05: expense=50, refund=100 -> spent=-50', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.spent, -50);
  });

  it('H2-B06: rawPercent=-5', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.percent, -5);
  });

  it('H2-B07: visualPercent=0', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.visualPercent, 0);
  });

  it('H2-B08: refund de outra categoria não reduz budget atual', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 600, isRefund: false },
      { type: 'expense', category: 'Lazer', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    const lazer = result.find(b => b.category === 'Lazer')!;
    assert.strictEqual(mercado.spent, 600);
    assert.strictEqual(lazer.spent, -100);
  });

  it('H2-B09: refund continua expense', () => {
    const refundTx = { type: 'expense' as const, category: 'Mercado', amount: 100, isRefund: true };
    assert.strictEqual(refundTx.type, 'expense');
    assert.strictEqual(refundTx.isRefund, true);
  });

  it('H2-B10: refund não vira income', () => {
    const refundTx = { type: 'expense' as const, category: 'Mercado', amount: 100, isRefund: true };
    assert.strictEqual(getIncomeEffect(refundTx), 0);
  });

  it('H2-B11: status thresholds existentes preservados', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.strictEqual(mercado.status, 'OK');
  });

  it('H2-B12: spent não é clampado para zero', () => {
    const txs = [
      { type: 'expense', category: 'Mercado', amount: 50, isRefund: false },
      { type: 'expense', category: 'Mercado', amount: 100, isRefund: true },
    ];
    const result = computeSmartBudget(baseBudget, txs, 1000);
    const mercado = result.find(b => b.category === 'Mercado')!;
    assert.ok(mercado.spent < 0);
    assert.strictEqual(mercado.spent, -50);
  });
});
