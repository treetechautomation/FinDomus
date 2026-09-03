import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { postProcessAIFallback, type ParsedTransaction } from '../transaction-classifier';
import { getExpenseEffect, getIncomeEffect, getNetEffect } from '../transaction-effects';
import { generateImportHash } from '../../../services/firestore/transactions';

// Legacy Hash Algorithm for T09 Proof
function normalizeHashTextLegacy(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
function legacyGenerateImportHash(data: any) {
  const base = data.externalId
    ? [
        data.owner || 'PF',
        'external',
        normalizeHashTextLegacy(data.externalId),
        data.date || '' ,
        Number(data.amount || 0).toFixed(2),
        normalizeHashTextLegacy(data.description),
        normalizeHashTextLegacy(data.merchant || ''),
      ].join('|')
    : [
        data.owner || 'PF',
        data.date || '' ,
        Number(data.amount || 0).toFixed(2),
        normalizeHashTextLegacy(data.description),
        normalizeHashTextLegacy(data.merchant || ''),
      ].join('|');

  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return `imp_${Math.abs(hash)}`;
}

const createTx = (description: string, amount: number): ParsedTransaction => ({
  date: '2023-01-01',
  description,
  amount,
  category: '',
  merchant: '',
  type: amount >= 0 ? 'income' : 'expense'
});

describe('R3.0 Refund Semantics', () => {
  it('T01 normal expense 1000 -> expenseEffect 1000', () => {
    assert.strictEqual(getExpenseEffect({ type: 'expense', amount: 1000 }), 1000);
  });
  
  it('T02 refund expense 300 -> expenseEffect -300', () => {
    assert.strictEqual(getExpenseEffect({ type: 'expense', amount: 300, isRefund: true }), -300);
  });
  
  it('T03 expense1000 + refund300 -> net expense 700', () => {
    const e1 = getExpenseEffect({ type: 'expense', amount: 1000 });
    const e2 = getExpenseEffect({ type: 'expense', amount: 300, isRefund: true });
    assert.strictEqual(e1 + e2, 700);
  });
  
  it('T04 refund300 -> incomeEffect 0', () => {
    assert.strictEqual(getIncomeEffect({ type: 'expense', amount: 300, isRefund: true }), 0);
  });
  
  it('T05 income300 -> incomeEffect 300', () => {
    assert.strictEqual(getIncomeEffect({ type: 'income', amount: 300 }), 300);
  });
  
  it('T06 transfer300 -> income0 expense0', () => {
    assert.strictEqual(getIncomeEffect({ type: 'transfer', amount: 300 }), 0);
    assert.strictEqual(getExpenseEffect({ type: 'transfer', amount: 300 }), 0);
  });
  
  it('T07 legacy sem isRefund mantém comportamento', () => {
    assert.strictEqual(getExpenseEffect({ type: 'expense', amount: 1000 }), 1000);
  });
  
  it('T08 compra50/refund50 mesma identidade -> hashes diferentes', () => {
    const normalHash = generateImportHash({ amount: 50, description: 'Test', date: '2023-01-01', externalId: '123' });
    const refundHash = generateImportHash({ amount: 50, description: 'Test', date: '2023-01-01', externalId: '123', isRefund: true });
    assert.notStrictEqual(normalHash, refundHash);
  });
  
  it('T09 hash normal permanece EXATAMENTE igual ao algoritmo P6 legado', () => {
    const data = { amount: 50, description: 'Test', date: '2023-01-01', externalId: '123', owner: 'PF' as const };
    const currentHash = generateImportHash(data);
    const legacyHash = legacyGenerateImportHash(data);
    assert.strictEqual(currentHash, legacyHash);
  });
  
  it('T10 OFX-like negative expense NÃO é automaticamente refund', () => {
    const result = postProcessAIFallback([createTx('Compra comum', -50)], false);
    assert.strictEqual(result[0].isRefund, undefined);
  });
  
  it('T11 Estorno de Uber + card context -> refund', () => {
    const result = postProcessAIFallback([createTx('Estorno de Uber', -10)], true);
    assert.strictEqual(result[0].isRefund, true);
    assert.strictEqual(result[0].type, 'expense');
  });
  
  it('T12 IOF de volta + card context -> refund', () => {
    const result = postProcessAIFallback([createTx('iof de volta', -10)], true);
    assert.strictEqual(result[0].isRefund, true);
  });
  
  it('T13 Crédito de Confiança + card context -> refund', () => {
    const result = postProcessAIFallback([createTx('Crédito de Confiança', -100)], true);
    assert.strictEqual(result[0].isRefund, true);
  });
  
  it('T14 Depósito de Confiança de IOF + card context -> refund', () => {
    const result = postProcessAIFallback([createTx('depósito de CONFIANÇA', -100)], true);
    assert.strictEqual(result[0].isRefund, true);
  });
  
  it('T15 Pagamento recebido + card context -> ignored e não refund', () => {
    const result = postProcessAIFallback([createTx('Pagamento Recebido', 1000)], true);
    assert.strictEqual(result[0].ignored, true);
    assert.notStrictEqual(result[0].isRefund, true);
  });
  
  it('T16 Pagamento em + card context -> ignored e não refund', () => {
    const result = postProcessAIFallback([createTx('Pagamento em 01 JUL', 1000)], true);
    assert.strictEqual(result[0].ignored, true);
    assert.notStrictEqual(result[0].isRefund, true);
  });
  
  it('T17 Crédito salário fora card -> não refund', () => {
    const result = postProcessAIFallback([createTx('Crédito salário', 500)], false);
    assert.notStrictEqual(result[0].isRefund, true);
    assert.notStrictEqual(result[0].ignored, true);
  });
  
  it('T18 Depósito recebido fora card -> não refund', () => {
    const result = postProcessAIFallback([createTx('Depósito recebido', 500)], false);
    assert.notStrictEqual(result[0].isRefund, true);
    assert.notStrictEqual(result[0].ignored, true);
  });
  
  it('T19 AI fallback Estorno Uber + card context -> expense/isRefund', () => {
    const result = postProcessAIFallback([createTx('Estorno de Uber - NuPay', -8.99)], true);
    assert.strictEqual(result[0].type, 'expense');
    assert.strictEqual(result[0].amount, 8.99);
    assert.strictEqual(result[0].isRefund, true);
    assert.notStrictEqual(result[0].ignored, true);
  });
  
  it('T20 AI fallback Pagamento recebido + card context -> ignored/não refund', () => {
    const result = postProcessAIFallback([createTx('Pagamento recebido', 6749.58)], true);
    assert.strictEqual(result[0].ignored, true);
    assert.notStrictEqual(result[0].isRefund, true);
  });
});
