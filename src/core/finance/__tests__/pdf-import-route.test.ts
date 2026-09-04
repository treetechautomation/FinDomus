import { describe, it, after } from 'node:test';
import assert from 'node:assert';

import { processPdfText } from '@/app/api/import/pdf/route';
import { SANITIZED_NUBANK_INVOICE_TEXT } from '@/core/imports/__fixtures__/nubank-sanitized-fixture';

describe('FINDOMUS — PDF.CREDIT.CARD.INVOICE.PARSER.1 P5 ROUTE INTEGRATION TEST SUITE', () => {

  // 01 supported Nubank routes deterministic
  it('01: supported Nubank routes deterministic — status 200, docKind=credit_card_invoice, issuer=nubank, transactions=112', async () => {
    const res = await processPdfText(SANITIZED_NUBANK_INVOICE_TEXT, 'test_user_123');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.docKind, 'credit_card_invoice');
    assert.strictEqual(res.body.cardIssuer, 'nubank');
    assert.ok(Array.isArray(res.body.transactions));
    // 112 transactions total: 111 invoice transactions (87 regular + 14 installments + 10 refunds) + 1 ignored prior invoice payment
    assert.strictEqual(res.body.transactions.length, 112);
  });

  // 02 supported Nubank does not call bank parser
  it('02: supported Nubank does not call bank parser — extracts credit card invoice semantics', async () => {
    const res = await processPdfText(SANITIZED_NUBANK_INVOICE_TEXT, 'test_user_123');
    assert.strictEqual(res.status, 200);
    // If parseBankStatementText had run on Nubank invoice text, it would return 0 transactions
    // because card invoice layout does not match bank checking statement regex
    assert.ok(res.body.transactions!.length > 0);
    assert.strictEqual(res.body.transactions!.length, 112);
  });

  // 03 supported Nubank does not require Gemini
  it('03: supported Nubank does not require Gemini — returns non-empty transactions preventing client AI fallback', async () => {
    const res = await processPdfText(SANITIZED_NUBANK_INVOICE_TEXT, 'test_user_123');
    assert.strictEqual(res.status, 200);
    // In importer.tsx: if (extractedTransactions.length === 0) { handleFileExtract(...) }
    // Since transactions.length === 112 > 0, handleFileExtract() is NOT triggered!
    assert.ok(res.body.transactions && res.body.transactions.length > 0);
  });

  // 04 Nubank reconciliation failure returns blocking error
  it('04: Nubank reconciliation failure returns blocking error — status 422, RECONCILIATION_MISMATCH', async () => {
    // Tamper total in text to force reconciliation difference
    const tampered = SANITIZED_NUBANK_INVOICE_TEXT.replace('12.773,07', '13.500,00');
    const res = await processPdfText(tampered, 'test_user_123');
    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.body.code, 'RECONCILIATION_MISMATCH');
    assert.ok(res.body.error?.includes('Reconciliation hard gate failed'));
    // Crucial: do NOT return empty transactions on supported layout failure!
    assert.strictEqual(res.body.transactions, undefined);
  });

  // 05 ambiguous Nubank transaction returns blocking error
  it('05: ambiguous Nubank transaction returns blocking error — status 422, AMBIGUOUS_TRANSACTION_AMOUNT', async () => {
    // Inject ambiguous amount line into transactions
    const tampered = SANITIZED_NUBANK_INVOICE_TEXT.replace(
      'Rei do Mate Icarai R$ 29,80',
      'Rei do Mate Icarai R$ 20,00 taxa R$ 9,80 R$ 29,80'
    );
    const res = await processPdfText(tampered, 'test_user_123');
    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.body.code, 'AMBIGUOUS_TRANSACTION_AMOUNT');
    assert.ok(res.body.error?.includes('Ambiguous transaction amount'));
  });

  // 06 unsupported card issuer produces AI-fallback-compatible empty result
  it('06: unsupported card issuer produces AI-fallback-compatible empty result — status 200, transactions=[]', async () => {
    const genericCardInvoice = `
      FATURA DO CARTÃO DE CRÉDITO VISA
      Total a pagar: R$ 850,00
      Data de vencimento: 15/09/2026
      Pagamento mínimo: R$ 100,00
      Resumo da Fatura
      Transações do período:
      01 SET Supermercado R$ 200,00
    `;
    const res = await processPdfText(genericCardInvoice, 'test_user_123');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.docKind, 'credit_card_invoice');
    assert.strictEqual(res.body.cardIssuer, 'unknown');
    assert.deepStrictEqual(res.body.transactions, []);
  });

  // 07 unknown PDF produces AI-fallback-compatible empty result
  it('07: unknown PDF produces AI-fallback-compatible empty result — status 200, transactions=[]', async () => {
    const unknownText = `
      Relatório Trimestral de Vendas
      Empresa XYZ Ltda
      Nenhum dado financeiro padronizado presente.
    `;
    const res = await processPdfText(unknownText, 'test_user_123');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.docKind, 'unknown');
    assert.strictEqual(res.body.cardIssuer, 'unknown');
    assert.deepStrictEqual(res.body.transactions, []);
  });

  // 08 ordinary bank statement routes legacy parser
  it('08: ordinary bank statement routes legacy parser — routes to parseBankStatementText', async () => {
    const bankStatementText = `
      Extrato de Conta Corrente
      01/08/2026 DEBITO AUTOMATICO 150,00 (-)
      02/08/2026 CREDITO SALARIO 3.000,00 (+)
      Saldo do dia: 2.850,00
    `;
    const res = await processPdfText(bankStatementText, 'test_user_123');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.docKind, 'bank_statement');
    assert.ok(Array.isArray(res.body.transactions));
    assert.ok(res.body.transactions.length >= 2);
  });

  // 09 response remains backward compatible
  it('09: response remains backward compatible — contains text and transactions keys', async () => {
    const res = await processPdfText(SANITIZED_NUBANK_INVOICE_TEXT, 'test_user_123');
    assert.strictEqual(res.status, 200);
    assert.ok('text' in res.body);
    assert.ok('transactions' in res.body);
    assert.strictEqual(typeof res.body.text, 'string');
    assert.ok(Array.isArray(res.body.transactions));
  });


  // Close Firestore network listeners to allow clean process termination in node:test
  after(async () => {
    try {
      const { terminate } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      await terminate(db);
    } catch {}
  });

  // 10 metadata contains no PII
  it('10: metadata contains no PII — contains only transient financial reconciliation fields', async () => {
    const res = await processPdfText(SANITIZED_NUBANK_INVOICE_TEXT, 'test_user_123');
    assert.strictEqual(res.status, 200);
    const meta = res.body.metadata;
    assert.ok(meta, 'Metadata should be present for Nubank invoice');

    // Expected transient reconciliation keys
    const allowedKeys = [
      'invoiceTotal',
      'grossExpenses',
      'refundTotal',
      'ignoredPayments',
      'netParsedTotal',
      'difference',
      'reconciled',
      'layoutVersion',
    ];

    for (const key of Object.keys(meta)) {
      assert.ok(allowedKeys.includes(key), `Unexpected metadata key: ${key}`);
    }

    // Explicitly verify sensitive fields are absent
    assert.strictEqual((meta as any).cardholderName, undefined);
    assert.strictEqual((meta as any).name, undefined);
    assert.strictEqual((meta as any).cpf, undefined);
    assert.strictEqual((meta as any).address, undefined);
    assert.strictEqual((meta as any).cardNumber, undefined);
  });

  it('11: unsupported Nubank layout returns status 422, blocks AI fallback, and returns zero partial transactions', async () => {
    const unsupportedNubankPdf = `
      Nu Pagamentos S.A. - Instituição de Pagamento
      Fatura de Cartão de Crédito Nubank
      Conta Nubank
      Vencimento: 15/10/2027
      Total a pagar: R$ 2.450,00
      Pagamento mínimo: R$ 300,00
      Resumo da fatura atual
      Extrato de compras em tabela:
      Data: 01/10/2027 Estabelecimento: Mercado XYZ Valor: R$ 100,00
    `;
    const res = await processPdfText(unsupportedNubankPdf, 'test-user-123');
    // Must return 422, NOT 200 (which would trigger client AI fallback)
    assert.strictEqual(res.status, 422);
    assert.strictEqual(res.body.code, 'LAYOUT_UNRECOGNIZED');
    // Must not return partial transactions
    assert.strictEqual(res.body.transactions, undefined);
  });
});
