/**
 * Nubank Credit Card Invoice PDF Parser
 *
 * Scope: SUPPORTED_NUBANK_LAYOUT_V1
 * Strictly deterministic extraction of credit card invoice PDF text.
 * Reconciles gross purchases, canonical refunds, and ignored payments
 * against official invoice total. Fails safely upon any ambiguity.
 */

import type { ParsedTransaction } from '@/core/finance/transaction-classifier';
import {
  isCreditCardRefundDescription,
  isInvoicePaymentDescription,
} from '@/core/imports/credit-card-invoice-rules';
import { normalizeHashText } from '@/services/firestore/transactions';

export const NUBANK_LAYOUT_VERSION = 'SUPPORTED_NUBANK_LAYOUT_V1' as const;

export type NubankInvoiceParseMetadata = {
  invoiceTotal: number;
  grossExpenses: number;
  refundTotal: number;
  ignoredPayments: number;
  netParsedTotal: number;
  difference: number;
  reconciled: boolean;
  layoutVersion: typeof NUBANK_LAYOUT_VERSION;
  dueDate: string;
  billingPeriod?: string;
  cardholderName?: string;
};

export type NubankInvoiceParseSuccess = {
  success: true;
  layoutVersion: typeof NUBANK_LAYOUT_VERSION;
  transactions: ParsedTransaction[];
  metadata: NubankInvoiceParseMetadata;
};

export type NubankInvoiceParseErrorCode =
  | 'LAYOUT_UNRECOGNIZED'
  | 'TOTAL_NOT_FOUND'
  | 'DUE_DATE_NOT_FOUND'
  | 'NO_TRANSACTIONS_FOUND'
  | 'AMBIGUOUS_TRANSACTION_AMOUNT'
  | 'MALFORMED_TRANSACTION_LINE'
  | 'RECONCILIATION_MISMATCH';

export type NubankInvoiceParseFailure = {
  success: false;
  layoutVersion?: typeof NUBANK_LAYOUT_VERSION | 'UNKNOWN';
  error: string;
  code: NubankInvoiceParseErrorCode;
  metadata?: Partial<NubankInvoiceParseMetadata>;
};

export type NubankInvoiceParseResult =
  | NubankInvoiceParseSuccess
  | NubankInvoiceParseFailure;

const PT_MONTHS: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

/**
 * Resolves transaction date string (DD MMM) to ISO YYYY-MM-DD
 * using the invoice due year and due month context.
 * Properly accounts for cycles crossing year boundaries.
 */
export function resolveNubankTransactionDate(
  dayStr: string,
  monthStr: string,
  dueYear: number,
  dueMonth: number
): string {
  const day = parseInt(dayStr, 10);
  const mNorm = monthStr.toLowerCase().slice(0, 3);
  const txMonth = PT_MONTHS[mNorm];
  if (!txMonth || Number.isNaN(day)) {
    throw new Error(`Invalid Nubank date tokens: day=${dayStr}, month=${monthStr}`);
  }

  const monthDiff = dueMonth - txMonth;
  let txYear = dueYear;

  // Cycle crossing year: e.g. due in Jan/Feb (months 1/2), but tx is Nov/Dec (months 11/12)
  if (monthDiff < -2) {
    txYear = dueYear - 1;
  } else if (monthDiff > 10) {
    txYear = dueYear + 1;
  }

  const mm = String(txMonth).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${txYear}-${mm}-${dd}`;
}

/**
 * Extracts canonical installment tokens from description text.
 */
export function extractNubankInstallments(text: string): {
  isInstallment: boolean;
  installmentCurrent: number | null;
  installmentTotal: number | null;
  installmentKey: string | null;
} {
  const match =
    text.match(/(?:parcela\s*)?(\d{1,2})\/(\d{1,2})/i) ||
    text.match(/parcela\s+(\d{1,2})\s+de\s+(\d{1,2})/i) ||
    text.match(/\b(\d{1,2})\s+de\s+(\d{1,2})\b/i);

  const installmentCurrent = match ? Number(match[1]) : null;
  const installmentTotal = match ? Number(match[2]) : null;

  const installmentKey =
    installmentCurrent && installmentTotal
      ? (
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\bnupay\b/gi, '')
            .replace(/\bparcela\b/gi, '')
            .replace(/\d{1,2}\s+de\s+\d{1,2}/gi, '')
            .replace(/\d{1,2}\/\d{1,2}/g, '')
            .replace(/[^a-z0-9*]+/g, ' ')
            .trim() +
          ' ' +
          installmentTotal
        ).trim()
      : null;

  return {
    isInstallment: installmentCurrent !== null,
    installmentCurrent,
    installmentTotal,
    installmentKey,
  };
}

/**
 * Amount Selection Contract:
 * 1. Identifies and strips informational exchange-rate conversion clauses
 *    (e.g. "Conversão: USD 1 = R$ 5,35" or "Conversão: EUR 5.29 = USD 1 = R$ 5,29").
 * 2. Verifies that exactly ONE posted BRL monetary value remains.
 * 3. Rejects line with AMBIGUOUS_TRANSACTION_AMOUNT if more than one candidate exists.
 * 4. Extracts posted BRL amount at the end of the entry.
 */
export function extractNubankTransactionAmount(rawContent: string): {
  amount: number;
  isNegative: boolean;
  description: string;
} {
  // Strip informational foreign exchange conversion clause
  const conversionPattern = /Conversão:\s*(?:[A-Z]{3}\s*[\d.]+\s*=\s*)*(?:R\$\s*[\d.,]+)/gi;
  const stripped = rawContent.replace(conversionPattern, '');

  // Count candidate BRL amounts in stripped text
  const brlCandidates = stripped.match(/[−-]\s*R\$\s*[\d.]+[,]\d{2}|R\$\s*[\d.]+[,]\d{2}/g) || [];

  if (brlCandidates.length === 0) {
    throw new Error('MALFORMED_TRANSACTION_LINE: No BRL amount found');
  }

  if (brlCandidates.length > 1) {
    throw new Error('AMBIGUOUS_TRANSACTION_AMOUNT: Multiple BRL amounts present');
  }

  // Posted BRL amount MUST be anchored at the end of the transaction entry
  const amountMatch = rawContent.match(/([−-]?)\s*R\$\s*([\d.]+[,]\d{2})\s*$/);
  if (!amountMatch) {
    throw new Error('MALFORMED_TRANSACTION_LINE: Posted BRL amount not found at line end');
  }

  const isNegative = Boolean(amountMatch[1]);
  const numStr = amountMatch[2].replace(/\./g, '').replace(',', '.');
  const amount = parseFloat(numStr);

  if (Number.isNaN(amount)) {
    throw new Error('MALFORMED_TRANSACTION_LINE: Invalid numeric amount');
  }

  // Description is everything preceding the posted amount
  let description = rawContent.slice(0, amountMatch.index).trim();

  // Strip masked card identifier prefix e.g. "•••• 4557 "
  description = description.replace(/^••••\s*\d{4}\s*/, '');

  return {
    amount,
    isNegative,
    description,
  };
}

/**
 * Parses header metadata from text: total, due date, billing period.
 */
export function extractNubankInvoiceHeader(rawText: string): {
  invoiceTotal: number;
  dueDay: number;
  dueMonth: number;
  dueYear: number;
  dueDateISO: string;
  billingPeriod?: string;
  cardholderName?: string;
} {
  // Extract Invoice Total
  // Pattern 1: "Esta é a sua fatura de [mês], no valor de R$ 12.773,07"
  // Pattern 2: "Total a pagar R$ 12.773,07"
  let invoiceTotal: number | null = null;

  const totalMatch1 = rawText.match(/(?:fatura\s+de\s+[a-z]+,\s*no\s+valor\s+de|Total\s+a\s+pagar)\s+R\$\s*([\d.]+[,]\d{2})/i);
  if (totalMatch1) {
    invoiceTotal = parseFloat(totalMatch1[1].replace(/\./g, '').replace(',', '.'));
  } else {
    // Fallback: look for "Total a pagar R$ ..."
    const totalMatch2 = rawText.match(/Total\s+a\s+pagar\s+R\$\s*([\d.]+[,]\d{2})/i);
    if (totalMatch2) {
      invoiceTotal = parseFloat(totalMatch2[1].replace(/\./g, '').replace(',', '.'));
    }
  }

  if (invoiceTotal === null || Number.isNaN(invoiceTotal)) {
    throw new Error('TOTAL_NOT_FOUND: Invoice total could not be determined');
  }

  // Extract Due Date
  // Pattern: "Data de vencimento: 03 AGO 2026" or "FATURA 03 AGO 2026"
  const dueMatch =
    rawText.match(/Data\s+de\s+vencimento:\s*(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/i) ||
    rawText.match(/FATURA\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/i);

  if (!dueMatch) {
    throw new Error('DUE_DATE_NOT_FOUND: Invoice due date could not be determined');
  }

  const dueDay = parseInt(dueMatch[1], 10);
  const mNorm = dueMatch[2].toLowerCase().slice(0, 3);
  const dueMonth = PT_MONTHS[mNorm];
  const dueYear = parseInt(dueMatch[3], 10);

  if (!dueMonth || Number.isNaN(dueDay) || Number.isNaN(dueYear)) {
    throw new Error('DUE_DATE_NOT_FOUND: Invalid due date tokens');
  }

  const dueDateISO = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

  // Billing period: "Período vigente: 26 JUN a 27 JUL" or "TRANSAÇÕES DE 26 JUN A 27 JUL"
  const periodMatch =
    rawText.match(/Período\s+vigente:\s*(\d{1,2}\s+[A-Za-z]{3}\s+a\s+\d{1,2}\s+[A-Za-z]{3})/i) ||
    rawText.match(/TRANSAÇÕES\s+DE\s+(\d{1,2}\s+[A-Za-z]{3}\s+A\s+\d{1,2}\s+[A-Za-z]{3})/i);

  const billingPeriod = periodMatch ? periodMatch[1] : undefined;

  // Cardholder name (if present on header)
  const nameMatch = rawText.match(/Olá,\s*([A-Za-zÀ-ÿ\s]+)\./i);
  const cardholderName = nameMatch ? nameMatch[1].trim() : undefined;

  return {
    invoiceTotal,
    dueDay,
    dueMonth,
    dueYear,
    dueDateISO,
    billingPeriod,
    cardholderName,
  };
}

/**
 * Main Deterministic Nubank Invoice PDF Parser (SUPPORTED_NUBANK_LAYOUT_V1).
 */
/**
 * Layout guard to verify that the raw invoice text structurally conforms
 * to the SUPPORTED_NUBANK_LAYOUT_V1 specification.
 */
export function isSupportedNubankInvoiceLayout(rawText: string): boolean {
  if (!rawText || typeof rawText !== 'string') return false;
  // Must have Nubank brand indicator
  const hasNu = /nu\s*pagamentos|nubank/i.test(rawText);
  // Must have V1 invoice header anchor (fatura de ... no valor de R$ or Total a pagar R$)
  const hasTotalAnchor = /(?:fatura\s+de\s+[a-z]+,\s*no\s+valor\s+de|Total\s+a\s+pagar)\s+R\$\s*[\d.]+,\d{2}/i.test(rawText);
  // Must have V1 due date anchor
  const hasDueDateAnchor = /(?:Data\s+de\s+vencimento:|FATURA)\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/i.test(rawText);
  // Must have V1 transactions section anchor
  const hasTxSectionAnchor = /TRANSAÇÕES\s+DE\s+\d{1,2}\s+[A-Za-z]{3}\s+A\s+\d{1,2}\s+[A-Za-z]{3}/i.test(rawText);

  return hasNu && hasTotalAnchor && hasDueDateAnchor && hasTxSectionAnchor;
}

/**
 * Strips repeated Nubank invoice page-boundary header structures that occur
 * between transactions across page breaks.
 *
 * Scope: SUPPORTED_NUBANK_LAYOUT_V1
 * Applies strictly coupled compound anchors requiring FATURA [date] EMISSÃO E ENVIO [date]
 * and TRANSAÇÕES DE [period], with optional preceding page footer 'N de M'.
 * Prevents false positives against ordinary transaction descriptions (e.g. 'Parcela 5 de 9').
 * Does not depend on synthetic '\d+:' page prefixes.
 */
export function stripNubankPageBoundaryHeaders(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Structurally anchored compound page-boundary header:
  // - Preceding page footer "N de M" strictly coupled to repeated header (or bounded line break / synthetic prefix)
  // - Optional synthetic legacy prefix: e.g. "6:"
  // - Bounded horizontal cardholder token: letters and horizontal spaces only (max 80 chars, cannot cross newlines)
  // - Strong compound invoice header markers:
  //   FATURA [date] EMISSÃO E ENVIO [date] TRANSAÇÕES DE [period]
  const pageBoundaryRegex =
    /(?:(?:\b\d+\s+de\s+\d+\b[ \t]*(?:\r?\n)?)|(?:\d+:[ \t]*)|[\r\n]+)[ \t]*(?:\d+:[ \t]*)?(?:[A-Za-zÀ-ÿ \t]{1,80}(?:[\r\n]|[ \t])+)?\bFATURA[ \t]+\d{1,2}[ \t]+[A-Za-z]{3}[ \t]+\d{4}[ \t]+EMISSÃO[ \t]+E[ \t]+ENVIO[ 	]+\d{1,2}[ \t]+[A-Za-z]{3}[ \t]+\d{4}[ \t]+TRANSAÇÕES[ \t]+DE[ \t]+\d{1,2}[ \t]+[A-Za-z]{3}[ \t]+A[ \t]+\d{1,2}[ \t]+[A-Za-z]{3}[ \t]*/gi;

  return text.replace(pageBoundaryRegex, ' ');
}

export async function parseNubankInvoicePDF(
  rawText: string,
  _userId?: string
): Promise<NubankInvoiceParseResult> {
  if (!rawText || typeof rawText !== 'string') {
    return {
      success: false,
      code: 'LAYOUT_UNRECOGNIZED',
      error: 'Empty or invalid PDF text input',
    };
  }

  // Explicit layout validation: enforce SUPPORTED_NUBANK_LAYOUT_V1 structure
  if (!isSupportedNubankInvoiceLayout(rawText)) {
    return {
      success: false,
      code: 'LAYOUT_UNRECOGNIZED',
      error: 'Document does not conform to SUPPORTED_NUBANK_LAYOUT_V1 structure',
    };
  }

  // 1. Extract Invoice Header Metadata
  let headerMeta: ReturnType<typeof extractNubankInvoiceHeader>;
  try {
    headerMeta = extractNubankInvoiceHeader(rawText);
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.startsWith('TOTAL_NOT_FOUND')) {
      return { success: false, code: 'TOTAL_NOT_FOUND', error: msg };
    }
    if (msg.startsWith('DUE_DATE_NOT_FOUND')) {
      return { success: false, code: 'DUE_DATE_NOT_FOUND', error: msg };
    }
    return { success: false, code: 'LAYOUT_UNRECOGNIZED', error: msg || 'Header extraction failed' };
  }

  const { invoiceTotal, dueYear, dueMonth, dueDateISO, billingPeriod, cardholderName } = headerMeta;

  // 2. Identify Transaction Boundaries
  // Transaction section begins at "TRANSAÇÕES DE DD MMM A DD MMM"
  const txStartMatch = rawText.match(/TRANSAÇÕES\s+DE\s+\d{1,2}\s+[A-Za-z]{3}\s+A\s+\d{1,2}\s+[A-Za-z]{3}/i);
  if (!txStartMatch) {
    return {
      success: false,
      code: 'NO_TRANSACTIONS_FOUND',
      error: 'Transaction section marker not found in invoice text',
    };
  }

  // Slice from first transaction section marker
  let txSectionText = rawText.slice((txStartMatch.index ?? 0) + txStartMatch[0].length);

  // Strip page-boundary repeated headers and page footers
  txSectionText = stripNubankPageBoundaryHeaders(txSectionText);

  // Strip legal disclaimer at the end of transaction list
  const legalIdx = txSectionText.search(/Em cumprimento à regulação|Como assegurado pela Resolução/i);
  if (legalIdx !== -1) {
    txSectionText = txSectionText.slice(0, legalIdx);
  }

  // Strip cardholder subtotal header on first transaction page e.g. "Cliente Teste R$ 12.773,07 "
  txSectionText = txSectionText.replace(/^\s*[A-Za-zÀ-ÿ\s]+R\$\s*[\d.,]+\s*(?=\d{2}\s+[A-Z]{3})/i, '');

  // Strip category header "Pagamentos -R$ 6.749,58"
  txSectionText = txSectionText.replace(/\bPagamentos\s+[−-]?R\$\s*[\d.,]+/gi, '');

  // 3. Segment into individual transaction entries
  // Transaction entries start with DD MMM not preceded by "Pagamento em "
  const txStartRegex = /(?<!Pagamento\s+em\s+)\b(\d{2}\s+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ))\b/gi;

  const dateMatches: { dateStr: string; index: number }[] = [];
  let m;
  while ((m = txStartRegex.exec(txSectionText)) !== null) {
    dateMatches.push({ dateStr: m[1], index: m.index });
  }

  if (dateMatches.length === 0) {
    return {
      success: false,
      code: 'NO_TRANSACTIONS_FOUND',
      error: 'Zero transaction records identified in transaction section',
    };
  }

  const transactions: ParsedTransaction[] = [];
  let grossExpenses = 0;
  let refundTotal = 0;
  let ignoredPayments = 0;
  const occurrenceCounter = new Map<string, number>();

  for (let i = 0; i < dateMatches.length; i++) {
    const start = dateMatches[i].index;
    const end = i + 1 < dateMatches.length ? dateMatches[i + 1].index : txSectionText.length;
    const slice = txSectionText.slice(start, end).trim();
    const rawContent = slice.slice(dateMatches[i].dateStr.length).trim();

    const dateTokens = dateMatches[i].dateStr.split(/\s+/);
    let dateISO: string;
    try {
      dateISO = resolveNubankTransactionDate(dateTokens[0], dateTokens[1], dueYear, dueMonth);
    } catch (err: any) {
      return {
        success: false,
        code: 'MALFORMED_TRANSACTION_LINE',
        error: `Invalid date format on transaction: ${dateMatches[i].dateStr}`,
      };
    }

    // Extract amount and description
    let amountInfo: ReturnType<typeof extractNubankTransactionAmount>;
    try {
      amountInfo = extractNubankTransactionAmount(rawContent);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.startsWith('AMBIGUOUS_TRANSACTION_AMOUNT')) {
        return {
          success: false,
          code: 'AMBIGUOUS_TRANSACTION_AMOUNT',
          error: `Ambiguous transaction amount on ${dateMatches[i].dateStr}: "${rawContent}"`,
        };
      }
      return {
        success: false,
        code: 'MALFORMED_TRANSACTION_LINE',
        error: `Malformed transaction line on ${dateMatches[i].dateStr}: "${rawContent}"`,
      };
    }

    const { amount, isNegative, description } = amountInfo;

    // Extract installment metadata
    const installments = extractNubankInstallments(description);

    // Business semantics (R3.2 Canonical Integration)
    const isPayment = isInvoicePaymentDescription(description);
    const isRefund = !isPayment && (isCreditCardRefundDescription(description) || isNegative);

    // Merchant extraction
    const merchant = description.split(/\s*-\s*Parcela|\s+USD|\s+EUR/i)[0].trim();

    const occurrenceKey = [
      dateISO,
      Math.abs(amount).toFixed(2),
      normalizeHashText(description),
      normalizeHashText(merchant),
      isPayment ? 'PAYMENT' : (isRefund ? 'REFUND' : 'EXPENSE'),
    ].join('|');
    const sourceOccurrenceIndex = occurrenceCounter.get(occurrenceKey) || 0;
    occurrenceCounter.set(occurrenceKey, sourceOccurrenceIndex + 1);

    if (isPayment) {
      // Prior invoice payment: ignored=true, does not count towards invoice purchases/refunds
      ignoredPayments = Number((ignoredPayments + amount).toFixed(2));
      transactions.push({
        date: dateISO,
        description,
        merchant,
        category: 'Pagamento de Fatura',
        amount: Math.abs(amount),
        type: 'expense',
        ignored: true,
        sourceOccurrenceIndex,
        isInstallment: installments.isInstallment ? true : undefined,
        installmentCurrent: installments.installmentCurrent ?? undefined,
        installmentTotal: installments.installmentTotal ?? undefined,
        installmentKey: installments.installmentKey ?? undefined,
      } as any);
    } else if (isRefund) {
      // Canonical refund: type='expense', isRefund=true, positive absolute amount
      refundTotal = Number((refundTotal + amount).toFixed(2));
      transactions.push({
        date: dateISO,
        description,
        merchant,
        category: 'Estorno / Reembolso',
        amount: Math.abs(amount),
        type: 'expense',
        isRefund: true,
        sourceOccurrenceIndex,
        isInstallment: installments.isInstallment ? true : undefined,
        installmentCurrent: installments.installmentCurrent ?? undefined,
        installmentTotal: installments.installmentTotal ?? undefined,
        installmentKey: installments.installmentKey ?? undefined,
      } as any);
    } else {
      // Normal purchase: type='expense', amount>0
      grossExpenses = Number((grossExpenses + amount).toFixed(2));
      transactions.push({
        date: dateISO,
        description,
        merchant,
        category: 'Cartão de Crédito',
        amount: Math.abs(amount),
        type: 'expense',
        isRefund: false,
        sourceOccurrenceIndex,
        isInstallment: installments.isInstallment ? true : undefined,
        installmentCurrent: installments.installmentCurrent ?? undefined,
        installmentTotal: installments.installmentTotal ?? undefined,
        installmentKey: installments.installmentKey ?? undefined,
      } as any);
    }
  }

  // 4. Reconciliation Hard Gate
  const netParsedTotal = Number((grossExpenses - refundTotal).toFixed(2));
  const difference = Number((netParsedTotal - invoiceTotal).toFixed(2));
  const reconciled = Math.abs(difference) < 0.01;

  const metadata: NubankInvoiceParseMetadata = {
    invoiceTotal,
    grossExpenses,
    refundTotal,
    ignoredPayments,
    netParsedTotal,
    difference,
    reconciled,
    layoutVersion: NUBANK_LAYOUT_VERSION,
    dueDate: dueDateISO,
    billingPeriod,
    cardholderName,
  };

  if (!reconciled) {
    return {
      success: false,
      code: 'RECONCILIATION_MISMATCH',
      error: `Reconciliation hard gate failed: netParsedTotal (${netParsedTotal}) !== invoiceTotal (${invoiceTotal}), diff=${difference}`,
      metadata,
    };
  }

  return {
    success: true,
    layoutVersion: NUBANK_LAYOUT_VERSION,
    transactions,
    metadata,
  };
}
