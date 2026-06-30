import { buildForecast } from '@/core/finance/forecast-engine';
import {
  buildMerchantFingerprint,
  detectRecurrence,
} from '@/core/finance/recurrence-engine';
import { type FreedomIndexResult, type FreedomTimeline } from './freedom-engine';
import { type PFWealthReport } from './wealth-engine';
import { type PFDRE } from './dre-engine';

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
  accounts?: any[];
  investments?: any[];
  kernelOutputs?: {
    freedomIndex: FreedomIndexResult;
    freedomTimeline: FreedomTimeline;
    wealthReport: PFWealthReport;
    forecastOutput: any[];
    dreReport: PFDRE;
    projections: Record<string, number>;
  };
}) : FinancialAIResult {

  const transactions = params.transactions || [];
  const liabilities = params.liabilities || [];
  const recurringExpenses = params.recurringExpenses || [];
  const taxObligations = params.taxObligations || [];
  const accounts = params.accounts || [];
  const investments = params.investments || [];
  const kernelOutputs = params.kernelOutputs;

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

  if (kernelOutputs) {
    healthScore = Math.round(kernelOutputs.freedomIndex.freedomIndex);
  } else {
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
  }

  const insights: FinancialAIInsight[] = [];

  // --- Proactive Alerts and Opportunities from Kernel Outputs ---
  if (kernelOutputs) {
    const fIndex = kernelOutputs.freedomIndex;
    const fTimeline = kernelOutputs.freedomTimeline;

    // 1. Emergency Reserve vulnerability
    if (fIndex.breakdown.emergencyReservePercent < 50) {
      insights.push({
        type: 'alert',
        title: 'Alerta: Reserva de Segurança Baixa',
        description: `Sua reserva de emergência cobre apenas ${(fIndex.breakdown.emergencyReservePercent * 6 / 100).toFixed(1)} dos 6 meses recomendados. Considere segurar novos gastos.`,
        confidence: 0.95,
      });
    }

    // 2. High debt warning
    if (fIndex.breakdown.incomeFreedomPercent < 70) {
      insights.push({
        type: 'alert',
        title: 'Alerta: Comprometimento de Caixa Elevado',
        description: `As parcelas de empréstimos/cartão comprometem mais de 30% da sua receita. Evite contrair novos passivos parcelados.`,
        confidence: 0.92,
      });
    }

    // 3. Early debt payoff opportunity
    const totalCash = accounts.filter((a: any) => a.owner === 'PF').reduce((sum, a) => sum + (a.balance || 0), 0);
    const highestInterestDebt = liabilities.filter(l => Number(l.remainingBalance || 0) > 0)
      .sort((a, b) => (b.installmentValue || 0) - (a.installmentValue || 0))[0];
    if (highestInterestDebt && totalCash > Number(highestInterestDebt.remainingBalance || 0) * 0.5) {
      insights.push({
        type: 'behavior',
        title: 'Oportunidade de Amortização',
        description: `Você tem saldo líquido acumulado em conta para quitar/amortizar 50%+ da dívida "${highestInterestDebt.name}" de imediato e economizar juros reais.`,
        confidence: 0.90,
      });
    }

    // 4. Reserve Timeline projection
    if (fTimeline.monthsToReserve > 0 && fTimeline.monthsToReserve < 60) {
      insights.push({
        type: 'forecast',
        title: 'Previsão de Reserva Completa',
        description: `Mantendo a taxa média de superávit de R$ ${fTimeline.targetNetWorth / 12 * 0.15}, você completará sua reserva em ${fTimeline.monthsToReserve} meses.`,
        confidence: 0.88,
      });
    }

    // 5. High Cash Drag (Dinheiro parado sem render)
    const totalInvestments = investments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
    if (totalCash > 5000 && totalCash > totalInvestments) {
      insights.push({
        type: 'behavior',
        title: 'Alerta de Caixa Ocioso (Cash Drag)',
        description: `Seu saldo em conta corrente (R$ ${totalCash.toLocaleString('pt-BR')}) é maior que sua carteira de investimentos. Seu dinheiro está perdendo poder de compra para a inflação.`,
        confidence: 0.89,
      });
    }

    // 6. Portfolio Diversification warning
    if (fIndex.breakdown.diversificationNormalized < 30) {
      insights.push({
        type: 'alert',
        title: 'Alerta: Baixa Diversificação de Ativos',
        description: `Sua pontuação de diversificação de investimentos está em ${fIndex.breakdown.diversificationNormalized}%. Recomendamos expandir a alocação em classes descorrelacionadas (ex: Ações Internacionais, FIIs).`,
        confidence: 0.91,
      });
    }

    // 7. Accrued Deficit warning
    if (kernelOutputs.dreReport && kernelOutputs.dreReport.saldoRestante < 0) {
      insights.push({
        type: 'alert',
        title: 'Alerta: Balanço Mensal Negativo',
        description: `Suas despesas mensais operacionais ultrapassaram suas receitas registradas neste mês. Revise o orçamento doméstico com urgência.`,
        confidence: 0.96,
      });
    }
  }

  // Fallback / legacy insights
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
