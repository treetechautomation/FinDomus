import { buildForecast } from '@/core/finance/forecast-engine';
import {
  buildMerchantFingerprint,
  detectRecurrence,
} from '@/core/finance/recurrence-engine';

export type FinancialAIInsight = {
  type:
    | 'recurrence'
    | 'subscription'
    | 'forecast'
    | 'alert'
    | 'behavior';

  title: string;
  description: string;
  confidence?: number;
};

export type FinancialAIResult = {
  recurringDetected: number;
  subscriptions: number;
  projectedNextMonth: number;
  financialHealthScore: number;
  insights: FinancialAIInsight[];
};

function normalizeText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getFinancialAIInsights(params: {
  transactions?: any[];
  liabilities?: any[];
  recurringExpenses?: any[];
  taxObligations?: any[];
}) : FinancialAIResult {

  const transactions = params.transactions || [];
  const liabilities = params.liabilities || [];
  const recurringExpenses = params.recurringExpenses || [];
  const taxObligations = params.taxObligations || [];

  const merchantGroups = new Map<string, any[]>();

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;

    const fingerprint = buildMerchantFingerprint(
      tx.description || tx.merchant || '',
      tx.category
    );

    if (!merchantGroups.has(fingerprint)) {
      merchantGroups.set(fingerprint, []);
    }

    merchantGroups.get(fingerprint)?.push(tx);
  }

  const recurringResults = [];

  for (const [, items] of merchantGroups.entries()) {
    const analysis = detectRecurrence(items);

    if (analysis.isRecurring) {
      recurringResults.push({
        ...analysis,
        sample: items[0],
      });
    }
  }

  const subscriptions = recurringResults.filter((r) => {
    const text = normalizeText(
      r.sample?.description || ''
    );

    return [
      'netflix',
      'spotify',
      'google',
      'openai',
      'canva',
      'amazon',
      'youtube',
      'icloud',
      'dropbox',
      'microsoft',
    ].some((s) => text.includes(s));
  });

  const forecast = buildForecast({
    transactions,
    liabilities,
    recurringExpenses,
    taxObligations,
    months: 2,
  });

  const nextMonth = forecast[1];

  const projectedBalance = Number(
    nextMonth?.projectedBalance || 0
  );

  const liabilitiesTotal = liabilities.reduce(
    (s, l) => s + Number(l.remainingBalance || 0),
    0
  );

  const recurringMonthly = recurringResults.reduce(
    (s, r) => s + Math.abs(Number(r.sample?.amount || 0)),
    0
  );

  let healthScore = 100;

  if (liabilitiesTotal > 50000) {
    healthScore -= 25;
  }

  if (projectedBalance < 0) {
    healthScore -= 35;
  }

  if (recurringMonthly > 15000) {
    healthScore -= 15;
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  const insights: FinancialAIInsight[] = [];

  if (recurringResults.length) {
    insights.push({
      type: 'recurrence',
      title: 'Despesas recorrentes detectadas',
      description:
        `${recurringResults.length} recorrências foram identificadas automaticamente.`,
      confidence: 0.94,
    });
  }

  if (subscriptions.length) {
    insights.push({
      type: 'subscription',
      title: 'Assinaturas detectadas',
      description:
        `${subscriptions.length} assinaturas recorrentes foram identificadas.`,
      confidence: 0.91,
    });
  }

  if (projectedBalance > 0) {
    insights.push({
      type: 'forecast',
      title: 'Fluxo futuro positivo',
      description:
        `A projeção do próximo mês indica saldo positivo de R$ ${projectedBalance.toLocaleString('pt-BR')}.`,
      confidence: 0.88,
    });
  }

  if (liabilitiesTotal > 0) {
    insights.push({
      type: 'behavior',
      title: 'Passivos monitorados',
      description:
        `O sistema está acompanhando R$ ${liabilitiesTotal.toLocaleString('pt-BR')} em obrigações futuras.`,
      confidence: 0.93,
    });
  }

  return {
    recurringDetected: recurringResults.length,
    subscriptions: subscriptions.length,
    projectedNextMonth: projectedBalance,
    financialHealthScore: healthScore,
    insights,
  };
}
