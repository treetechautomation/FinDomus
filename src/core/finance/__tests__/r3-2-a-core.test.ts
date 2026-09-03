import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert';
import { calculateMonthlyBalance } from '../engine';
import { buildDRE, buildPFDRE } from '../dre-engine';
import * as dataModule from '@/lib/data';

describe('R3.2-A CORE FINANCIAL AGGREGATORS', () => {
  beforeEach(() => {
    while(dataModule.personalTransactions.length > 0) {
      dataModule.personalTransactions.pop();
    }
  });

  it('A01: income2000 + expense1000 + refund300 -> income2000, expenses700, balance1300', () => {
    dataModule.personalTransactions.push(
      { type: 'income', amount: 2000 } as any,
      { type: 'expense', amount: 1000 } as any,
      { type: 'expense', amount: 300, isRefund: true } as any
    );
    
    const result = calculateMonthlyBalance();
    
    assert.strictEqual(result.income, 2000);
    assert.strictEqual(result.expenses, 700);
    assert.strictEqual(result.balance, 1300);
  });

  it('A02: refund no aumenta income', () => {
    dataModule.personalTransactions.push(
      { type: 'expense', amount: 300, isRefund: true } as any
    );
    
    const result = calculateMonthlyBalance();
    
    assert.strictEqual(result.income, 0);
    assert.strictEqual(result.expenses, -300);
    assert.strictEqual(result.balance, 300);
  });

  it('A03: expense category: Uber500 + refund100 -> Uber400', () => {
    const transactions = [
      { type: 'expense', amount: 500, category: 'Aluguel' },
      { type: 'expense', amount: 100, category: 'Aluguel', isRefund: true }
    ];
    
    const dre = buildDRE(transactions);
    
    assert.strictEqual(dre.despesas, 400);
  });

  it('A04: PF DRE: expense1000 + refund300 -> expense700', () => {
    const transactions = [
      { type: 'expense', amount: 1000, category: 'Aluguel', owner: 'PF' },
      { type: 'expense', amount: 300, category: 'Aluguel', owner: 'PF', isRefund: true }
    ];
    
    const dre = buildPFDRE(transactions);
    
    assert.strictEqual(dre.essenciais, 700);
    assert.strictEqual(dre.despesasOperacionais, 700);
  });

  it('A05: PJ DRE: expense1000 + refund300 -> expense700', () => {
    const transactions = [
      { type: 'expense', amount: 1000, category: 'Software' },
      { type: 'expense', amount: 300, category: 'Software', isRefund: true }
    ];
    
    const dre = buildDRE(transactions);
    
    assert.strictEqual(dre.despesas, 700);
  });

  it('A06: transfer no altera DRE', () => {
    const transactions = [
      { type: 'transfer', amount: 1000 },
      { type: 'transfer', amount: 500, transferKind: 'regular' }
    ];
    
    const pfDre = buildPFDRE(transactions);
    const pjDre = buildDRE(transactions);
    
    assert.strictEqual(pfDre.despesasOperacionais, 0);
    assert.strictEqual(pfDre.receitaTotal, 0);
    assert.strictEqual(pjDre.despesas, 0);
    assert.strictEqual(pjDre.receitaBruta, 0);
  });

  it('A07: legacy transaction sem isRefund mantm resultado anterior', () => {
    dataModule.personalTransactions.push(
      { type: 'expense', amount: 500 } as any,
      { type: 'income', amount: 1000 } as any
    );
    
    const result = calculateMonthlyBalance();
    
    assert.strictEqual(result.income, 1000);
    assert.strictEqual(result.expenses, 500);
    assert.strictEqual(result.balance, 500);
  });

  it('A08: refund maior que purchase: 50 - 100 -> bucket -50 sem clamp silencioso', () => {
    const transactions = [
      { type: 'expense', amount: 50, category: 'Aluguel', owner: 'PF' },
      { type: 'expense', amount: 100, category: 'Aluguel', owner: 'PF', isRefund: true }
    ];
    
    const dre = buildPFDRE(transactions);
    
    assert.strictEqual(dre.essenciais, -50);
    assert.strictEqual(dre.despesasOperacionais, -50);
  });
});
