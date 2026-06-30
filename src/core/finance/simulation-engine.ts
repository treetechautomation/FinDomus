import { runFinancialKernel, type KernelContext, type KernelResult } from './kernel';

export type ScenarioType =
  | 'payoff_debt'        // amortizar/quitar dívida
  | 'new_investment'     // novo investimento mensal
  | 'income_change'      // mudança de renda
  | 'expense_reduction'  // redução de gastos
  | 'sell_asset'         // venda de ativo
  | 'interest_change'    // mudança de taxa de juros
  | 'time_horizon'       // avançar N meses no tempo
  | 'custom';            // alteração arbitrária

export type SimulationScenario = {
  type: ScenarioType;
  params: Record<string, any>;
  label: string;
};

export type SimulationDiff = {
  metric: string;
  before: number | string;
  after: number | string;
  delta: number;
  deltaPercent: number;
  impact: 'positive' | 'negative' | 'neutral';
};

export type SimulationResult = {
  scenario: SimulationScenario;
  kernelResult: KernelResult;
  diff: SimulationDiff[];
  computedAt: string;
  executionTimeMs: number;
};

function applyScenario(ctx: KernelContext, scenario: SimulationScenario): void {
  switch (scenario.type) {
    case 'payoff_debt': {
      const { liabilityId, amount } = scenario.params;
      const amt = Number(amount || 0);
      const liab = ctx.liabilities.find((l: any) => l.id === liabilityId);
      if (liab) {
        liab.remainingBalance = Math.max(0, Number(liab.remainingBalance || 0) - amt);
        liab.currentInstallment = Math.min(
          Number(liab.totalInstallments || 0),
          Number(liab.currentInstallment || 0) + Math.floor(amt / Number(liab.installmentValue || 1))
        );
        // Deduct from accounts
        const mainAccount = ctx.accounts.find((a: any) => a.owner === 'PF');
        if (mainAccount) {
          mainAccount.balance = Math.max(0, Number(mainAccount.balance || 0) - amt);
        }
      }
      break;
    }

    case 'new_investment': {
      const { monthlyAmount } = scenario.params;
      const amt = Number(monthlyAmount || 0);
      ctx.investments.push({
        type: 'Renda Fixa',
        currentValue: amt,
        contributions: amt,
        name: 'Simulação — Novo Aporte',
        isSimulated: true,
      });
      break;
    }

    case 'income_change': {
      const { newMonthlyIncome } = scenario.params;
      const amt = Number(newMonthlyIncome || 0);
      ctx.transactions.push({
        type: 'income',
        amount: amt,
        date: new Date().toISOString(),
        description: 'Simulação — Nova Renda',
        category: 'Salário',
        owner: 'PF',
        isSimulated: true,
      });
      break;
    }

    case 'expense_reduction': {
      const { monthlyReduction } = scenario.params;
      const red = Number(monthlyReduction || 0);
      if (ctx.recurringExpenses.length > 0) {
        ctx.recurringExpenses = ctx.recurringExpenses.map((r: any) => ({
          ...r,
          amount: Math.max(0, Number(r.amount || 0) - red / ctx.recurringExpenses.length),
        }));
      }
      break;
    }

    case 'sell_asset': {
      const { investmentId } = scenario.params;
      const idx = ctx.investments.findIndex((i: any) => i.id === investmentId);
      if (idx >= 0) {
        const sold = ctx.investments.splice(idx, 1)[0];
        const mainAccount = ctx.accounts.find((a: any) => a.owner === 'PF');
        if (mainAccount && sold.currentValue) {
          mainAccount.balance = Number(mainAccount.balance || 0) + Number(sold.currentValue);
        }
      }
      break;
    }

    case 'time_horizon': {
      const { months } = scenario.params;
      const m = Number(months || 0);
      ctx.liabilities.forEach((l: any) => {
        l.currentInstallment = Math.min(
          Number(l.totalInstallments || 0),
          Number(l.currentInstallment || 0) + m
        );
        l.remainingBalance = Math.max(0, 
          Number(l.remainingBalance || 0) - (Number(l.installmentValue || 0) * m)
        );
      });
      break;
    }
  }
}

function computeDiff(before: KernelResult, after: KernelResult): SimulationDiff[] {
  const diffs: SimulationDiff[] = [];

  // 1. Freedom Index
  const beforeIndex = before.freedom.index.freedomIndex;
  const afterIndex = after.freedom.index.freedomIndex;
  diffs.push({
    metric: 'Índice de Liberdade',
    before: beforeIndex,
    after: afterIndex,
    delta: afterIndex - beforeIndex,
    deltaPercent: beforeIndex > 0 ? ((afterIndex - beforeIndex) / beforeIndex) * 100 : 0,
    impact: afterIndex > beforeIndex ? 'positive' : afterIndex < beforeIndex ? 'negative' : 'neutral',
  });

  // 2. Net Worth
  const beforeNetWorth = before.financialCore.netWorth;
  const afterNetWorth = after.financialCore.netWorth;
  diffs.push({
    metric: 'Patrimônio Líquido',
    before: beforeNetWorth,
    after: afterNetWorth,
    delta: afterNetWorth - beforeNetWorth,
    deltaPercent: beforeNetWorth > 0 ? ((afterNetWorth - beforeNetWorth) / beforeNetWorth) * 100 : 0,
    impact: afterNetWorth > beforeNetWorth ? 'positive' : afterNetWorth < beforeNetWorth ? 'negative' : 'neutral',
  });

  // 3. Receita Total
  const beforeIncome = before.dre.receitaTotal;
  const afterIncome = after.dre.receitaTotal;
  diffs.push({
    metric: 'Receita Total',
    before: beforeIncome,
    after: afterIncome,
    delta: afterIncome - beforeIncome,
    deltaPercent: beforeIncome > 0 ? ((afterIncome - beforeIncome) / beforeIncome) * 100 : 0,
    impact: afterIncome > beforeIncome ? 'positive' : afterIncome < beforeIncome ? 'negative' : 'neutral',
  });

  // 4. Despesas
  const beforeExpenses = before.dre.despesasOperacionais;
  const afterExpenses = after.dre.despesasOperacionais;
  diffs.push({
    metric: 'Despesas Mensais',
    before: beforeExpenses,
    after: afterExpenses,
    delta: afterExpenses - beforeExpenses,
    deltaPercent: beforeExpenses > 0 ? ((afterExpenses - beforeExpenses) / beforeExpenses) * 100 : 0,
    // Note: lower expenses is positive
    impact: afterExpenses < beforeExpenses ? 'positive' : afterExpenses > beforeExpenses ? 'negative' : 'neutral',
  });

  return diffs;
}

export function runSimulation(
  baselineContext: KernelContext,
  baselineResult: KernelResult,
  scenario: SimulationScenario
): SimulationResult {
  // Deep clone using serializable representation
  const simContext = JSON.parse(JSON.stringify(baselineContext)) as KernelContext;

  const t0 = performance.now();
  applyScenario(simContext, scenario);
  const simResult = runFinancialKernel(simContext);
  const executionTimeMs = Math.round(performance.now() - t0);

  const diff = computeDiff(baselineResult, simResult);

  return {
    scenario,
    kernelResult: simResult,
    diff,
    computedAt: new Date().toISOString(),
    executionTimeMs,
  };
}
