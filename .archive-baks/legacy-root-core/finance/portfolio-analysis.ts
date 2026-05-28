export function analyzePortfolio(investments: any[]) {
  const total = investments.reduce((sum, i) => sum + Number(i.currentValue || 0), 0);

  const byType: Record<string, number> = {};

  for (const inv of investments) {
    const type = inv.type || 'Outros';
    const value = Number(inv.currentValue || 0);

    byType[type] = (byType[type] || 0) + value;
  }

  const distribution = Object.entries(byType).map(([type, value]) => ({
    type,
    value,
    percent: total > 0 ? (value / total) * 100 : 0,
  }));

  return {
    total,
    distribution,
  };
}

export function getPortfolioInsights(distribution: any[]) {
  let score = 10;
  const alerts: string[] = [];

  const crypto = distribution.find(d => d.type === 'Criptomoedas')?.percent || 0;
  const rendaFixa = distribution.find(d => d.type === 'Renda Fixa')?.percent || 0;

  if (crypto > 30) {
    score -= 3;
    alerts.push('Alta exposição em cripto (risco elevado)');
  }

  if (rendaFixa < 10) {
    score -= 2;
    alerts.push('Baixa proteção em renda fixa');
  }

  if (distribution.length < 3) {
    score -= 2;
    alerts.push('Carteira pouco diversificada');
  }

  return {
    score: Math.max(score, 0),
    alerts,
  };
}
