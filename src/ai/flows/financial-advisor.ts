import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { runFinancialKernel } from '@/core/finance/kernel';
import { runSimulation } from '@/core/finance/simulation-engine';
import { loadKernelContextAdmin } from '@/services/firestore/kernel.admin';

export const financialAdvisorFlow = ai.defineFlow(
  {
    name: 'financialAdvisor',
    inputSchema: z.object({
      userId: z.string(),
      question: z.string(),
      contextData: z.any().optional(),
    }),
    outputSchema: z.object({
      answer: z.string(),
      simulations: z.array(z.any()).optional(),
      confidence: z.number(),
      dataUsed: z.array(z.string()),
    }),
  },
  async (input) => {
    const context = input.contextData || (await loadKernelContextAdmin(input.userId));
    const baseline = runFinancialKernel(context);

    // Dynamic simulations based on keyword analysis
    const simulations: any[] = [];
    const textLower = input.question.toLowerCase();

    if (
      textLower.includes('quitar') ||
      textLower.includes('amortizar') ||
      textLower.includes('divida') ||
      textLower.includes('pagar')
    ) {
      const targetLiab = context.liabilities.find((l: any) => Number(l.remainingBalance || 0) > 0);
      if (targetLiab) {
        const halfAmount = Number((targetLiab.remainingBalance * 0.5).toFixed(0));
        const simPayoff = runSimulation(context, baseline, {
          type: 'payoff_debt',
          params: { liabilityId: targetLiab.id, amount: halfAmount },
          label: `Amortizar R$ ${halfAmount} de ${targetLiab.name}`,
        });
        simulations.push(simPayoff);
      }
    }

    if (
      textLower.includes('investir') ||
      textLower.includes('aporte') ||
      textLower.includes('investimento')
    ) {
      const simInvest = runSimulation(context, baseline, {
        type: 'new_investment',
        params: { monthlyAmount: 500 },
        label: 'Aporte Mensal de R$ 500',
      });
      simulations.push(simInvest);
    }

    const prompt = `
    Você é o Copiloto Financeiro do FinDomus.
    Analise o contexto financeiro real do usuário e responda de forma muito clara, direta e objetiva em Português do Brasil.

    CONTEXTO ATUAL DO USUÁRIO:
    - Índice de Liberdade: ${baseline.freedom.index.freedomIndex}/100
    - Nível de Liberdade: ${baseline.freedom.index.levelLabel}
    - Patrimônio Líquido: R$ ${baseline.financialCore.netWorth.toLocaleString('pt-BR')}
    - Gastos Mensais: R$ ${baseline.dre.despesasOperacionais.toLocaleString('pt-BR')}
    - Renda Mensal: R$ ${baseline.dre.receitaTotal.toLocaleString('pt-BR')}
    - Reserva de Emergência: ${baseline.freedom.index.breakdown.emergencyReservePercent}% da meta
    - Duração da reserva: ${baseline.freedom.timeline.monthsToReserve} meses para completar

    SIMULAÇÕES EXECUTADAS:
    ${
      simulations.length > 0
        ? JSON.stringify(
            simulations.map((s) => ({
              scenario: s.scenario.label,
              freedomIndexDelta: s.diff.find((d: any) => d.metric === 'Índice de Liberdade')?.delta || 0,
              netWorthDelta: s.diff.find((d: any) => d.metric === 'Patrimônio Líquido')?.delta || 0,
            })),
            null,
            2
          )
        : 'Nenhuma simulação de comparação foi acionada para esta pergunta.'
    }

    PERGUNTA DO USUÁRIO: "${input.question}"

    DIRETRIZES DE RESPOSTA:
    - Baseie-se nos dados reais informados acima.
    - Se houver simulações executadas, comente sobre os resultados delas no Índice de Liberdade e no tempo até a reserva/liberdade.
    - Seja extremamente profissional, com linguagem polida, agindo como um assessor financeiro sênior.
    `;

    const res = await ai.generate({
      prompt,
    });

    return {
      answer: res.text,
      simulations: simulations.map((s) => ({
        label: s.scenario.label,
        diff: s.diff,
      })),
      confidence: 0.95,
      dataUsed: ['dre-engine', 'financial-core', 'freedom-engine', 'simulation-engine'],
    };
  }
);
