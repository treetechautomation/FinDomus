import { runSimulation, type SimulationScenario, type SimulationResult } from './simulation-engine';
import { type KernelContext, type KernelResult } from './kernel';

export type OptimizationOpportunity = {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
};

export type OptimizationResult = {
  opportunities: OptimizationOpportunity[];
  topStrategies: SimulationResult[];
  generatedAt: string;
};

function identifyOpportunities(context: KernelContext, result: KernelResult): OptimizationOpportunity[] {
  const opps: OptimizationOpportunity[] = [];

  // 1. Dinheiro parado vs dívidas de juros altos
  const idleCash = context.accounts
    .filter((a: any) => a.owner === 'PF')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const highInterestLiabilities = context.liabilities.filter((l: any) => {
    const isHigh = l.type === 'Cartão' || l.type === 'Empréstimo' || l.name.toLowerCase().includes('juros');
    return isHigh && Number(l.remainingBalance || 0) > 0;
  });

  if (highInterestLiabilities.length > 0 && idleCash > 1000) {
    opps.push({
      type: 'idle_cash_vs_debt',
      severity: 'high',
      description: `Você possui R$ ${idleCash.toLocaleString('pt-BR')} parado em conta e tem passivos em aberto com juros altos. Quitar ou amortizar essas obrigações de imediato trará economia de juros reais.`,
    });
  }

  // 2. Reserva de segurança abaixo do ideal
  if (result.freedom.index.breakdown.emergencyReservePercent < 50) {
    opps.push({
      type: 'low_reserve',
      severity: 'high',
      description: `Sua reserva de emergência está abaixo de 50% da meta de 6 meses de gastos essenciais. Priorize a segurança líquida antes de tomar novos riscos de investimentos longos.`,
    });
  }

  // 3. Diversificação baixa
  if (result.freedom.index.breakdown.diversificationNormalized < 40) {
    opps.push({
      type: 'low_diversification',
      severity: 'medium',
      description: `Seus investimentos estão excessivamente concentrados. Recomendamos diversificar entre pelo menos 3 classes de ativos independentes para reduzir risco sistemático.`,
    });
  }

  return opps;
}

export function findOptimalStrategy(
  context: KernelContext,
  baselineResult: KernelResult
): OptimizationResult {
  const opportunities = identifyOpportunities(context, baselineResult);
  const scenarios: SimulationScenario[] = [];

  // Identify high interest debt payoff options
  const highInterestLiabilities = context.liabilities.filter((l: any) => Number(l.remainingBalance || 0) > 0);
  const idleCash = context.accounts
    .filter((a: any) => a.owner === 'PF')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  if (highInterestLiabilities.length > 0 && idleCash > 500) {
    highInterestLiabilities.forEach((liab) => {
      // 50% Payoff
      const halfAmount = Number((liab.remainingBalance * 0.5).toFixed(2));
      if (idleCash >= halfAmount) {
        scenarios.push({
          type: 'payoff_debt',
          params: { liabilityId: liab.id, amount: halfAmount },
          label: `Amortizar 50% de ${liab.name}`,
        });
      }
      // 100% Payoff
      const fullAmount = Number(liab.remainingBalance.toFixed(2));
      if (idleCash >= fullAmount) {
        scenarios.push({
          type: 'payoff_debt',
          params: { liabilityId: liab.id, amount: fullAmount },
          label: `Quitar 100% de ${liab.name}`,
        });
      }
    });
  }

  // Add standard new investment scenarios
  if (idleCash > 200) {
    scenarios.push({
      type: 'new_investment',
      params: { monthlyAmount: 200 },
      label: 'Aporte mensal de R$ 200',
    });
    scenarios.push({
      type: 'new_investment',
      params: { monthlyAmount: 500 },
      label: 'Aporte mensal de R$ 500',
    });
  }

  // Add standard expense reduction scenarios
  scenarios.push({
    type: 'expense_reduction',
    params: { monthlyReduction: 100 },
    label: 'Reduzir R$ 100 de gastos mensais',
  });
  scenarios.push({
    type: 'expense_reduction',
    params: { monthlyReduction: 300 },
    label: 'Reduzir R$ 300 de gastos mensais',
  });

  // Run all simulations
  const results = scenarios.map((s) => runSimulation(context, baselineResult, s));

  // Rank by positive delta in Freedom Index
  const ranked = results.sort((a, b) => {
    const gainA = a.diff.find((d) => d.metric === 'Índice de Liberdade')?.delta ?? 0;
    const gainB = b.diff.find((d) => d.metric === 'Índice de Liberdade')?.delta ?? 0;
    return gainB - gainA;
  });

  return {
    opportunities,
    topStrategies: ranked.slice(0, 3),
    generatedAt: new Date().toISOString(),
  };
}
