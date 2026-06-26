import type { ConsolidatedPortfolio } from '@/services/investments/consolidation-engine';
import type { AllocationBreakdown, AllocationItem } from './types';

export function calculateAllocation(portfolio: ConsolidatedPortfolio): AllocationBreakdown {
  const total = portfolio.totalMarketValue || 0;

  const makeItems = (summary: Record<string, number>): AllocationItem[] => {
    return Object.entries(summary)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const byClass = makeItems(portfolio.classesSummary);
  const byInstitution = makeItems(portfolio.institutionsSummary);
  const byOrigin = makeItems(portfolio.originsSummary);

  // Currency Allocation
  const currencySummary: Record<string, number> = { BRL: 0, USD: 0 };
  for (const asset of portfolio.assets) {
    const isUSD =
      asset.assetClass === 'Ações Internacionais' ||
      asset.assetClass === 'REITs' ||
      asset.assetClass === 'Renda Fixa Internacional' ||
      asset.assetClass === 'Criptomoedas';
    
    const currency = isUSD ? 'USD' : 'BRL';
    currencySummary[currency] += asset.marketValue;
  }
  const byCurrency = makeItems(currencySummary);

  // Sector Allocation
  const sectorSummary: Record<string, number> = {};
  for (const asset of portfolio.assets) {
    const sector = getAssetSector(asset.ticker, asset.assetClass);
    sectorSummary[sector] = (sectorSummary[sector] || 0) + asset.marketValue;
  }
  const bySector = makeItems(sectorSummary);

  return {
    byClass,
    byInstitution,
    byOrigin,
    byCurrency,
    bySector,
  };
}

export function getAssetSector(ticker: string, assetClass: string): string {
  const cleanTicker = (ticker || '').trim().toUpperCase();

  // 1. Fixed Income & Cash
  if (assetClass === 'Renda Fixa' || assetClass === 'Renda Fixa Internacional') {
    return 'Renda Fixa (Títulos)';
  }

  // 2. Cryptocurrencies
  if (assetClass === 'Criptomoedas') {
    return 'Criptoativos';
  }

  // 3. REITs
  if (assetClass === 'REITs') {
    return 'REITs (Imobiliário Global)';
  }

  // 4. International Equities
  if (assetClass === 'Ações Internacionais') {
    return 'Ações Globais';
  }

  // 5. Brazilian FIIs
  if (assetClass === 'Fundos Imobiliários' || cleanTicker.endsWith('11')) {
    // Papel / Recebíveis
    const papel = ['MXRF11', 'KNIP11', 'KNSC11', 'CPTS11', 'HGCR11', 'RBRY11', 'IRDM11', 'RECR11', 'VSLH11', 'MCCI11', 'DEVA11', 'HCTR11', 'BARI11', 'CACR11', 'KNCR11', 'OUJP11'];
    if (papel.some(t => cleanTicker.includes(t))) return 'FII - Recebíveis (Papel)';

    // Logística / Galpões
    const log = ['HGLG11', 'XPLG11', 'BTLG11', 'BRCO11', 'ALZR11', 'GALG11', 'TRXF11', 'LVBI11', 'SDIL11', 'VILG11', 'GGRC11', 'RBRL11'];
    if (log.some(t => cleanTicker.includes(t))) return 'FII - Logística e Industrial';

    // Shoppings
    const shopping = ['XPML11', 'VISC11', 'MALL11', 'HGBS11', 'HSML11', 'WPLZ11', 'FIGS11', 'SHPH11'];
    if (shopping.some(t => cleanTicker.includes(t))) return 'FII - Shopping Centers';

    // Lajes
    const lajes = ['KNRI11', 'JSRE11', 'BRCR11', 'HGRE11', 'PVBI11', 'RECT11', 'VINO11', 'RCRB11', 'TBOF11', 'PATC11'];
    if (lajes.some(t => cleanTicker.includes(t))) return 'FII - Lajes Corporativas';

    // Híbrido / FoFs / Incorporação
    const hibrido = ['HGRU11', 'TGAR11', 'RBRR11', 'URPR11', 'HFOF11', 'BCFF11', 'KFOF11', 'HGFF11', 'BPFF11', 'XPFF11', 'RBRF11', 'MGFF11', 'OUFF11'];
    if (hibrido.some(t => cleanTicker.includes(t))) return 'FII - Híbrido e Fundos de Fundos';

    return 'FII - Outros';
  }

  // 6. Brazilian Equities (Ações Nacionais)
  const tickerPrefix = cleanTicker.slice(0, 4);

  // Mineração / Siderurgia
  if (['VALE', 'CSNA', 'GGBR', 'USIM', 'GOAU'].includes(tickerPrefix)) {
    return 'Mineração e Siderurgia';
  }
  // Petróleo / Gás
  if (['PETR', 'PRIO', 'RECV', 'ENAT', 'RRRP', 'UGPA', 'VBBR', 'RUMO'].includes(tickerPrefix)) {
    return 'Petróleo, Gás e Combustíveis';
  }
  // Bancos / Seguros
  if (['ITUB', 'BBDC', 'BBAS', 'SANB', 'BPAC', 'BBSE', 'CXSE', 'PSSA', 'IRBR', 'ABCB', 'BRSR'].includes(tickerPrefix)) {
    return 'Financeiro (Bancos e Seguros)';
  }
  // Energia Elétrica
  if (['AURE', 'EGIE', 'ALUP', 'TAEE', 'TRPL', 'CPFE', 'ENGI', 'EQTL', 'CMIG', 'ENEV', 'NEOE', 'CESP', 'CPLE'].includes(tickerPrefix)) {
    return 'Utilidades Públicas (Energia)';
  }
  // Saneamento
  if (['SBSP', 'SANE', 'SAPR', 'CSMG'].includes(tickerPrefix)) {
    return 'Utilidades Públicas (Saneamento)';
  }
  // Telecom
  if (['VIVT', 'TIMS', 'OIBR'].includes(tickerPrefix)) {
    return 'Telecomunicações';
  }
  // Bens Industriais
  if (['WEGE', 'TUPY', 'POMO', 'RAPT', 'KEPL', 'EMBR', 'FRAS'].includes(tickerPrefix)) {
    return 'Bens Industriais e Metalurgia';
  }
  // Varejo / Consumo Cíclico
  if (['MGLU', 'VIIA', 'BHIA', 'LREN', 'AMER', 'ARZZ', 'SOMA', 'CYRE', 'MRVE', 'EZTC', 'CVCB', 'LJQQ', 'ALPA', 'GUAR'].includes(tickerPrefix)) {
    return 'Consumo Cíclico e Varejo';
  }
  // Consumo Não Cíclico
  if (['NTCO', 'CRFB', 'ASAI', 'JBSS', 'MRFG', 'BEEF', 'BRFS', 'ABEV', 'SMTO', 'SLCE', 'MDIA', 'CAML'].includes(tickerPrefix)) {
    return 'Consumo Não Cíclico e Alimentos';
  }
  // Saúde
  if (['HAPV', 'FLRY', 'RDOR', 'ODPV', 'PARD', 'QUAL', 'BIOM'].includes(tickerPrefix)) {
    return 'Saúde e Diagnósticos';
  }
  // Locação
  if (['RENT', 'LCAM', 'MOVI', 'UNIP'].includes(tickerPrefix)) {
    return 'Locação de Ativos';
  }
  // Bolsa
  if (['B3SA', 'CIEL'].includes(tickerPrefix)) {
    return 'Serviços Financeiros Diversos';
  }

  return 'Outros Setores';
}
