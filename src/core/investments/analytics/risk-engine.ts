import type { ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import type { RiskAnalytics, ConcentrationAlert, AllocationItem, AllocationBreakdown } from './types';

export function calculateRisk(
  portfolio: ConsolidatedPortfolio,
  allocation: AllocationBreakdown
): RiskAnalytics {
  const total = portfolio.totalMarketValue || 0;
  const alerts: ConcentrationAlert[] = [];

  // 1. Asset Concentration Breakdown
  const assetConcentration: AllocationItem[] = portfolio.assets.map((asset) => ({
    name: asset.ticker,
    value: asset.marketValue,
    percentage: asset.participationPercent,
  }));

  // 2. Institution Concentration Breakdown
  const institutionConcentration = allocation.byInstitution;

  // 3. Sector Concentration Breakdown
  const sectorConcentration = allocation.bySector;

  // 4. Country Concentration Breakdown
  const countrySummary: Record<string, number> = { Brasil: 0, 'EUA / Global': 0, 'Cripto (Global)': 0 };
  for (const asset of portfolio.assets) {
    if (asset.assetClass === 'Criptomoedas') {
      countrySummary['Cripto (Global)'] += asset.marketValue;
    } else if (
      asset.assetClass === 'Ações Internacionais' ||
      asset.assetClass === 'REITs' ||
      asset.assetClass === 'Renda Fixa Internacional'
    ) {
      countrySummary['EUA / Global'] += asset.marketValue;
    } else {
      countrySummary['Brasil'] += asset.marketValue;
    }
  }

  const countryConcentration: AllocationItem[] = Object.entries(countrySummary)
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 5. Liquidity calculation (Fixed income and cash equivalents)
  const liquidityValue = portfolio.assets
    .filter((asset) => asset.assetClass === 'Renda Fixa')
    .reduce((acc, asset) => acc + asset.marketValue, 0);
  const liquidityPercent = total > 0 ? (liquidityValue / total) * 100 : 0;

  // 6. Alert Detection Rules
  // Asset concentration alerts
  for (const item of assetConcentration) {
    if (item.percentage > 35) {
      alerts.push({
        type: 'asset',
        name: item.name,
        percentage: item.percentage,
        threshold: 35,
        severity: 'danger',
        message: `Concentração crítica: ${item.name} representa ${item.percentage.toFixed(1)}% do seu portfólio.`,
      });
    } else if (item.percentage > 20) {
      alerts.push({
        type: 'asset',
        name: item.name,
        percentage: item.percentage,
        threshold: 20,
        severity: 'warning',
        message: `Concentração elevada: ${item.name} representa ${item.percentage.toFixed(1)}% do seu portfólio.`,
      });
    }
  }

  // Institution concentration alerts
  for (const item of institutionConcentration) {
    if (item.percentage > 75) {
      alerts.push({
        type: 'institution',
        name: item.name,
        percentage: item.percentage,
        threshold: 75,
        severity: 'danger',
        message: `Dependência extrema da instituição ${item.name} (${item.percentage.toFixed(1)}%). Riscos operacionais elevados.`,
      });
    } else if (item.percentage > 50) {
      alerts.push({
        type: 'institution',
        name: item.name,
        percentage: item.percentage,
        threshold: 50,
        severity: 'warning',
        message: `Mais de metade da sua carteira está custodiada na ${item.name} (${item.percentage.toFixed(1)}%). Considere diversificar.`,
      });
    }
  }

  // Sector concentration alerts
  for (const item of sectorConcentration) {
    if (item.percentage > 45) {
      alerts.push({
        type: 'sector',
        name: item.name,
        percentage: item.percentage,
        threshold: 45,
        severity: 'danger',
        message: `Exposição crítica ao setor "${item.name}" (${item.percentage.toFixed(1)}%).`,
      });
    } else if (item.percentage > 30) {
      alerts.push({
        type: 'sector',
        name: item.name,
        percentage: item.percentage,
        threshold: 30,
        severity: 'warning',
        message: `Exposição elevada ao setor "${item.name}" (${item.percentage.toFixed(1)}%).`,
      });
    }
  }

  // Low Diversification
  const numAssets = portfolio.assets.length;
  if (numAssets < 3) {
    alerts.push({
      type: 'asset',
      name: 'Portfólio Geral',
      percentage: 100,
      threshold: 0,
      severity: 'danger',
      message: `Diversificação crítica: Seu portfólio possui apenas ${numAssets} ativo(s). Adicione novos ativos para diluir riscos.`,
    });
  } else if (numAssets < 5) {
    alerts.push({
      type: 'asset',
      name: 'Portfólio Geral',
      percentage: 100,
      threshold: 0,
      severity: 'warning',
      message: `Diversificação baixa: Seu portfólio possui apenas ${numAssets} ativos.`,
    });
  }

  // Exchange/Country exposure alerts
  const brazilExposure = countrySummary['Brasil'] || 0;
  const brazilExposurePercent = total > 0 ? (brazilExposure / total) * 100 : 0;
  if (brazilExposurePercent > 95 && total > 2000) {
    alerts.push({
      type: 'country',
      name: 'Brasil',
      percentage: brazilExposurePercent,
      threshold: 95,
      severity: 'info',
      message: 'Exposição geográfica concentrada no Brasil (100%). Considere diversificar parte em ativos globais (USD).',
    });
  }

  // Low Liquidity Alert
  if (liquidityPercent < 10 && total > 1000) {
    alerts.push({
      type: 'currency',
      name: 'Liquidez',
      percentage: liquidityPercent,
      threshold: 10,
      severity: 'warning',
      message: `Reserva de liquidez baixa: Renda Fixa representa apenas ${liquidityPercent.toFixed(1)}% da carteira.`,
    });
  }

  // 7. Diversification Score (0-100)
  let diversificationScore = 100;
  if (numAssets < 3) diversificationScore -= 40;
  else if (numAssets < 6) diversificationScore -= 20;
  else if (numAssets < 10) diversificationScore -= 5;

  const numClasses = allocation.byClass.length;
  if (numClasses === 1) diversificationScore -= 30;
  else if (numClasses === 2) diversificationScore -= 15;

  const numSectors = sectorConcentration.length;
  if (numSectors === 1) diversificationScore -= 20;
  else if (numSectors === 2) diversificationScore -= 10;

  diversificationScore = Math.max(10, Math.min(100, diversificationScore));

  return {
    concentrationAlerts: alerts,
    diversificationScore,
    liquidityPercent,
    assetConcentration,
    institutionConcentration,
    sectorConcentration,
    countryConcentration,
  };
}
