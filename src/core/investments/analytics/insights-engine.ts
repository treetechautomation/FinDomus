import type { ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import type { 
  InsightMessage, 
  AllocationBreakdown, 
  PerformanceAnalytics, 
  DividendAnalytics, 
  RiskAnalytics,
  HealthScoreResult
} from './types';

export function generateInsights(
  portfolio: ConsolidatedPortfolio,
  allocation: AllocationBreakdown,
  performance: PerformanceAnalytics,
  dividends: DividendAnalytics,
  risk: RiskAnalytics,
  health: HealthScoreResult
): InsightMessage[] {
  const insights: InsightMessage[] = [];
  const total = portfolio.totalMarketValue || 0;
  if (total <= 0) return [];

  let idCounter = 1;
  const addInsight = (text: string, type: 'info' | 'warning' | 'success' | 'danger', category: string) => {
    insights.push({
      id: `insight-${idCounter++}`,
      text,
      type,
      category,
    });
  };

  // 1. Asset Concentration Insight
  const largestAsset = risk.assetConcentration[0];
  if (largestAsset && largestAsset.percentage > 15) {
    const severity = largestAsset.percentage > 30 ? 'danger' : 'warning';
    addInsight(
      `O ativo ${largestAsset.name} representa ${largestAsset.percentage.toFixed(1)}% da sua carteira. Considere rebalancear a carteira para reduzir o risco de exposição individual.`,
      severity,
      'Concentração'
    );
  }

  // 2. Liquidity / Fixed Income Insight
  const liq = risk.liquidityPercent;
  if (liq < 12) {
    addInsight(
      `Sua alocação em Renda Fixa é baixa (${liq.toFixed(1)}%). Certifique-se de manter uma reserva de emergência separada em títulos de liquidez diária.`,
      'warning',
      'Alocação'
    );
  } else if (liq > 60) {
    addInsight(
      `Você possui ${liq.toFixed(1)}% da carteira em Renda Fixa. Para objetivos de longo prazo, pode fazer sentido destinar parte para ativos de Renda Variável visando retornos maiores.`,
      'info',
      'Alocação'
    );
  }

  // 3. Institutional Diversification Insight
  const numInst = allocation.byInstitution.length;
  const largestInstName = allocation.byInstitution[0]?.name || 'sua corretora principal';
  const largestInstPct = allocation.byInstitution[0]?.percentage || 0;
  if (numInst === 1) {
    addInsight(
      `Seus investimentos estão 100% sob custódia da instituição "${largestInstName}". Considere diversificar em outro banco ou corretora para mitigar risco operacional.`,
      'warning',
      'Segurança'
    );
  } else if (largestInstPct > 70) {
    addInsight(
      `Sua carteira está concentrada em ${largestInstPct.toFixed(1)}% na "${largestInstName}". Tente equilibrar os aportes entre as ${numInst} instituições cadastradas.`,
      'info',
      'Segurança'
    );
  } else if (numInst >= 3) {
    addInsight(
      `Excelente diversificação institucional! Seu patrimônio está distribuído entre ${numInst} instituições financeiras de forma equilibrada.`,
      'success',
      'Segurança'
    );
  }

  // 4. Performance Insights
  const profitPct = performance.totalProfitPercent;
  const profitBRL = performance.totalProfit;
  if (profitPct > 12) {
    const formattedProfit = Number(profitBRL.toFixed(0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    addInsight(
      `Sua carteira apresenta um retorno acumulado expressivo de +${profitPct.toFixed(1)}% (lucro nominal de ${formattedProfit}). Ótimo resultado!`,
      'success',
      'Desempenho'
    );
  } else if (profitPct < -5) {
    addInsight(
      `Seu retorno acumulado atual é negativo (-${Math.abs(profitPct).toFixed(1)}%). Em ciclos de baixa da renda variável, o rebalanceamento inteligente e aportes recorrentes reduzem o preço médio.`,
      'warning',
      'Desempenho'
    );
  }

  // 5. Dividend Yield Insights
  const dy = dividends.dividendYield;
  const yoc = dividends.yieldOnCost;
  if (dy > 6) {
    addInsight(
      `Sua carteira de proventos apresenta um excelente Dividend Yield de ${dy.toFixed(1)}% consolidado, gerando fluxo de caixa recorrente robusto.`,
      'success',
      'Renda Passiva'
    );
  }
  if (yoc > dy + 1) {
    addInsight(
      `Efeito Bola de Neve: Seu Yield on Cost está em ${yoc.toFixed(1)}%, superior ao Dividend Yield atual (${dy.toFixed(1)}%), demonstrando o impacto positivo do crescimento de dividendos sobre o preço médio pago.`,
      'success',
      'Renda Passiva'
    );
  }

  // 6. Sector Concentration Insight
  const largestSector = allocation.bySector[0];
  if (largestSector && largestSector.percentage > 35) {
    addInsight(
      `O setor "${largestSector.name}" concentra ${largestSector.percentage.toFixed(1)}% da sua alocação de risco. Avalie reduzir novas compras neste setor.`,
      'warning',
      'Concentração'
    );
  }

  // 7. General Health Score Insight
  const hs = health.score;
  if (hs >= 85) {
    addInsight(
      `Parabéns! Sua carteira possui uma nota de saúde excelente de ${hs}/100 (Nota ${health.grade}), com forte aderência às boas práticas de diversificação e controle de riscos.`,
      'success',
      'Geral'
    );
  } else if (hs < 50) {
    addInsight(
      `Sua carteira tem nota de saúde baixa (${hs}/100 - Nota ${health.grade}). Foque em adicionar novas classes de ativos e reduzir a concentração nos papéis dominantes para mitigar oscilações severas.`,
      'danger',
      'Geral'
    );
  }

  return insights;
}
