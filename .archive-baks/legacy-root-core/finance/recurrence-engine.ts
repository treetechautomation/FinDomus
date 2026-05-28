export type RecurrenceFrequency =
  | 'weekly'
  | 'monthly'
  | 'yearly';

export type RecurrenceAnalysis = {
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceConfidence: number;
  merchantFingerprint?: string;
  aiBehaviorTag?: string;
};

function normalizeText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeMerchant(value: string) {
  return normalizeText(value);
}

export function buildMerchantFingerprint(
  merchant: string,
  category?: string
) {
  const normalizedMerchant = normalizeMerchant(merchant);
  const normalizedCategory = normalizeText(category || 'geral');

  return `${normalizedCategory}:${normalizedMerchant}`
    .replace(/\s+/g, '_');
}

export function inferFrequency(daysAverage: number): RecurrenceFrequency {
  if (daysAverage <= 10) return 'weekly';
  if (daysAverage <= 45) return 'monthly';
  return 'yearly';
}

export function calculateConfidence(params: {
  occurrences: number;
  averageVariation: number;
  daysVariation: number;
}) {
  let score = 0;

  score += Math.min(params.occurrences / 6, 1) * 0.4;

  score += Math.max(0, 1 - params.averageVariation) * 0.4;

  score += Math.max(0, 1 - params.daysVariation) * 0.2;

  return Number(Math.min(score, 1).toFixed(2));
}

export function detectRecurrence(transactions: any[]): RecurrenceAnalysis {
  if (!transactions.length) {
    return {
      isRecurring: false,
      recurrenceConfidence: 0,
    };
  }

  const sorted = [...transactions]
    .filter((t) => t.dateISO || t.date)
    .sort((a, b) => {
      const da = new Date(a.dateISO || a.date).getTime();
      const db = new Date(b.dateISO || b.date).getTime();

      return da - db;
    });

  if (sorted.length < 3) {
    return {
      isRecurring: false,
      recurrenceConfidence: 0.2,
    };
  }

  const amounts = sorted.map((t) =>
    Math.abs(Number(t.amount || 0))
  );

  const avg =
    amounts.reduce((s, n) => s + n, 0) / amounts.length;

  const avgVariation =
    amounts.reduce(
      (s, n) => s + Math.abs(n - avg) / Math.max(avg, 1),
      0
    ) / amounts.length;

  const intervals: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(
      sorted[i - 1].dateISO || sorted[i - 1].date
    );

    const curr = new Date(
      sorted[i].dateISO || sorted[i].date
    );

    const diff =
      (curr.getTime() - prev.getTime()) /
      (1000 * 60 * 60 * 24);

    intervals.push(diff);
  }

  const avgDays =
    intervals.reduce((s, n) => s + n, 0) /
    intervals.length;

  const daysVariation =
    intervals.reduce(
      (s, n) => s + Math.abs(n - avgDays) / Math.max(avgDays, 1),
      0
    ) / intervals.length;

  const confidence = calculateConfidence({
    occurrences: sorted.length,
    averageVariation: avgVariation,
    daysVariation,
  });

  const sample = sorted[0];

  return {
    isRecurring: confidence >= 0.65,
    recurrenceFrequency: inferFrequency(avgDays),
    recurrenceConfidence: confidence,
    merchantFingerprint: buildMerchantFingerprint(
      sample.description || sample.merchant || '',
      sample.category
    ),
    aiBehaviorTag: normalizeText(
      sample.category || 'geral'
    ).replace(/\s+/g, '_'),
  };
}
