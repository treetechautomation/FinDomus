import { type PFDRE } from './dre-engine';
import { calculateFinancialCore, calculateEmergencyReserve } from './financial-core';

export const FREEDOM_INDEX_VERSION = 1;

export type FreedomLevel =
  | 'survival'
  | 'organization'
  | 'stability'
  | 'construction'
  | 'growth'
  | 'freedom';

export type FreedomTimelineMilestone = {
  label: string;
  date: string;
  description: string;
  completed: boolean;
  icon: string;
  explainability?: {
    enginesUsed: string[];
    variablesUsed: Record<string, { value: number | string; source: string }>;
    formula: string;
  };
};

export type FreedomTimeline = {
  debtFreedomDate: string;
  reserveDate: string;
  freedomDate: string;
  targetNetWorth: number;
  monthsToDebtFreedom: number;
  monthsToReserve: number;
  monthsToFreedom: number;
  milestones: FreedomTimelineMilestone[];
};

export type ActionPlanItem = {
  title: string;
  description: string;
  impactR$: string;
  impactPts: number;
  impactMonths?: number;
  effort: 'Baixo' | 'Médio' | 'Alto';
  priority: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
  priorityColor: 'rose' | 'amber' | 'blue' | 'zinc';
  cta: string;
  href: string;
};

export type FreedomIndexResult = {
  freedomIndex: number;
  level: FreedomLevel;
  levelLabel: string;
  levelIcon: string;
  trendPoints?: number;
  wealthScore: number;
  breakdown: {
    debtPayoffPercent: number;
    incomeFreedomPercent: number;
    emergencyReservePercent: number;
    netWorthPercent: number;
    investmentRatePercent: number;
    passiveIncomePercent: number;
    diversificationNormalized: number;
  };
};

function formatMonthYearPT(date: Date) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[date.getMonth()]}/${date.getFullYear()}`;
}

function addMonthsToDate(date: Date, months: number) {
  const newDate = new Date(date.getTime());
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function calculateFreedomIndex(params: {
  accounts: any[];
  investments: any[];
  liabilities: any[];
  dre: PFDRE;
  realDividendYield?: number;
  realDiversificationScore?: number;
  previousFreedomIndex?: number;
}): FreedomIndexResult {
  const accounts = params.accounts || [];
  const investments = params.investments || [];
  const liabilities = params.liabilities || [];
  const dre = params.dre || { receitaTotal: 0, despesasOperacionais: 0, taxaAcumulacao: 0 };

  // Centralized calculations of financial core (Net Worth, Active Liabilities, etc.)
  const core = calculateFinancialCore({
    accounts,
    investments,
    liabilities,
  });

  const netWorth = core.netWorth;
  const cashBalance = core.cashBalance;
  const totalInvestments = core.investmentValue;
  const monthlyIncome = dre.receitaTotal || 0;

  // 1. Quitação de Dívidas (25%)
  let totalInstallments = 0;
  let totalPaidInstallments = 0;
  liabilities.forEach((l) => {
    const total = Number(l.totalInstallments || 0);
    const current = Number(l.currentInstallment || 0);
    const val = Number(l.installmentValue || 0);
    totalInstallments += total * val;
    totalPaidInstallments += current * val;
  });
  const debtPayoffPercent =
    totalInstallments > 0
      ? Math.max(0, Math.min(100, (totalPaidInstallments / totalInstallments) * 100))
      : 100;

  // 2. Comprometimento de Renda (20%)
  const monthlyDebtPayment = core.monthlyDebtPayment;
  let incomeFreedomPercent = 100;
  if (monthlyIncome > 0) {
    const ratio = monthlyDebtPayment / monthlyIncome;
    incomeFreedomPercent = Math.max(0, Math.min(100, (1 - ratio) * 100));
  } else if (monthlyDebtPayment > 0) {
    incomeFreedomPercent = 0;
  }

  // 3. Reserva de Emergência (15%)
  const despesasMensais = dre.despesasOperacionais > 0 ? dre.despesasOperacionais : 3000;
  const reserve = calculateEmergencyReserve({
    accounts,
    investments,
    essentialMonthlyExpenses: (dre.essenciais || 0) + (dre.saude || 0) + (dre.educacao || 0),
    targetMonths: 6,
  });
  const emergencyReservePercent = reserve.reservePercent;

  // 4. Patrimônio Líquido (15%)
  const targetNetWorth = Math.max(30000, (monthlyIncome > 0 ? monthlyIncome : 3000) * 12);
  const netWorthPercent =
    netWorth > 0
      ? Math.max(0, Math.min(100, (netWorth / targetNetWorth) * 100))
      : 0;

  // 5. Taxa de Poupança (10%)
  const taxaAcumulacao = dre.taxaAcumulacao ?? 0;
  const investmentRatePercent = Math.max(0, Math.min(100, (taxaAcumulacao / 30) * 100));

  // 6. Renda Passiva (10%)
  const monthlyYield = params.realDividendYield !== undefined
    ? (params.realDividendYield / 100) / 12
    : 0.006;
  const monthlyPassiveIncome = totalInvestments * monthlyYield;
  const passiveIncomePercent = Math.max(
    0,
    Math.min(100, (monthlyPassiveIncome / despesasMensais) * 100)
  );

  // 7. Diversificação (5%)
  const diversificationNormalized = params.realDiversificationScore !== undefined
    ? params.realDiversificationScore
    : (investments.length >= 5 ? 100 : investments.length >= 3 ? 70 : investments.length > 0 ? 40 : 0);

  // Cálculo Geral Ponderado com proteção para usuário novo
  const hasNoData = accounts.length === 0 && investments.length === 0 && liabilities.length === 0 && dre.receitaTotal === 0;
  
  const freedomIndex = hasNoData ? 0 : Math.round(
    debtPayoffPercent * 0.25 +
      incomeFreedomPercent * 0.20 +
      emergencyReservePercent * 0.15 +
      netWorthPercent * 0.15 +
      investmentRatePercent * 0.10 +
      passiveIncomePercent * 0.10 +
      diversificationNormalized * 0.05
  );

  let level: FreedomLevel = 'survival';
  let levelLabel = 'Sobrevivência';
  let levelIcon = '🌱';

  if (freedomIndex >= 95) {
    level = 'freedom';
    levelLabel = 'Liberdade';
    levelIcon = '🏡';
  } else if (freedomIndex >= 80) {
    level = 'growth';
    levelLabel = 'Crescimento';
    levelIcon = '🌲';
  } else if (freedomIndex >= 60) {
    level = 'construction';
    levelLabel = 'Construção';
    levelIcon = '🌳';
  } else if (freedomIndex >= 40) {
    level = 'stability';
    levelLabel = 'Estabilidade';
    levelIcon = '🪴';
  } else if (freedomIndex >= 20) {
    level = 'organization';
    levelLabel = 'Organização';
    levelIcon = '🌿';
  }

  const trendPoints = params.previousFreedomIndex !== undefined && !hasNoData
    ? freedomIndex - params.previousFreedomIndex
    : undefined;

  return {
    freedomIndex,
    level,
    levelLabel,
    levelIcon,
    trendPoints,
    wealthScore: core.wealthScore,
    breakdown: {
      debtPayoffPercent: Math.round(debtPayoffPercent),
      incomeFreedomPercent: Math.round(incomeFreedomPercent),
      emergencyReservePercent: Math.round(emergencyReservePercent),
      netWorthPercent: Math.round(netWorthPercent),
      investmentRatePercent: Math.round(investmentRatePercent),
      passiveIncomePercent: Math.round(passiveIncomePercent),
      diversificationNormalized,
    },
  };
}

export function calculateFreedomTimeline(params: {
  accounts: any[];
  investments: any[];
  liabilities: any[];
  dre: PFDRE;
  monthlyIncome: number;
  realSurplus?: number;
}): FreedomTimeline {
  const accounts = params.accounts || [];
  const investments = params.investments || [];
  const liabilities = params.liabilities || [];
  const dre = params.dre || { receitaTotal: 0, despesasOperacionais: 0, taxaAcumulacao: 0 };
  const monthlyIncome = params.monthlyIncome || 0;

  const core = calculateFinancialCore({
    accounts,
    investments,
    liabilities,
  });

  const cashBalance = core.cashBalance;
  const totalInvestments = core.investmentValue;

  const baseDate = new Date();

  // 1. Data de Fim das Dívidas
  let maxRemainingMonths = 0;
  liabilities.forEach((l) => {
    const total = Number(l.totalInstallments || 0);
    const current = Number(l.currentInstallment || 0);
    const remaining = Math.max(total - current, 0);
    if (remaining > maxRemainingMonths) {
      maxRemainingMonths = remaining;
    }
  });

  const debtFreedomDate = maxRemainingMonths > 0
    ? formatMonthYearPT(addMonthsToDate(baseDate, maxRemainingMonths))
    : 'Hoje';

  // 2. Data de Reserva Completa
  const reserve = calculateEmergencyReserve({
    accounts,
    investments,
    essentialMonthlyExpenses: (dre.essenciais || 0) + (dre.saude || 0) + (dre.educacao || 0),
    targetMonths: 6,
  });
  const targetReserve = reserve.targetAmount;
  const remainingReserve = reserve.reserveGap;

  const despesasMensais = dre.despesasOperacionais > 0 ? dre.despesasOperacionais : 3000;
  const surplus = params.realSurplus !== undefined && params.realSurplus > 0
    ? params.realSurplus
    : Math.max(monthlyIncome * 0.1, monthlyIncome - despesasMensais);
  
  const monthsToReserve = surplus > 0 ? Math.ceil(remainingReserve / surplus) : 12;

  const reserveDateObj = addMonthsToDate(
    maxRemainingMonths > 0 ? addMonthsToDate(baseDate, maxRemainingMonths) : baseDate,
    monthsToReserve
  );
  const reserveDate = remainingReserve > 0
    ? formatMonthYearPT(reserveDateObj)
    : 'Completa';

  // 3. Data de Liberdade Financeira (4% rule)
  const targetNetWorth = despesasMensais * 12 / 0.04;
  const totalAssets = cashBalance + totalInvestments;

  let monthsToFreedom = 0;
  let currentAssets = totalAssets;
  const monthlyRate = 0.08 / 12; // 8% a.a.
  const maxMonths = 600; // Cap de 50 anos

  if (currentAssets < targetNetWorth) {
    while (currentAssets < targetNetWorth && monthsToFreedom < maxMonths) {
      currentAssets = currentAssets * (1 + monthlyRate) + surplus;
      monthsToFreedom++;
    }
  }

  const freedomDateObj = addMonthsToDate(reserveDateObj, monthsToFreedom);
  const freedomDate = totalAssets >= targetNetWorth
    ? 'Hoje 🎉'
    : formatMonthYearPT(freedomDateObj);

  // Marcos da linha do tempo estendida (7 marcos)
  const formatMonth = (m: number) => {
    if (m === 0) return 'Concluída';
    return formatMonthYearPT(addMonthsToDate(baseDate, m));
  };

  const initialCards = liabilities.filter(l => l.type === 'Cartão' || String(l.name).toLowerCase().includes('cartao'));
  const maxInitialCardMonths = initialCards.length > 0 ? Math.max(...initialCards.map(c => Math.max(0, Number(c.totalInstallments || 0) - Number(c.currentInstallment || 0)))) : 0;

  const milestones: FreedomTimelineMilestone[] = [
    {
      label: 'Início da Jornada',
      date: 'Hoje',
      description: 'Seu ponto de partida atual no FinDomus.',
      completed: true,
      icon: '🚀',
      explainability: {
        enginesUsed: ['financial-core'],
        variablesUsed: {
          patrimonioLiquido: { value: totalAssets, source: 'financial-core:calculateFinancialCore()' },
        },
        formula: 'Patrimônio Líquido atual do usuário',
      },
    },
    {
      label: 'Quitação de Cartões',
      date: initialCards.length === 0 ? 'Concluída' : formatMonth(maxInitialCardMonths),
      description: 'Fim dos juros abusivos de rotativo ou faturas de cartão.',
      completed: initialCards.length === 0,
      icon: '💳',
      explainability: {
        enginesUsed: ['liability-engine'],
        variablesUsed: {
          mesesRestantesCartao: { value: maxInitialCardMonths, source: 'liabilities[].totalInstallments - liabilities[].currentInstallment' },
        },
        formula: 'Data da última parcela do cartão de maior duração',
      },
    },
    {
      label: 'Fim de Todas as Dívidas',
      date: liabilities.length === 0 ? 'Concluída' : formatMonth(maxRemainingMonths),
      description: 'Amortização completa de todos os financiamentos e passivos.',
      completed: liabilities.length === 0,
      icon: '🎉',
      explainability: {
        enginesUsed: ['liability-engine'],
        variablesUsed: {
          mesesRestantesDividas: { value: maxRemainingMonths, source: 'liabilities[].totalInstallments - liabilities[].currentInstallment' },
        },
        formula: 'Data da última parcela do passivo de maior duração',
      },
    },
    {
      label: 'Reserva de Emergência',
      date: cashBalance >= targetReserve ? 'Concluída' : formatMonth(maxRemainingMonths + monthsToReserve),
      description: 'Acúmulo equivalente a 6 meses de gastos operacionais.',
      completed: cashBalance >= targetReserve,
      icon: '🛡️',
      explainability: {
        enginesUsed: ['freedom-engine', 'forecast-engine'],
        variablesUsed: {
          reservaRequerida: { value: targetReserve, source: 'dre.despesasOperacionais * 6' },
          sobraFinanceiraMensal: { value: surplus, source: 'forecast-engine ou cálculo de surplus base' },
          saldoDisponivel: { value: cashBalance, source: 'accounts balance' },
        },
        formula: 'mesesRestantes = (reservaRequerida - saldoDisponivel) / sobraFinanceiraMensal',
      },
    },
    {
      label: 'Primeiros Investimentos',
      date: investments.length > 0 ? 'Concluída' : formatMonth(maxRemainingMonths + monthsToReserve + 1),
      description: 'Alocação inicial de capital além da liquidez diária.',
      completed: investments.length > 0,
      icon: '📈',
      explainability: {
        enginesUsed: ['freedom-engine'],
        variablesUsed: {
          carteiraInvestimentos: { value: totalInvestments, source: 'investments[].currentValue' },
        },
        formula: 'Primeira alocação em carteira de ativos além do saldo de liquidez imediata',
      },
    },
    {
      label: 'Metade do Caminho (50%)',
      date: totalAssets >= targetNetWorth * 0.5 ? 'Concluída' : formatMonth(maxRemainingMonths + monthsToReserve + Math.floor(monthsToFreedom * 0.5)),
      description: 'Ativos rendendo o suficiente para pagar 50% do seu custo de vida.',
      completed: totalAssets >= targetNetWorth * 0.5,
      icon: '🏆',
      explainability: {
        enginesUsed: ['freedom-engine', 'million'],
        variablesUsed: {
          metaNetWorth50Percent: { value: targetNetWorth * 0.5, source: '(dre.despesasOperacionais * 12 / 0.04) * 0.5' },
          taxaRendimentoSimulada: { value: '8% a.a.', source: 'Média de mercado para juros compostos' },
        },
        formula: 'Projeção de juros compostos com aportes baseados na sobra financeira',
      },
    },
    {
      label: 'Liberdade Financeira (100%)',
      date: totalAssets >= targetNetWorth ? 'Hoje 🎉' : formatMonth(maxRemainingMonths + monthsToReserve + monthsToFreedom),
      description: 'Renda passiva estimada cobrindo 100% dos seus gastos essenciais.',
      completed: totalAssets >= targetNetWorth,
      icon: '🏡',
      explainability: {
        enginesUsed: ['freedom-engine', 'retirement'],
        variablesUsed: {
          metaNetWorth100Percent: { value: targetNetWorth, source: 'dre.despesasOperacionais * 12 / 0.04 (Regra dos 4%)' },
          tempoTotalMeses: { value: maxRemainingMonths + monthsToReserve + monthsToFreedom, source: 'liability-engine + freedom-engine' },
        },
        formula: 'Ativos Totais acumulando juros compostos + sobra mensal atingem a Regra dos 4%',
      },
    },
  ];

  return {
    debtFreedomDate,
    reserveDate,
    freedomDate,
    targetNetWorth,
    monthsToDebtFreedom: maxRemainingMonths,
    monthsToReserve: maxRemainingMonths + monthsToReserve,
    monthsToFreedom: maxRemainingMonths + monthsToReserve + monthsToFreedom,
    milestones,
  };
}

export function generateActionPlan(
  indexResult: FreedomIndexResult,
  liabilities: any[],
  accounts: any[],
  dre: PFDRE,
  investments: any[] = []
): ActionPlanItem[] {
  const reserve = calculateEmergencyReserve({
    accounts,
    investments,
    essentialMonthlyExpenses: (dre.essenciais || 0) + (dre.saude || 0) + (dre.educacao || 0),
    targetMonths: 6,
  });

  const actions: ActionPlanItem[] = [];

  // 1. Quitação de Cartões
  const activeCards = liabilities.filter(l => {
    const isCard = l.type === 'Cartão' || String(l.name).toLowerCase().includes('cartao');
    const remaining = Math.max(0, Number(l.totalInstallments || 0) - Number(l.currentInstallment || 0));
    return isCard && remaining > 0;
  });

  if (activeCards.length > 0) {
    const totalDebtValue = activeCards.reduce((s, c) => s + Number(c.remainingBalance || 0), 0);
    actions.push({
      title: 'Quitar cartões de crédito',
      description: 'Você possui cartões ativos com saldo pendente. Juros de rotativo podem corroer sua renda rapidamente.',
      impactR$: `Economia de até R$ ${(totalDebtValue * 1.5).toFixed(0)}/ano em juros`,
      impactPts: 8,
      effort: 'Baixo',
      priority: 'Crítica',
      priorityColor: 'rose',
      cta: 'Ver Cartões',
      href: '/passivos',
    });
  }

  // 2. Financiamentos / Empréstimos
  const otherLiabilities = liabilities.filter(l => {
    const isCard = l.type === 'Cartão' || String(l.name).toLowerCase().includes('cartao');
    const remaining = Math.max(0, Number(l.totalInstallments || 0) - Number(l.currentInstallment || 0));
    return !isCard && remaining > 0;
  });

  if (otherLiabilities.length > 0) {
    actions.push({
      title: 'Amortizar passivos longos',
      description: 'Antecipe parcelas de trás para frente para eliminar o peso dos juros compostos cobrados pelo banco.',
      impactR$: 'Redução drástica do custo total da dívida',
      impactPts: 5,
      effort: 'Médio',
      priority: 'Alta',
      priorityColor: 'amber',
      cta: 'Amortizar',
      href: '/passivos',
    });
  }

  // 3. Reserva Emergencial
  if (reserve.reserveAmount < 1000) {
    actions.push({
      title: 'Montar Reserva de Segurança Mínima',
      description: 'Guarde seus primeiros R$ 1.000 como colchão de segurança contra imprevistos básicos.',
      impactR$: `Meta de R$ 1.000`,
      impactPts: 7,
      effort: 'Baixo',
      priority: 'Crítica',
      priorityColor: 'rose',
      cta: 'Fazer Aporte',
      href: '/planejamento',
    });
  } else if (reserve.reserveGap > 0) {
    actions.push({
      title: `Alcançar meta de reserva (${reserve.coveredMonths.toFixed(1)}/${reserve.targetMonths} meses)`,
      description: 'Guarde o excedente mensal em contas digitais ou títulos públicos com liquidez diária.',
      impactR$: `Faltam R$ ${reserve.reserveGap.toLocaleString('pt-BR')}`,
      impactPts: 4,
      effort: 'Médio',
      priority: 'Alta',
      priorityColor: 'amber',
      cta: 'Visualizar Meta',
      href: '/contas',
    });
  }

  // 4. Iniciar Investimentos
  const hasNoInvestments = accounts.length > 0 && accounts.every(a => a.type !== 'investment');
  if (hasNoInvestments) {
    actions.push({
      title: 'Iniciar aportes em Renda Fixa 100% CDI',
      description: 'Sua reserva mínima está montada. Migre o caixa excedente para ativos que rendam acima da inflação.',
      impactR$: 'Rendimento superior a 10% a.a. real',
      impactPts: 3,
      effort: 'Baixo',
      priority: 'Média',
      priorityColor: 'blue',
      cta: 'Começar',
      href: '/investimentos',
    });
  }

  // 5. Taxa de Aporte Insuficiente
  if (dre.taxaAcumulacao < 15 && dre.receitaTotal > 0) {
    actions.push({
      title: 'Automatizar aporte mensal de 15%',
      description: 'Pague-se primeiro. Configure uma transferência automática logo no dia do recebimento do salário.',
      impactR$: `Meta: R$ ${(dre.receitaTotal * 0.15).toLocaleString('pt-BR')}/mês`,
      impactPts: 3,
      effort: 'Baixo',
      priority: 'Média',
      priorityColor: 'blue',
      cta: 'Ver Planejamento',
      href: '/planejamento',
    });
  }

  // Fallback se o usuário já tiver o score impecável
  if (actions.length === 0) {
    actions.push({
      title: 'Focar em ativos geradores de proventos',
      description: 'Seu patrimônio é saudável. Potencialize a renda passiva aplicando em Fundos Imobiliários e Ações de dividendos.',
      impactR$: 'Aceleração de juros compostos',
      impactPts: 2,
      effort: 'Médio',
      priority: 'Baixa',
      priorityColor: 'zinc',
      cta: 'Ver Proventos',
      href: '/investimentos',
    });
  }

  return actions.slice(0, 4); // Retorna até as 4 mais urgentes
}

export function estimatePreviousFreedomIndex(closure: any): number {
  if (!closure) return 0;
  if (closure.snapshot?.freedomIndex !== undefined) {
    return closure.snapshot.freedomIndex;
  }
  
  // Reconstrução a partir do snapshot
  const netWorth = closure.snapshot?.netWorth?.value || closure.balance || 0;
  const accountsBalance = closure.snapshot?.assets?.accountsBalance || 0;
  const investmentsValue = closure.snapshot?.assets?.investmentsValue || 0;
  const totalLiabilities = closure.snapshot?.netWorth?.totalLiabilities || 0;
  const monthlyIncome = closure.income || 0;
  
  const mockDRE: PFDRE = {
    receitaTotal: monthlyIncome,
    essenciais: 0,
    qualidadeVida: 0,
    estiloVida: 0,
    educacao: 0,
    saude: 0,
    construcaoPatrimonial: 0,
    outros: 0,
    despesasOperacionais: closure.expenses || 0,
    saldoRestante: monthlyIncome - (closure.expenses || 0),
    taxaAcumulacao: 0,
  };

  return calculateFreedomIndex({
    accounts: [{ balance: accountsBalance, owner: 'PF' }],
    investments: [{ currentValue: investmentsValue }],
    liabilities: [{ remainingBalance: totalLiabilities, totalInstallments: 1, currentInstallment: 0, installmentValue: 0 }],
    dre: mockDRE,
    previousFreedomIndex: undefined,
  }).freedomIndex;
}
