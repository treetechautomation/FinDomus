import { type KernelContext, type KernelResult } from './kernel';
import { addMonths, getCurrentMonthKey } from './financial-period-engine';

export type FreedomPlanGoal = {
  title: string;
  target: string;
  current: string;
  action: string;
  engines: string[];
  href: string;
};

export type FreedomPlanStage = {
  timeframe: string;
  label: string;
  goals: FreedomPlanGoal[];
  completionCriteria: string;
  estimatedCompletion: string;
};

export type FreedomPlan = {
  generatedAt: string;
  currentLevel: string;
  currentIndex: number;
  stages: FreedomPlanStage[];
};

export function generateFreedomPlan(
  context: KernelContext,
  kernelResult: KernelResult
): FreedomPlan {
  const currentMonthKey = getCurrentMonthKey();

  const plan: FreedomPlan = {
    generatedAt: new Date().toISOString(),
    currentLevel: kernelResult.freedom.index.levelLabel,
    currentIndex: kernelResult.freedom.index.freedomIndex,
    stages: [],
  };

  const idleCash = context.accounts
    .filter((a: any) => a.owner === 'PF')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  // Stage 1: Immediate (30 days) - Fundação Financeira
  plan.stages.push({
    timeframe: '30 dias',
    label: 'Fundação Financeira',
    goals: [
      {
        title: 'Mapear todas as dívidas',
        target: '100% das dívidas cadastradas',
        current: `${context.liabilities.length} cadastrada(s)`,
        action: 'Importe faturas e extratos bancários na aba de Importação.',
        engines: ['liability-engine'],
        href: '/importacoes',
      },
      {
        title: 'Baby Emergency Fund (R$ 1.000)',
        target: 'R$ 1.000',
        current: `R$ ${idleCash.toLocaleString('pt-BR')}`,
        action: idleCash >= 1000 ? 'Meta já alcançada!' : 'Aporte semanal de R$ 250 para formar a reserva básica.',
        engines: ['financial-core'],
        href: '/contas',
      },
    ],
    completionCriteria: 'Reserva básica de R$ 1.000 + todas as obrigações passivas cadastradas.',
    estimatedCompletion: addMonths(currentMonthKey, 1),
  });

  // Stage 2: 90 days - Estabilização
  const hasCreditCardDebt = context.liabilities.some((l: any) => l.type === 'Cartão' && Number(l.remainingBalance || 0) > 0);
  plan.stages.push({
    timeframe: '90 dias',
    label: 'Estabilização',
    goals: [
      {
        title: 'Quitar faturas de juros altos',
        target: 'Cartões e cheque especial zerados',
        current: hasCreditCardDebt ? 'Há dívidas de cartão de crédito pendentes' : 'Limpo!',
        action: 'Adote o método Avalanche: pague o mínimo de todas e jogue o saldo extra na de maior juros.',
        engines: ['liability-engine', 'financial-core'],
        href: '/passivos',
      },
      {
        title: 'Cortar desperdícios',
        target: 'Reduzir 10% do custo de vida',
        current: `R$ ${kernelResult.dre.despesasOperacionais.toLocaleString('pt-BR')}`,
        action: 'Verifique no menu de Planejamento as assinaturas e gastos variáveis redundantes.',
        engines: ['recurrence-engine', 'dre-engine'],
        href: '/planejamento',
      },
    ],
    completionCriteria: 'Eliminação completa de dívidas rotativas de consumo.',
    estimatedCompletion: addMonths(currentMonthKey, 3),
  });

  // Stage 3: 6 months - Construção
  plan.stages.push({
    timeframe: '6 meses',
    label: 'Construção',
    goals: [
      {
        title: 'Reserva de Emergência Completa (3 meses)',
        target: `R$ ${(kernelResult.dre.despesasOperacionais * 3).toLocaleString('pt-BR')}`,
        current: `R$ ${idleCash.toLocaleString('pt-BR')}`,
        action: 'Deposite a sobra financeira mensal em ativos de renda fixa de liquidez diária (Ex: Tesouro Selic).',
        engines: ['freedom-engine', 'forecast-engine'],
        href: '/investimentos',
      },
    ],
    completionCriteria: 'Liquidez equivalente a 3 meses de despesas operacionais.',
    estimatedCompletion: addMonths(currentMonthKey, 6),
  });

  // Stage 4: 1 year - Crescimento
  plan.stages.push({
    timeframe: '1 ano',
    label: 'Crescimento',
    goals: [
      {
        title: 'Reserva de Emergência de Segurança (6 meses)',
        target: `R$ ${(kernelResult.dre.despesasOperacionais * 6).toLocaleString('pt-BR')}`,
        current: `R$ ${idleCash.toLocaleString('pt-BR')}`,
        action: 'Solidifique sua segurança líquida antes de migrar aportes para ativos de longo prazo.',
        engines: ['freedom-engine', 'forecast-engine', 'million'],
        href: '/investimentos',
      },
    ],
    completionCriteria: '6 meses de gastos essenciais travados em liquidez diária.',
    estimatedCompletion: addMonths(currentMonthKey, 12),
  });

  // Stage 5: 3 years - Aceleração
  const target3Y = Number((kernelResult.dre.despesasOperacionais * 12 * 3).toFixed(2));
  plan.stages.push({
    timeframe: '3 anos',
    label: 'Aceleração',
    goals: [
      {
        title: 'Carteira de Renda Passiva Ativa',
        target: `R$ ${target3Y.toLocaleString('pt-BR')}`,
        current: `R$ ${kernelResult.financialCore.netWorth.toLocaleString('pt-BR')}`,
        action: 'Diversifique em 5+ classes de investimentos (Ações, FIIs, Renda Fixa) focados em proventos.',
        engines: ['million', 'retirement', 'analytics-engine'],
        href: '/investimentos',
      },
    ],
    completionCriteria: 'Renda passiva cobrindo pelo menos 25% dos gastos correntes.',
    estimatedCompletion: addMonths(currentMonthKey, 36),
  });

  // Stage 6: 10 years - Liberdade Financeira
  const target10Y = Number((kernelResult.dre.despesasOperacionais * 12 * 25).toFixed(2)); // 4% rule (25x annual expenses)
  plan.stages.push({
    timeframe: '10 anos',
    label: 'Liberdade Financeira',
    goals: [
      {
        title: 'Independência Financeira Absoluta',
        target: `R$ ${target10Y.toLocaleString('pt-BR')}`,
        current: `R$ ${kernelResult.financialCore.netWorth.toLocaleString('pt-BR')}`,
        action: 'Atinja o ponto de inflexão onde os rendimentos mensais cobrem 100% do custo de vida.',
        engines: ['million', 'retirement', 'freedom-engine'],
        href: '/investimentos',
      },
    ],
    completionCriteria: 'Renda passiva >= 100% das despesas operacionais.',
    estimatedCompletion: addMonths(currentMonthKey, 120),
  });

  return plan;
}
