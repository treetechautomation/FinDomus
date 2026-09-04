/**
 * PDF Document Detector
 *
 * Deterministically classifies PDF extracted text into document kind
 * and issuer. Uses multi-marker structural scoring to prevent false positives.
 */

export type PDFDocumentKind =
  | 'bank_statement'
  | 'credit_card_invoice'
  | 'unknown';

export type CreditCardInvoiceIssuer =
  | 'nubank'
  | 'unknown';

function normalizeText(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Detects whether the extracted PDF text represents a credit card invoice,
 * a bank checking/savings account statement, or unknown.
 */
export function detectPDFDocumentKind(text: string): PDFDocumentKind {
  if (!text || typeof text !== 'string') return 'unknown';

  const norm = normalizeText(text);

  // Credit card invoice structural markers
  const invoiceMarkers = [
    'fatura',
    'vencimento',
    'pagamento minimo',
    'pagamento total',
    'limite total',
    'limite disponivel',
    'total a pagar',
    'resumo da fatura',
    'alternativas de pagamento',
    'compras de todos os cartoes',
    'transacoes de',
  ];

  let cardScore = 0;
  for (const marker of invoiceMarkers) {
    if (norm.includes(marker)) cardScore++;
  }

  // Bank statement structural markers
  const bankMarkers = [
    'extrato',
    'extrato de conta',
    'conta corrente',
    'saldo anterior',
    'saldo do dia',
    'saldo em conta',
    'saldo bloqueado',
    'saldo provisorio',
    'lancamentos da conta',
  ];

  let bankScore = 0;
  for (const marker of bankMarkers) {
    if (norm.includes(marker)) bankScore++;
  }

  // Checking regex for bank statement transaction line e.g. "DD/MM/YYYY ... ( + ) / ( - )"
  const hasBankStatementTxPattern = /\b\d{2}\/\d{2}\/\d{4}\b.*\([+-]\)/.test(text);
  if (hasBankStatementTxPattern) {
    bankScore += 2;
  }

  const hasInvoiceWord = norm.includes('fatura');

  // Decision logic:
  // An invoice MUST have 'fatura' and multiple supporting card markers
  if (hasInvoiceWord && cardScore >= 3 && cardScore > bankScore) {
    return 'credit_card_invoice';
  }

  if (bankScore >= 2 && !hasInvoiceWord) {
    return 'bank_statement';
  }

  if (hasInvoiceWord && cardScore >= 2 && bankScore === 0) {
    return 'credit_card_invoice';
  }

  if (hasBankStatementTxPattern) {
    return 'bank_statement';
  }

  return 'unknown';
}

/**
 * Detects the specific credit card invoice issuer.
 * Requires multiple distinct structural markers from the issuer.
 * Mere occurrence of the bank/issuer name in a transaction memo is strictly rejected.
 */
export function detectCreditCardInvoiceIssuer(text: string): CreditCardInvoiceIssuer {
  if (!text || typeof text !== 'string') return 'unknown';

  const kind = detectPDFDocumentKind(text);
  if (kind !== 'credit_card_invoice') {
    return 'unknown';
  }

  const norm = normalizeText(text);

  // Group 1: Nubank legal entity / corporate CNPJ
  const hasCorporate =
    norm.includes('nu pagamentos s.a.') ||
    norm.includes('nu pagamentos') ||
    norm.includes('18.236.120/0001-58');

  // Group 2: Nubank-specific invoice phrasing
  const hasPhrasing =
    norm.includes('esta e a sua fatura') ||
    norm.includes('resumo da fatura atual') ||
    norm.includes('alternativas de pagamento para a sua fatura') ||
    norm.includes('periodo vigente:') ||
    norm.includes('o nubank declara, nos termos da lei');

  // Group 3: Nubank ecosystem product markers
  const hasEcosystem =
    norm.includes('nutag') ||
    norm.includes('nupay') ||
    norm.includes('aplicativo do nu') ||
    norm.includes('conta nubank');

  // Require at least 2 distinct structural groups
  let groupCount = 0;
  if (hasCorporate) groupCount++;
  if (hasPhrasing) groupCount++;
  if (hasEcosystem) groupCount++;

  if (groupCount >= 2) {
    return 'nubank';
  }

  return 'unknown';
}
