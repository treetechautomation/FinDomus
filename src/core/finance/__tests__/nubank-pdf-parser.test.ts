import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  detectPDFDocumentKind,
  detectCreditCardInvoiceIssuer,
} from '@/core/imports/pdf-document-detector';

import {
  parseNubankInvoicePDF,
  stripNubankPageBoundaryHeaders,
  extractNubankTransactionAmount,
  extractNubankInstallments,
  extractNubankInvoiceHeader,
  resolveNubankTransactionDate,
} from '@/core/imports/nubank-invoice-pdf-parser';

import { SANITIZED_NUBANK_INVOICE_TEXT } from '@/core/imports/__fixtures__/nubank-sanitized-fixture';
import { getIncomeEffect, getExpenseEffect } from '@/core/finance/transaction-effects';
import { shouldUpsertLiabilityFromTransaction } from '@/services/firestore/liabilities';
import { generateImportHash } from '@/services/firestore/transactions';

describe('FINDOMUS — PDF.CREDIT.CARD.INVOICE.PARSER.1 DETERMINISTIC TEST SUITE', () => {

  // 01 document type detection
  it('01: document type detection — classifies card invoice text correctly', () => {
    const kind = detectPDFDocumentKind(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(kind, 'credit_card_invoice');
  });

  // 02 Nubank issuer detection
  it('02: Nubank issuer detection — detects Nubank from multi-marker invoice', () => {
    const issuer = detectCreditCardInvoiceIssuer(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(issuer, 'nubank');
  });

  // 03 false-positive issuer rejection
  it('03: false-positive issuer rejection — does not detect Nubank just from memo word in bank statement', () => {
    const fakeStatement = `
      Extrato de Conta Corrente
      Agência: 0001 Conta: 12345-6
      Saldo anterior: R$ 1.000,00
      01/08/2026 PIX Enviado Nubank R$ 150,00 (-)
      Saldo do dia: R$ 850,00
    `;
    const kind = detectPDFDocumentKind(fakeStatement);
    const issuer = detectCreditCardInvoiceIssuer(fakeStatement);
    assert.strictEqual(kind, 'bank_statement');
    assert.strictEqual(issuer, 'unknown');
  });

  // 04 normal BRL purchase
  it('04: normal BRL purchase — parsed with type=expense, positive amount, isRefund=false', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const normal = result.transactions.find(t => t.description.includes('Rei do Mate Icarai'));
    assert.ok(normal, 'Rei do Mate transaction should be found');
    assert.strictEqual(normal.amount, 29.80);
    assert.strictEqual(normal.type, 'expense');
    assert.strictEqual(normal.isRefund, false);
    assert.strictEqual(normal.date, '2026-06-26');
  });

  // 05 installment purchase
  it('05: installment purchase — extracts current, total, and key correctly', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const installmentTx = result.transactions.find(t => t.description.includes('Liritty Icarai'));
    assert.ok(installmentTx, 'Liritty installment transaction should be found');
    assert.strictEqual(installmentTx.amount, 152.42);
    assert.strictEqual((installmentTx as any).isInstallment, true);
    assert.strictEqual((installmentTx as any).installmentCurrent, 4);
    assert.strictEqual((installmentTx as any).installmentTotal, 4);
    assert.ok((installmentTx as any).installmentKey, 'installmentKey should be present');
  });

  // 06 international USD transaction
  it('06: international USD transaction — extracts posted BRL amount, ignores original USD', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const deepseekTx = result.transactions.find(t => t.date === '2026-07-04' && t.description.includes('Deepseek'));
    assert.ok(deepseekTx, 'Deepseek purchase should be found');
    assert.strictEqual(deepseekTx.amount, 113.48);
    assert.strictEqual(deepseekTx.type, 'expense');
    assert.strictEqual(deepseekTx.isRefund, false);
  });

  // 07 international EUR transaction
  it('07: international EUR transaction — extracts posted BRL amount, ignores original EUR/USD', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const bkgTx = result.transactions.find(t => t.description.includes('Bkg*Hotel At Booking.C') && !t.description.includes('IOF'));
    assert.ok(bkgTx, 'Booking.com EUR purchase should be found');
    assert.strictEqual(bkgTx.amount, 5593.97);
    assert.strictEqual(bkgTx.type, 'expense');
  });

  // 08 exchange-rate informational BRL ignored
  it('08: exchange-rate informational BRL ignored — does not confuse conversion rate with posted amount', () => {
    const line = 'Deepseek USD 21.20 Conversão: USD 1 = R$ 5,35 R$ 113,48';
    const parsed = extractNubankTransactionAmount(line);
    assert.strictEqual(parsed.amount, 113.48);
    assert.strictEqual(parsed.isNegative, false);
    assert.ok(!parsed.description.includes('113,48'));
  });

  // 09 IOF charge
  it('09: IOF charge — treated as normal expense', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const iofTx = result.transactions.find(t => t.description === 'IOF de "Courtyard.Io"');
    assert.ok(iofTx, 'IOF charge should be found');
    assert.strictEqual(iofTx.amount, 187.34);
    assert.strictEqual(iofTx.type, 'expense');
    assert.strictEqual(iofTx.isRefund, false);
  });

  // 10 Uber refund
  it('10: Uber refund — canonical expense + isRefund=true, positive amount', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const uberRefund = result.transactions.find(t => t.description.includes('Estorno de Uber'));
    assert.ok(uberRefund, 'Uber refund should be found');
    assert.strictEqual(uberRefund.isRefund, true);
    assert.strictEqual(uberRefund.type, 'expense');
    assert.strictEqual(uberRefund.amount, 8.99);
  });

  // 11 IOF de volta refund
  it('11: IOF de volta refund — canonical expense + isRefund=true, positive amount', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const iofRefund = result.transactions.find(t => t.description.includes('IOF de volta de Deepseek'));
    assert.ok(iofRefund, 'IOF de volta should be found');
    assert.strictEqual(iofRefund.isRefund, true);
    assert.strictEqual(iofRefund.type, 'expense');
    assert.strictEqual(iofRefund.amount, 3.97);
  });

  // 12 Crédito de Confiança refund
  it('12: Crédito de Confiança refund — canonical expense + isRefund=true, positive amount', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const trustCredit = result.transactions.find(t => t.description.includes('Crédito de Confiança'));
    assert.ok(trustCredit, 'Crédito de Confiança should be found');
    assert.strictEqual(trustCredit.isRefund, true);
    assert.strictEqual(trustCredit.type, 'expense');
    assert.strictEqual(trustCredit.amount, 5352.71);
  });

  // 13 Depósito de Confiança refund
  it('13: Depósito de Confiança refund — canonical expense + isRefund=true, positive amount', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const trustDeposit = result.transactions.find(t => t.description.includes('Depósito de Confiança'));
    assert.ok(trustDeposit, 'Depósito de Confiança should be found');
    assert.strictEqual(trustDeposit.isRefund, true);
    assert.strictEqual(trustDeposit.type, 'expense');
    assert.strictEqual(trustDeposit.amount, 187.34);
  });

  // 14 invoice payment ignored
  it('14: invoice payment ignored — Pagamento em 01 JUL has ignored=true, not refund', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const payment = result.transactions.find(t => t.description.includes('Pagamento em 01 JUL'));
    assert.ok(payment, 'Invoice payment should be found');
    assert.strictEqual(payment.ignored, true);
    assert.strictEqual(payment.isRefund, undefined);
    assert.strictEqual(payment.amount, 6749.58);
  });

  // 15 invoice total extraction
  it('15: invoice total extraction — extracts 12773.07 from header', () => {
    const header = extractNubankInvoiceHeader(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(header.invoiceTotal, 12773.07);
    assert.strictEqual(header.dueDateISO, '2026-08-03');
  });

  // 16 exact reconciliation 12773.07
  it('16: exact reconciliation 12773.07 — netParsedTotal matches invoiceTotal exactly', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    assert.strictEqual(result.metadata.invoiceTotal, 12773.07);
    assert.strictEqual(result.metadata.grossExpenses, 18728.67);
    assert.strictEqual(result.metadata.refundTotal, 5955.60);
    assert.strictEqual(result.metadata.ignoredPayments, 6749.58);
    assert.strictEqual(result.metadata.netParsedTotal, 12773.07);
    assert.strictEqual(result.metadata.difference, 0);
    assert.strictEqual(result.metadata.reconciled, true);
    assert.strictEqual(result.transactions.length, 112);
  });

  // 17 reconciliation mismatch HARD FAIL
  it('17: reconciliation mismatch HARD FAIL — rejects parse when total differs', async () => {
    const tamperedText = SANITIZED_NUBANK_INVOICE_TEXT.replace('12.773,07', '13.000,00');
    const result = await parseNubankInvoicePDF(tamperedText);
    assert.strictEqual(result.success, false);
    if (result.success) return;
    assert.strictEqual(result.code, 'RECONCILIATION_MISMATCH');
    assert.ok(result.error.includes('Reconciliation hard gate failed'));
  });

  // 18 ambiguous BRL amount HARD FAIL
  it('18: ambiguous BRL amount HARD FAIL — rejects transaction with multiple unexplained BRL amounts', () => {
    assert.throws(
      () => {
        extractNubankTransactionAmount('Supermercado R$ 50,00 desconto R$ 10,00 R$ 40,00');
      },
      (err: any) => err.message.includes('AMBIGUOUS_TRANSACTION_AMOUNT')
    );
  });

  // 19 malformed transaction safe failure
  it('19: malformed transaction safe failure — throws when no BRL amount exists', () => {
    assert.throws(
      () => {
        extractNubankTransactionAmount('Supermercado sem valor financeiro');
      },
      (err: any) => err.message.includes('MALFORMED_TRANSACTION_LINE')
    );
  });

  // 20 unsupported card issuer
  it('20: unsupported card issuer — returns issuer=unknown for generic invoice text', () => {
    const genericInvoice = `
      FATURA DO CARTÃO DE CRÉDITO
      Total a pagar: R$ 500,00
      Data de vencimento: 10/09/2026
      Pagamento mínimo: R$ 50,00
      Transações do período:
      01 SET Restaurante R$ 100,00
    `;
    const kind = detectPDFDocumentKind(genericInvoice);
    const issuer = detectCreditCardInvoiceIssuer(genericInvoice);
    assert.strictEqual(kind, 'credit_card_invoice');
    assert.strictEqual(issuer, 'unknown');
  });

  // 21 ordinary bank statement regression
  it('21: ordinary bank statement regression — correctly recognized as bank statement, issuer unknown', () => {
    const bankText = `
      Extrato de Conta Corrente
      Banco do Brasil
      Saldo anterior: 500,00
      10/08/2026 COMPRA CARTAO 150,00 (-)
      Saldo final: 350,00
    `;
    const kind = detectPDFDocumentKind(bankText);
    const issuer = detectCreditCardInvoiceIssuer(bankText);
    assert.strictEqual(kind, 'bank_statement');
    assert.strictEqual(issuer, 'unknown');
  });

  // 22 refund never income
  it('22: refund never income — getIncomeEffect on parsed refund returns 0', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const refund = result.transactions.find(t => t.isRefund);
    assert.ok(refund, 'A refund transaction should exist');
    assert.strictEqual(getIncomeEffect(refund), 0);
    assert.strictEqual(getExpenseEffect(refund), -Math.abs(refund.amount));
  });

  // 23 refund liability eligibility = false
  it('23: refund liability eligibility = false — shouldUpsertLiabilityFromTransaction returns false', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const refund = result.transactions.find(t => t.isRefund);
    assert.ok(refund);
    const liabilityEligible = shouldUpsertLiabilityFromTransaction(refund as any);
    assert.strictEqual(liabilityEligible, false);
  });

  // 24 normal installment liability compatibility
  it('24: normal installment liability compatibility — shouldUpsertLiabilityFromTransaction returns true for normal installment', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const normalInstallment = result.transactions.find(t => (t as any).isInstallment && !t.isRefund && !t.ignored);
    assert.ok(normalInstallment, 'Normal installment purchase should exist');
    const liabilityEligible = shouldUpsertLiabilityFromTransaction(normalInstallment as any);
    assert.strictEqual(liabilityEligible, true);
  });

  // 25 import hash stability
  it('25: import hash stability — generateImportHash returns stable, deterministic hash', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const tx = result.transactions[0];
    const hash1 = generateImportHash({
      date: tx.date,
      amount: tx.amount,
      description: tx.description,
      merchant: tx.merchant,
      owner: 'PF',
      isRefund: tx.isRefund,
    });
    const hash2 = generateImportHash({
      date: tx.date,
      amount: tx.amount,
      description: tx.description,
      merchant: tx.merchant,
      owner: 'PF',
      isRefund: tx.isRefund,
    });
    assert.strictEqual(hash1, hash2);
    assert.ok(hash1.startsWith('imp_'));
  });

  // 26 refund state does not alter source identity
  it('26: refund state does not alter source identity — base transaction fields remain identical', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const refundTx = result.transactions.find(t => t.isRefund);
    assert.ok(refundTx);

    // Source identity is formed by date, amount, description, merchant, owner
    const sourceData = {
      date: refundTx.date,
      amount: refundTx.amount,
      description: refundTx.description,
      merchant: refundTx.merchant,
      owner: 'PF' as const,
    };

    const hashWithoutRefund = generateImportHash({ ...sourceData, isRefund: false });
    const hashWithRefund = generateImportHash({ ...sourceData, isRefund: true });

    // Source fields themselves are unchanged, only the refund discriminator is added to the hash
    assert.strictEqual(sourceData.amount, refundTx.amount);
    assert.strictEqual(sourceData.description, refundTx.description);
    assert.notStrictEqual(hashWithoutRefund, hashWithRefund);
  });

  // 27 cycle crossing month
  it('27: cycle crossing month — resolves earlier month in cycle to same year', () => {
    // 26 JUN in invoice due 03 AGO 2026 -> 2026-06-26
    const date = resolveNubankTransactionDate('26', 'JUN', 2026, 8);
    assert.strictEqual(date, '2026-06-26');
  });

  // 28 cycle crossing year
  it('28: cycle crossing year — resolves December transaction with January due date to previous year', () => {
    // 28 DEZ in invoice due 05 JAN 2026 -> 2025-12-28
    const datePrevYear = resolveNubankTransactionDate('28', 'DEZ', 2026, 1);
    assert.strictEqual(datePrevYear, '2025-12-28');

    // 02 JAN in invoice due 05 JAN 2026 -> 2026-01-02
    const dateCurrentYear = resolveNubankTransactionDate('02', 'JAN', 2026, 1);
    assert.strictEqual(dateCurrentYear, '2026-01-02');
  });

  // 29 unsupported Nubank layout fails safely with LAYOUT_UNRECOGNIZED
  it('29: unsupported Nubank layout fails safely — rejects unrecognized layout with LAYOUT_UNRECOGNIZED and no partial transactions', async () => {
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
    const result = await parseNubankInvoicePDF(unsupportedNubankPdf);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.code, 'LAYOUT_UNRECOGNIZED');
      assert.strictEqual((result as any).transactions, undefined);
    }
  });
  // TEST A (30): Real-layout repeated page header without synthetic \d+: prefix is stripped
  it('30: Test A — real-layout repeated page header without synthetic \\d+: prefix is stripped', () => {
    const input = '28 JUN •••• 4557 Portista R$ 241,89 5  de 9\nCLIENTE TESTE NUBANK FATURA  03 AGO 2026 EMISSÃO E ENVIO  27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN Transação de NuTag R$ 6,60';
    const cleaned = stripNubankPageBoundaryHeaders(input);
    assert.strictEqual(cleaned.includes('FATURA'), false);
    assert.strictEqual(cleaned.includes('EMISSÃO E ENVIO'), false);
    assert.strictEqual(cleaned.includes('TRANSAÇÕES DE'), false);
    assert.strictEqual(cleaned.includes('5  de 9'), false);
    assert.ok(cleaned.includes('Portista R$ 241,89'));
    assert.ok(cleaned.includes('28 JUN Transação de NuTag R$ 6,60'));
  });

  // TEST B (31): Multiple repeated headers are stripped across multiple pages
  it('31: Test B — multiple repeated page headers across pages are stripped', () => {
    const input = '05 JUL Dl *Uberrides R$ 15,94 6  de 9\nCLIENTE NUBANK FATURA  03 AGO 2026 EMISSÃO E ENVIO  27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 06 JUL Selfit R$ 129,90 7  de 9\nCLIENTE NUBANK FATURA  03 AGO 2026 EMISSÃO E ENVIO  27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 16 JUL Uber R$ 1,00';
    const cleaned = stripNubankPageBoundaryHeaders(input);
    assert.strictEqual(cleaned.includes('FATURA'), false);
    assert.strictEqual(cleaned.includes('6  de 9'), false);
    assert.strictEqual(cleaned.includes('7  de 9'), false);
    assert.ok(cleaned.includes('15,94'));
    assert.ok(cleaned.includes('129,90'));
    assert.ok(cleaned.includes('1,00'));
  });

  // TEST C (32): Optional "N de M" page footer is handled
  it('32: Test C — handles both present and omitted "N de M" page footer', () => {
    const withFooter = '28 JUN Portista R$ 241,89 5 de 9\nCLIENTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN NuTag R$ 6,60';
    const withoutFooter = '28 JUN Portista R$ 241,89\nCLIENTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN NuTag R$ 6,60';
    const cleaned1 = stripNubankPageBoundaryHeaders(withFooter);
    const cleaned2 = stripNubankPageBoundaryHeaders(withoutFooter);
    assert.strictEqual(cleaned1.includes('FATURA'), false);
    assert.strictEqual(cleaned2.includes('FATURA'), false);
    assert.ok(cleaned1.includes('Portista R$ 241,89'));
    assert.ok(cleaned2.includes('Portista R$ 241,89'));
  });

  // TEST D (33): Header/cardholder structural area does not require literal customer identity
  it('33: Test D — strips header regardless of arbitrary cardholder text', () => {
    const cardholderA = '28 JUN Tx A R$ 10,00 5 de 9\nFULANO DE TAL FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN Tx B R$ 20,00';
    const cardholderB = '28 JUN Tx A R$ 10,00 5 de 9\nBELTRANO DA SILVA MOREIRA FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN Tx B R$ 20,00';
    assert.strictEqual(stripNubankPageBoundaryHeaders(cardholderA).includes('FATURA'), false);
    assert.strictEqual(stripNubankPageBoundaryHeaders(cardholderB).includes('FATURA'), false);
  });

  // TEST E (34): Near-match merchant/description containing ordinary words such as "Fatura" must NOT be stripped
  it('34: Test E — does not strip merchant description containing ordinary word "Fatura"', () => {
    const ordinaryTx = '28 JUN Fatura Seguros E Pagamentos R$ 150,00 29 JUN Uber R$ 25,00';
    const cleaned = stripNubankPageBoundaryHeaders(ordinaryTx);
    assert.ok(cleaned.includes('Fatura Seguros E Pagamentos R$ 150,00'));
  });

  // TEST F (35): Malformed transaction unrelated to page-header contamination still returns MALFORMED_TRANSACTION_LINE
  it('35: Test F — genuinely malformed transaction unrelated to header fails closed with MALFORMED_TRANSACTION_LINE', async () => {
    const malformedText = SANITIZED_NUBANK_INVOICE_TEXT.replace('Rei do Mate Icarai R$ 29,80', 'Rei do Mate Icarai SEM_VALOR');
    const res = await parseNubankInvoicePDF(malformedText, 'test-user');
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.code, 'MALFORMED_TRANSACTION_LINE');
    }
  });

  // TEST G (36): Full sanitized real-layout invoice reconciles exactly: 112 total, 111 participating, 1 ignored, 10 refunds, 14 installments, 12773.07
  it('36: Test G — full sanitized real-layout invoice reconciles completely to 12773.07', async () => {
    const res = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT, 'test-user');
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.transactions.length, 112);
      const participating = res.transactions.filter((t) => !t.ignored);
      assert.strictEqual(participating.length, 111);
      const ignored = res.transactions.filter((t) => t.ignored === true);
      assert.strictEqual(ignored.length, 1);
      const refunds = participating.filter((t) => t.isRefund);
      assert.strictEqual(refunds.length, 10);
      const installments = participating.filter((t: any) => t.isInstallment);
      assert.strictEqual(installments.length, 14);
      assert.strictEqual(res.metadata.invoiceTotal, 12773.07);
      assert.strictEqual(res.metadata.netParsedTotal, 12773.07);
      assert.strictEqual(res.metadata.reconciled, true);
    }
  });

  // TEST H (37): Refund/installment/prior-payment invariants remain intact
  it('37: Test H — refund/installment/prior-payment invariants remain intact on real-layout fixture', async () => {
    const res = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT, 'test-user');
    assert.strictEqual(res.success, true);
    if (res.success) {
      const ignored = res.transactions.find((t) => t.ignored === true);
      assert.ok(ignored);
      assert.strictEqual(ignored.amount, 6749.58);
      assert.strictEqual(shouldUpsertLiabilityFromTransaction(ignored as any), false);

      const refunds = res.transactions.filter((t) => t.isRefund);
      for (const r of refunds) {
        assert.strictEqual(r.type, 'expense');
        assert.strictEqual(r.isRefund, true);
        assert.ok(r.amount > 0);
        assert.strictEqual(getIncomeEffect(r as any), 0);
        assert.strictEqual(getExpenseEffect(r as any), -Math.abs(r.amount));
        assert.strictEqual(shouldUpsertLiabilityFromTransaction(r as any), false);
      }
    }
  });
  // P19.1 REQUIRED ADVERSARIAL TESTS (A - O & CROSS-BOUNDARY)
  it('38: Adversarial A, B, C — ordinary descriptions containing "de" ("Parcela 5 de 9", "Plano 2 de 12", "Compra 1 de 3") remain byte-for-byte intact', () => {
    const descA = '28 JUN Magazine Luiza - Parcela 5 de 9 R$ 120,00';
    const descB = '28 JUN Plano 2 de 12 R$ 50,00';
    const descC = '28 JUN Compra 1 de 3 R$ 75,00';
    assert.strictEqual(stripNubankPageBoundaryHeaders(descA), descA);
    assert.strictEqual(stripNubankPageBoundaryHeaders(descB), descB);
    assert.strictEqual(stripNubankPageBoundaryHeaders(descC), descC);
  });

  it('39: Adversarial D, E, F — ordinary descriptions containing "Fatura", "Transações de", "Emissão e envio" remain byte-for-byte intact', () => {
    const descD = '28 JUN Fatura Express Servicos R$ 100,00';
    const descE = '28 JUN Transações de Internet Telecom R$ 50,00';
    const descF = '28 JUN Emissão e envio de comprovante R$ 10,00';
    assert.strictEqual(stripNubankPageBoundaryHeaders(descD), descD);
    assert.strictEqual(stripNubankPageBoundaryHeaders(descE), descE);
    assert.strictEqual(stripNubankPageBoundaryHeaders(descF), descF);
  });

  it('40: Adversarial G, H — near-complete headers missing EMISSÃO E ENVIO or missing TRANSAÇÕES DE are NOT stripped', () => {
    const missingEmissao = '28 JUN Tx A R$ 10,00 5 de 9\nCLIENTE FATURA 03 AGO 2026 TRANSAÇÕES DE 26 JUN A 27 JUL 28 JUN Tx B R$ 20,00';
    const missingTransacoes = '28 JUN Tx A R$ 10,00 5 de 9\nCLIENTE FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 28 JUN Tx B R$ 20,00';
    assert.strictEqual(stripNubankPageBoundaryHeaders(missingEmissao), missingEmissao);
    assert.strictEqual(stripNubankPageBoundaryHeaders(missingTransacoes), missingTransacoes);
  });

  // TEST I, J, K, L, M, O (41): Explicit compound header variants and boundary preservation
  it('41: Adversarial I, J, K, L, M, O — full compound headers (real, synthetic, with N de M) stripped while adjacent transactions remain intact', () => {
    // Case I: full real-layout compound header
    const caseI = '12 JUN Loja ABC R$ 50,00\nFATURA 03 AGO 2026 EMISSÃO E ENVIO 03 AGO 2026 TRANSAÇÕES DE 03 JUL A 03 AGO\n13 JUN Mercado R$ 20,00';
    const cleanedI = stripNubankPageBoundaryHeaders(caseI);
    assert.strictEqual(cleanedI.includes('FATURA'), false);
    assert.ok(cleanedI.includes('12 JUN Loja ABC R$ 50,00'));
    assert.ok(cleanedI.includes('13 JUN Mercado R$ 20,00'));

    // Case J: compound header preceded by N de M
    const caseJ = '12 JUN Loja ABC R$ 50,00\n3 de 8\nCLIENTE FATURA 03 AGO 2026 EMISSÃO E ENVIO 03 AGO 2026 TRANSAÇÕES DE 03 JUL A 03 AGO\n13 JUN Mercado R$ 20,00';
    const cleanedJ = stripNubankPageBoundaryHeaders(caseJ);
    assert.strictEqual(cleanedJ.includes('FATURA'), false);
    assert.strictEqual(cleanedJ.includes('3 de 8'), false);
    assert.ok(cleanedJ.includes('12 JUN Loja ABC R$ 50,00'));
    assert.ok(cleanedJ.includes('13 JUN Mercado R$ 20,00'));

    // Case K: compound header with legacy synthetic N:
    const caseK = '12 JUN Loja ABC R$ 50,00\n2: CLIENTE FATURA 03 AGO 2026 EMISSÃO E ENVIO 03 AGO 2026 TRANSAÇÕES DE 03 JUL A 03 AGO\n13 JUN Mercado R$ 20,00';
    const cleanedK = stripNubankPageBoundaryHeaders(caseK);
    assert.strictEqual(cleanedK.includes('FATURA'), false);
    assert.ok(cleanedK.includes('12 JUN Loja ABC R$ 50,00'));
    assert.ok(cleanedK.includes('13 JUN Mercado R$ 20,00'));

    // Case L: transaction immediately before page boundary remains intact
    const caseL = '12 JUN Loja Z R$ 150,00\n5 de 9\nCLIENTE TESTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL\n13 JUN Mercado R$ 20,00';
    const cleanedL = stripNubankPageBoundaryHeaders(caseL);
    assert.ok(cleanedL.includes('12 JUN Loja Z R$ 150,00'));

    // Case M: transaction immediately after page boundary remains intact
    const caseM = '12 JUN Loja Z R$ 150,00\n5 de 9\nCLIENTE TESTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL\n13 JUN Posto Shell R$ 250,00';
    const cleanedM = stripNubankPageBoundaryHeaders(caseM);
    assert.ok(cleanedM.includes('13 JUN Posto Shell R$ 250,00'));

    // Case O: multiple real-layout repeated headers
    const caseO = '12 JUN Loja 1 R$ 10,00\n3 de 8\nCLIENTE TESTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL\n13 JUN Loja 2 R$ 20,00\n4 de 8\nCLIENTE TESTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 27 JUL 2026 TRANSAÇÕES DE 26 JUN A 27 JUL\n14 JUN Loja 3 R$ 30,00';
    const cleanedO = stripNubankPageBoundaryHeaders(caseO);
    assert.strictEqual(cleanedO.includes('FATURA'), false);
    assert.strictEqual(cleanedO.includes('3 de 8'), false);
    assert.strictEqual(cleanedO.includes('4 de 8'), false);
    assert.ok(cleanedO.includes('12 JUN Loja 1 R$ 10,00'));
    assert.ok(cleanedO.includes('13 JUN Loja 2 R$ 20,00'));
    assert.ok(cleanedO.includes('14 JUN Loja 3 R$ 30,00'));
  });

  // TEST CROSS-BOUNDARY (42): Multiple newlines and alphabetic descriptions do not get swallowed
  it('42: Cross-boundary adversarial — transaction ending in alphabetic text before newline with partial header or multiple newlines does NOT swallow transaction text', () => {
    // 1. Transaction ending with alphabetic tokens followed by newline and non-matching header fragment
    const input1 = '28 JUN Supermercado Extra Delivery\n\nCLIENTE TESTE FATURA ABERTA SEM CONTRATO COMPLETO\n29 JUN Farmacia R$ 30,00';
    const cleaned1 = stripNubankPageBoundaryHeaders(input1);
    assert.strictEqual(cleaned1, input1);
    assert.ok(cleaned1.includes('Supermercado Extra Delivery'));

    // 2. Transaction ending with alphabetic text followed by multiple newlines and missing TRANSAÇÕES DE
    const input2 = '28 JUN Alphabetic Restaurant\n\n\nFATURA 03 AGO 2026 EMISSÃO E ENVIO 03 AGO 2026\n\n29 JUN Padaria R$ 15,00';
    const cleaned2 = stripNubankPageBoundaryHeaders(input2);
    assert.strictEqual(cleaned2, input2);
    assert.ok(cleaned2.includes('Alphabetic Restaurant'));

    // 3. Complete header across newlines does not swallow preceding alphabetic description
    const input3 = '28 JUN Alphabetic Restaurant Extra\n5 de 9\nCLIENTE NUBANK FATURA 03 AGO 2026 EMISSÃO E ENVIO 03 AGO 2026 TRANSAÇÕES DE 03 JUL A 03 AGO\n29 JUN Padaria R$ 15,00';
    const cleaned3 = stripNubankPageBoundaryHeaders(input3);
    assert.ok(cleaned3.includes('28 JUN Alphabetic Restaurant Extra'));
    assert.ok(cleaned3.includes('29 JUN Padaria R$ 15,00'));
    assert.strictEqual(cleaned3.includes('FATURA'), false);
  });
});
