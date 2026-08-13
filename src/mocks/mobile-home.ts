import type { InsightSeverity } from '@/components/mobile';
import type { ProgressStatus } from '@/components/mobile';

export interface MockTransaction {
  title: string;
  subtitle: string;
  value: string;
}

export interface MockMobileHome {
  greeting: {
    name: string;
    period: 'manha' | 'tarde' | 'noite';
  };
  hero: {
    value: string;
    label: string;
    variation: {
      value: string;
      direction: 'up' | 'down' | 'neutral';
    };
    supportingText: string;
  };
  freedomIndex: {
    title: string;
    value: string;
    percent: number;
    supportingText: string;
    status: ProgressStatus;
  };
  insight: {
    title: string;
    description: string;
    severity: InsightSeverity;
    ctaLabel: string;
  };
  nextAction: {
    title: string;
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  kpis: {
    leftLabel: string;
    leftValue: string;
    rightLabel: string;
    rightValue: string;
    leftSupportingText: string;
    rightSupportingText: string;
  };
  transactions: MockTransaction[];
}

function getPeriod(): 'manha' | 'tarde' | 'noite' {
  const hour = new Date().getHours();
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}

export function getMockMobileHome(): MockMobileHome {
  const period = getPeriod();

  return {
    greeting: {
      name: 'Anderson',
      period,
    },
    hero: {
      value: 'R$ 24.582,39',
      label: 'Saldo Disponível',
      variation: {
        value: '+12,3%',
        direction: 'up',
      },
      supportingText: 'vs. mês anterior',
    },
    freedomIndex: {
      title: 'Freedom Index',
      value: '72/100',
      percent: 72,
      supportingText: 'Rumo à liberdade financeira',
      status: 'positive',
    },
    insight: {
      title: 'Domus IA',
      description:
        'Seu fluxo de caixa está 15% acima do projetado. Considere revisar sua alocação de investimentos para otimizar o rendimento.',
      severity: 'info',
      ctaLabel: 'Ver detalhes',
    },
    nextAction: {
      title: 'Revisar orçamento mensal',
      description:
        'Você está a 3 dias do fechamento. Última chance de categorizar 12 lançamentos pendentes.',
      primaryLabel: 'Categorizar',
      secondaryLabel: 'Depois',
    },
    kpis: {
      leftLabel: 'Receita',
      leftValue: 'R$ 12.400,00',
      rightLabel: 'Despesa',
      rightValue: 'R$ 8.320,00',
      leftSupportingText: 'Este mês',
      rightSupportingText: 'Este mês',
    },
    transactions: [
      {
        title: 'Supermercado',
        subtitle: 'Alimentação',
        value: '-R$ 450,00',
      },
      {
        title: 'Salário',
        subtitle: 'Receita',
        value: '+R$ 12.400,00',
      },
      {
        title: 'Aluguel',
        subtitle: 'Moradia',
        value: '-R$ 2.800,00',
      },
      {
        title: 'Uber',
        subtitle: 'Transporte',
        value: '-R$ 32,50',
      },
      {
        title: 'Dividendos',
        subtitle: 'Investimentos',
        value: '+R$ 245,00',
      },
    ],
  };
}

export function getPeriodGreeting(period: 'manha' | 'tarde' | 'noite'): string {
  const map = { manha: 'Bom dia', tarde: 'Boa tarde', noite: 'Boa noite' };
  return map[period];
}
