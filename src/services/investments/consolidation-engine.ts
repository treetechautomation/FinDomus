import { getInvestments } from '@/services/firestore/investments';
import { getB3Positions, getB3Income } from '@/services/firestore/b3-investments';
import { getBrokerPositions, getBrokerIncome } from '@/services/firestore/broker-investments';
import { getInvestmentYields } from '@/services/firestore/yields';

export interface ConsolidatedOrigin {
  source: string;
  quantity: number;
  averagePrice: number;
  marketValue: number;
  institution: string;
  year?: number;
}

export interface ConsolidatedAsset {
  ticker: string;
  name: string;
  assetClass: string;
  totalQuantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  profit: number;
  profitPercent: number;
  dividendYield: number;
  yieldOnCost: number;
  participationPercent: number;
  origins: ConsolidatedOrigin[];
  institutions: string[];
  lastUpdate: string;
}

export interface ConsolidatedPortfolio {
  assets: ConsolidatedAsset[];
  totalMarketValue: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPercent: number;
  originsSummary: Record<string, number>;
  institutionsSummary: Record<string, number>;
  classesSummary: Record<string, number>;
}

export async function consolidatePortfolio(userId: string): Promise<ConsolidatedPortfolio> {
  if (!userId) {
    return {
      assets: [],
      totalMarketValue: 0,
      totalInvested: 0,
      totalProfit: 0,
      totalProfitPercent: 0,
      originsSummary: {},
      institutionsSummary: {},
      classesSummary: {}
    };
  }

  // Fetch all investments data concurrently
  const [
    manualInvestments,
    b3Positions,
    b3Income,
    brokerPositions,
    brokerIncome,
    manualYields
  ] = await Promise.all([
    getInvestments(userId),
    getB3Positions(userId),
    getB3Income(userId),
    getBrokerPositions(userId),
    getBrokerIncome(userId),
    getInvestmentYields(userId)
  ]);

  // Find latest years for snapshots
  const b3LatestYear = b3Positions.length > 0 ? Math.max(...b3Positions.map(p => p.year)) : 0;
  const brokerLatestYear = brokerPositions.length > 0 ? Math.max(...brokerPositions.map(p => p.year)) : 0;

  // Filter positions to keep only the latest year
  const activeB3Positions = b3Positions.filter(p => p.year === b3LatestYear);
  const activeBrokerPositions = brokerPositions.filter(p => p.year === brokerLatestYear);

  // Group items by ticker
  const tickerGroups: Record<string, {
    ticker: string;
    name: string;
    assetClass: string;
    origins: ConsolidatedOrigin[];
    lastUpdate: string;
  }> = {};

  const getOrInitGroup = (rawTicker: string, rawName: string, rawClass: string, updatedAtStr?: string) => {
    const ticker = (rawTicker || 'Sem Ticker').trim().toUpperCase();
    const assetClass = normalizeAssetClass(rawClass);
    if (!tickerGroups[ticker]) {
      tickerGroups[ticker] = {
        ticker,
        name: rawName || ticker,
        assetClass,
        origins: [],
        lastUpdate: updatedAtStr || new Date().toLocaleDateString('pt-BR')
      };
    }
    // Update name if we got a more descriptive one
    if (rawName && tickerGroups[ticker].name === ticker) {
      tickerGroups[ticker].name = rawName;
    }
    return tickerGroups[ticker];
  };

  // Process Manual
  for (const item of manualInvestments) {
    const ticker = item.ticker || item.institution || item.type || 'Manual';
    const group = getOrInitGroup(ticker, ticker, item.type, item.updatedAt || item.createdAt);
    
    const quantity = Number(item.quantity || 0);
    const averagePrice = Number(item.averagePrice || 0);
    const currentValue = Number(item.currentValue || (quantity * (item.currentPrice || averagePrice)) || 0);

    group.origins.push({
      source: 'Manual',
      quantity,
      averagePrice,
      marketValue: currentValue,
      institution: normalizeInstitution(item.institution)
    });
  }

  // Process B3 Positions
  for (const pos of activeB3Positions) {
    const group = getOrInitGroup(pos.ticker, pos.name, pos.type);
    group.origins.push({
      source: 'B3',
      quantity: pos.quantity,
      averagePrice: pos.price,
      marketValue: pos.marketValue,
      institution: normalizeInstitution(pos.institution),
      year: pos.year
    });
  }

  // Process Broker Positions
  for (const pos of activeBrokerPositions) {
    const group = getOrInitGroup(pos.ticker, pos.ticker, pos.assetType);
    group.origins.push({
      source: normalizeInstitution(pos.broker),
      quantity: pos.quantity,
      averagePrice: pos.averagePrice,
      marketValue: pos.marketValue,
      institution: normalizeInstitution(pos.institution),
      year: pos.year
    });
  }

  // Sum all yields by ticker
  const yieldsByTicker: Record<string, number> = {};
  
  // 1. Manual yields
  for (const y of manualYields) {
    const ticker = y.ticker.toUpperCase();
    yieldsByTicker[ticker] = (yieldsByTicker[ticker] || 0) + (y.amount || 0);
  }
  // 2. B3 yields
  for (const y of b3Income) {
    const ticker = y.ticker.toUpperCase();
    yieldsByTicker[ticker] = (yieldsByTicker[ticker] || 0) + (y.amount || 0);
  }
  // 3. Broker yields
  for (const y of brokerIncome) {
    const ticker = y.ticker.toUpperCase();
    yieldsByTicker[ticker] = (yieldsByTicker[ticker] || 0) + (y.amount || 0);
  }

  // Calculate consolidated assets
  const assets: ConsolidatedAsset[] = [];
  let totalMarketValue = 0;
  let totalInvested = 0;

  const originsSummary: Record<string, number> = {};
  const institutionsSummary: Record<string, number> = {};
  const classesSummary: Record<string, number> = {};

  for (const key of Object.keys(tickerGroups)) {
    const group = tickerGroups[key];
    
    let tickerQuantity = 0;
    let tickerMarketValue = 0;
    let tickerInvested = 0;
    const tickerInstitutions = new Set<string>();

    for (const orig of group.origins) {
      tickerQuantity += orig.quantity;
      tickerMarketValue += orig.marketValue;
      tickerInvested += orig.quantity * orig.averagePrice;
      tickerInstitutions.add(orig.institution);

      // Summarize metrics
      originsSummary[orig.source] = (originsSummary[orig.source] || 0) + orig.marketValue;
      institutionsSummary[orig.institution] = (institutionsSummary[orig.institution] || 0) + orig.marketValue;
    }

    classesSummary[group.assetClass] = (classesSummary[group.assetClass] || 0) + tickerMarketValue;
    totalMarketValue += tickerMarketValue;
    totalInvested += tickerInvested;

    const averagePrice = tickerQuantity > 0 ? tickerInvested / tickerQuantity : 0;
    const currentPrice = tickerQuantity > 0 ? tickerMarketValue / tickerQuantity : 0;
    const profit = tickerMarketValue - tickerInvested;
    const profitPercent = tickerInvested > 0 ? (profit / tickerInvested) * 100 : 0;

    const totalIncome = yieldsByTicker[group.ticker] || 0;
    const dividendYield = tickerMarketValue > 0 ? (totalIncome / tickerMarketValue) * 100 : 0;
    const yieldOnCost = tickerInvested > 0 ? (totalIncome / tickerInvested) * 100 : 0;

    assets.push({
      ticker: group.ticker,
      name: group.name,
      assetClass: group.assetClass,
      totalQuantity: tickerQuantity,
      averagePrice,
      currentPrice,
      marketValue: tickerMarketValue,
      profit,
      profitPercent,
      dividendYield,
      yieldOnCost,
      participationPercent: 0, // calculated next
      origins: group.origins,
      institutions: Array.from(tickerInstitutions),
      lastUpdate: group.lastUpdate
    });
  }

  // Calculate participation percentages
  for (const asset of assets) {
    asset.participationPercent = totalMarketValue > 0 ? (asset.marketValue / totalMarketValue) * 100 : 0;
  }

  // Sort assets by market value descending
  assets.sort((a, b) => b.marketValue - a.marketValue);

  const totalProfit = totalMarketValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return {
    assets,
    totalMarketValue,
    totalInvested,
    totalProfit,
    totalProfitPercent,
    originsSummary,
    institutionsSummary,
    classesSummary
  };
}

// Helpers
function normalizeAssetClass(rawType: string): string {
  const type = String(rawType || '').toUpperCase().trim();
  if (type.includes('ACOES') || type.includes('AÇÕES') || type.includes('AÇOES') || type === 'EQUITY') {
    if (type.includes('INTERNAC') || type.includes('GLOBAL') || type.includes('US')) {
      return 'Ações Internacionais';
    }
    return 'Ações Nacionais';
  }
  if (type.includes('FII') || type.includes('FUNDO IMOBILIARIO') || type.includes('FUNDO IMOBILIÁRIO') || type.includes('IMOBILIÁRIO')) {
    return 'Fundos Imobiliários';
  }
  if (type.includes('REIT')) {
    return 'REITs';
  }
  if (type.includes('CRIPTO') || type.includes('BITCOIN') || type.includes('ETHEREUM')) {
    return 'Criptomoedas';
  }
  if (type.includes('TESOURO') || type.includes('TD') || type.includes('SOBERANO')) {
    return 'Renda Fixa';
  }
  if (type.includes('RENDA FIXA') || type.includes('CDB') || type.includes('LCI') || type.includes('LCA') || type.includes('DEBENTURE') || type.includes('POUPANCA')) {
    if (type.includes('INTERNAC')) {
      return 'Renda Fixa Internacional';
    }
    return 'Renda Fixa';
  }
  return 'Renda Fixa';
}

function normalizeInstitution(rawInst: string): string {
  const inst = String(rawInst || '').toUpperCase().trim();
  if (inst.includes('XP')) return 'XP';
  if (inst.includes('BTG')) return 'BTG';
  if (inst.includes('RICO')) return 'Rico';
  if (inst.includes('CLEAR')) return 'Clear';
  if (inst.includes('INTER')) return 'Inter';
  if (inst.includes('AGORA') || inst.includes('ÁGORA')) return 'Ágora';
  if (inst.includes('NUINVEST') || inst.includes('NUBANK')) return 'NuInvest';
  if (inst.includes('GENIAL')) return 'Genial';
  if (inst.includes('TORO')) return 'Toro';
  if (inst.includes('SAFRA')) return 'Safra';
  if (inst.includes('SANTANDER')) return 'Santander';
  if (inst.includes('ITAÚ') || inst.includes('ITAU')) return 'Itaú';
  if (inst.includes('BRADESCO')) return 'Bradesco';
  if (inst.includes('BRASIL') || inst.includes('BBAS')) return 'Banco do Brasil';
  if (inst.includes('CAIXA')) return 'Caixa';
  return rawInst ? rawInst.split(/\s+/)[0] : 'Manual';
}
