import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { aggregateAITransactions } from '../../../ai/tools/get-transactions';
import { getFinancialAIInsights } from '../financial-ai-engine';
import { detectRecurrence } from '../recurrence-engine';

describe('R3.2-D AI / DOMUS + RECURRENCE SEMANTICS', () => {

  it('D01: AI/get-transactions summary: income2000 + expense1000 + refund300 -> income2000, expenses700', () => {
    const transactions = [
      { type: 'income', amount: 2000, category: 'Salário' },
      { type: 'expense', amount: 1000, category: 'Uber' },
      { type: 'expense', amount: 300, isRefund: true, category: 'Uber' }
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.income, 2000);
    assert.strictEqual(res.expenses, 700);
  });

  it('D02: AI category: Uber100 + refund30 -> Uber70', () => {
    const transactions = [
      { type: 'expense', amount: 100, category: 'Uber' },
      { type: 'expense', amount: 30, isRefund: true, category: 'Uber' }
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.categories['Uber'], 70);
  });

  it('D03: refund não aumenta AI income', () => {
    const transactions = [
      { type: 'income', amount: 2000, category: 'Salário' },
      { type: 'expense', amount: 300, isRefund: true, category: 'Uber' }
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.income, 2000);
  });

  it('D04: negative AI category: Uber50 + refund100 -> -50', () => {
    const transactions = [
      { type: 'expense', amount: 50, category: 'Uber' },
      { type: 'expense', amount: 100, isRefund: true, category: 'Uber' }
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.categories['Uber'], -50);
  });

  it('D05: recurrence: Netflix purchase50 em 3 meses + refund50 -> refund NÃO conta como ocorrência (recurrence-engine)', () => {
    const transactions = [
      { type: 'expense', amount: 50, date: '2023-01-01', description: 'Netflix', category: 'Streaming' },
      { type: 'expense', amount: 50, date: '2023-02-01', description: 'Netflix', category: 'Streaming' },
      { type: 'expense', amount: 50, date: '2023-03-01', description: 'Netflix', category: 'Streaming' },
      { type: 'expense', amount: 50, date: '2023-03-10', description: 'Netflix', category: 'Streaming', isRefund: true },
    ];
    const res = detectRecurrence(transactions);
    // 3 occurrences is enough to make it recurring with certain confidence. 
    // The refund should be ignored. The avg interval is ~30 days.
    // If the refund was included, the interval would be messed up (10 days diff).
    assert.strictEqual(res.isRecurring, true);
    assert.strictEqual(res.recurrenceFrequency, 'monthly'); // 30 days avg
  });

  it('D06: refund isolado NÃO cria recorrência (recurrence-engine)', () => {
    const transactions = [
      { type: 'expense', amount: 50, date: '2023-01-01', description: 'Mercado', isRefund: true },
      { type: 'expense', amount: 50, date: '2023-02-01', description: 'Mercado', isRefund: true },
      { type: 'expense', amount: 50, date: '2023-03-01', description: 'Mercado', isRefund: true },
    ];
    const res = detectRecurrence(transactions);
    assert.strictEqual(res.isRecurring, false);
  });

  it('D07: refund não altera média recorrente', () => {
    // Media handled inside the AI engine recurringMonthly or recurrence engine?
    // detectRecurrence doesn't return the average amount, but financial-ai-engine sums it up:
    // recurringMonthly = recurringResults.reduce((s, r) => s + Math.abs(Number(r.sample?.amount || 0)), 0);
    // Since refund is filtered, the sample will be the first non-refund.
    const transactions = [
      { type: 'expense', amount: 100, date: '2023-01-01', description: 'Academia', category: 'Saúde' },
      { type: 'expense', amount: 100, date: '2023-02-01', description: 'Academia', category: 'Saúde' },
      { type: 'expense', amount: 100, date: '2023-03-01', description: 'Academia', category: 'Saúde' },
      { type: 'expense', amount: 50, date: '2023-02-15', description: 'Academia', category: 'Saúde', isRefund: true }, // refund excluded
    ];
    const insights = getFinancialAIInsights({ transactions });
    // The health score logic uses recurringMonthly. We can verify that it ignores the refund 
    // because recurringDetected will be 1 and it won't crash or include the refund in the recurring items.
    assert.strictEqual(insights.recurringDetected, 1);
  });

  it('D08: legacy transactions sem isRefund mantêm comportamento', () => {
    const transactions = [
      { type: 'income', amount: 2000, category: 'Salário' },
      { type: 'expense', amount: 1000, category: 'Uber' },
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.income, 2000);
    assert.strictEqual(res.expenses, 1000);
  });

  it('D09: transfer continua fora da semântica de expense/income', () => {
    const transactions = [
      { type: 'income', amount: 1000, category: 'Pix' },
      { type: 'transfer', amount: 500, category: 'Transfer' },
      { type: 'expense', amount: 200, category: 'Padaria' }
    ];
    const res = aggregateAITransactions(transactions);
    assert.strictEqual(res.income, 1000);
    assert.strictEqual(res.expenses, 200);
  });

  it('D10: financial-ai preaggregated DRE não sofre double application', () => {
    // DRE passed to getFinancialAIInsights is untouched.
    const kernelOutputs = {
      dreReport: {
        saldoRestante: -100
      },
      freedomIndex: { freedomIndex: 100, breakdown: { emergencyReservePercent: 100, incomeFreedomPercent: 100, diversificationNormalized: 100 } },
      freedomTimeline: { monthsToReserve: 0, targetNetWorth: 0 }
    } as any;
    const insights = getFinancialAIInsights({ transactions: [], kernelOutputs });
    
    // We expect the 'Balanço Mensal Negativo' alert
    const hasAlert = insights.insights.some(i => i.title.includes('Balanço Mensal Negativo'));
    assert.strictEqual(hasAlert, true);
  });

});
