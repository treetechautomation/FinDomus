import crypto from 'crypto';

export function normalizeTransferText(
  text: string
) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function buildTransferReconciliationId(
  params: {
    amount: number;
    date?: string;
    description?: string;
  }
) {

  const normalized =
    normalizeTransferText(
      params.description || ''
    )
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const base = [
    Number(params.amount || 0).toFixed(2),
    String(params.date || ''),
    normalized,
  ].join('|');

  return crypto
    .createHash('md5')
    .update(base)
    .digest('hex');
}

export function isTransferTransaction(
  transaction: any
) {
  return (
    transaction?.type === 'transfer'
  );
}
