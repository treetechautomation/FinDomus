import type { ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import type { 
  HealthScoreResult, 
  HealthPillarScore, 
  AllocationBreakdown, 
  PerformanceAnalytics, 
  DividendAnalytics, 
  RiskAnalytics 
} from './types';

export function calculateHealthScore(
  portfolio: ConsolidatedPortfolio,
  allocation: AllocationBreakdown,
  performance: PerformanceAnalytics,
  dividends: DividendAnalytics,
  risk: RiskAnalytics
): HealthScoreResult {
  const total = portfolio.totalMarketValue || 0;
  const numAssets = portfolio.assets.length;
  const numClasses = allocation.byClass.length;
  const numSectors = allocation.bySector.length;

  // --- Pillar 1: Diversificação (Max 20) ---
  let divScore = 0;
  // Assets score (Max 8)
  if (numAssets === 1) divScore += 2;
  else if (numAssets <= 3) divScore += 4;
  else if (numAssets <= 5) divScore += 6;
  else divScore += 8;

  // Classes score (Max 6)
  if (numClasses === 1) divScore += 2;
  else if (numClasses === 2) divScore += 4;
  else divScore += 6;

  // Sectors score (Max 6)
  if (numSectors === 1) divScore += 2;
  else if (numSectors === 2) divScore += 4;
  else divScore += 6;

  const pilarDiversification: HealthPillarScore = {
    name: 'Diversificação',
    score: divScore,
    maxScore: 20,
    feedback: divScore >= 16 
      ? 'Excelente diversificação de ativos, classes e setores.'
      : divScore >= 10 
        ? 'Diversificação razoável, mas pode melhorar adicionando outras classes.'
        : 'Baixa diversificação: sua carteira está concentrada em poucos pilares.',
  };

  // --- Pillar 2: Concentração (Max 20) ---
  let concScore = 20;
  // Largest asset penalty
  const largestAsset = risk.assetConcentration[0]?.percentage || 0;
  if (largestAsset > 35) concScore -= 12;
  else if (largestAsset > 20) concScore -= 6;
  else if (largestAsset > 10) concScore -= 2;

  // Largest institution penalty
  const largestInst = risk.institutionConcentration[0]?.percentage || 0;
  if (largestInst > 75) concScore -= 8;
  else if (largestInst > 50) concScore -= 4;
  else if (largestInst > 30) concScore -= 1;

  concScore = Math.max(2, concScore);

  const pilarConcentration: HealthPillarScore = {
    name: 'Concentração',
    score: concScore,
    maxScore: 20,
    feedback: concScore >= 16
      ? 'Distribuição equilibrada, sem dependência excessiva de um único ativo/banco.'
      : concScore >= 10
        ? 'Exposição elevada em algum ativo ou corretora, atenção aos limites recomendados.'
        : 'Concentração perigosa. Reduza a exposição ao ativo ou banco dominante.',
  };

  // --- Pillar 3: Liquidez (Max 20) ---
  const liqPct = risk.liquidityPercent;
  let liqScore = 0;
  if (liqPct >= 15 && liqPct <= 45) {
    liqScore = 20; // optimal cushion
  } else if (liqPct < 15) {
    liqScore = Math.round((liqPct / 15) * 15) + 5;
  } else {
    // Too much liquidity (penalize opportunity cost)
    liqScore = Math.max(10, Math.round(20 - ((liqPct - 45) / 55) * 10));
  }

  const pilarLiquidity: HealthPillarScore = {
    name: 'Liquidez',
    score: liqScore,
    maxScore: 20,
    feedback: liqPct >= 15 && liqPct <= 45
      ? 'Reserva de liquidez (Renda Fixa) em nível saudável para cobrir emergências.'
      : liqPct < 15
        ? 'Reserva de liquidez baixa. Garanta liquidez imediata para despesas imprevistas.'
        : 'Liquidez excessiva. Você pode estar perdendo rentabilidade ao deixar muito capital parado.',
  };

  // --- Pillar 4: Dividendos (Max 20) ---
  const dy = dividends.dividendYield;
  const yoc = dividends.yieldOnCost;
  let divPilarScore = 5;

  if (dy > 8) divPilarScore = 20;
  else if (dy >= 5) divPilarScore = 17;
  else if (dy >= 3) divPilarScore = 14;
  else if (dy > 0) divPilarScore = 10;

  // Bonus for Yield on Cost indicating yield growth over time
  if (yoc > dy && dy > 0) {
    divPilarScore = Math.min(20, divPilarScore + 2);
  }

  const pilarDividends: HealthPillarScore = {
    name: 'Dividendos',
    score: divPilarScore,
    maxScore: 20,
    feedback: dy >= 5
      ? `Ótima geração de proventos passivos (Dividend Yield consolidado de ${dy.toFixed(1)}%).`
      : dy > 0
        ? `Sua carteira gera dividendos moderados (${dy.toFixed(1)}%). Aumente FIIs/Ações de dividendos se este for seu foco.`
        : 'Geração de renda passiva muito baixa ou nula. Carteira focada em crescimento ou renda fixa acumuladora.',
  };

  // --- Pillar 5: Risco/Volatilidade (Max 20) ---
  // Starts based on diversification score then deducts based on critical alerts
  let riskScore = Math.round((risk.diversificationScore / 100) * 20);
  const dangerAlerts = risk.concentrationAlerts.filter(a => a.severity === 'danger').length;
  const warningAlerts = risk.concentrationAlerts.filter(a => a.severity === 'warning').length;

  riskScore -= (dangerAlerts * 5) + (warningAlerts * 2);
  riskScore = Math.max(2, Math.min(20, riskScore));

  const pilarRisk: HealthPillarScore = {
    name: 'Risco',
    score: riskScore,
    maxScore: 20,
    feedback: riskScore >= 16
      ? 'Perfil de risco conservador/moderado bem gerido, livre de anomalias críticas.'
      : riskScore >= 10
        ? 'Nível de risco aceitável, com poucos alertas de concentração detectados.'
        : 'Risco sistêmico elevado devido a alertas críticos na carteira. Recomendada ação corretiva.',
  };

  // --- Final Aggregated Score (Sum of all 5 pillars: Max 100) ---
  const score = divScore + concScore + liqScore + divPilarScore + riskScore;

  // Determine general letter grade
  let grade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';

  return {
    score,
    grade,
    pilars: {
      diversification: pilarDiversification,
      concentration: pilarConcentration,
      liquidity: pilarLiquidity,
      dividends: pilarDividends,
      risk: pilarRisk,
    },
  };
}
