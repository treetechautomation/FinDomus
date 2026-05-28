const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'XRP', 'ADA', 'TRX', 'AAVE', 'XLM',
  'DOT', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC', 'NEAR', 'ALGO',
]);

const FII_SYMBOLS = new Set([
  'MXRF11', 'KNCR11', 'BTRA11', 'SDIL11', 'BTAI11', 'CVBI11', 'HSML11', 'HCTR11',
  'HGLG11', 'VINO11', 'VISC11', 'BTLG11', 'XPML11', 'RBRF11', 'HGRU11', 'BCFF11',
  'DEVA11', 'FLRP11', 'GARE11', 'IRFM11', 'KNIP11', 'LVBI11', 'MCHY11', 'MARI11',
  'OUJP11', 'PATC11', 'PORD11', 'PRTS11', 'RECT11', 'RZTR11', 'SCPF11', 'SDCO11',
  'SHPH11', 'SULA11', 'TEMP11', 'TRBL11', 'TRFO11', 'VGIR11', 'XPLG11', 'XPSA11',
]);

const BANCO_SYMBOLS = new Set([
  'ITUB4', 'ITUB3', 'ITUB4.SA', 'ITUB3.SA',
  'ITSA3', 'ITSA4', 'ITSA3.SA', 'ITSA4.SA',
  'BBAS3', 'BBAS3.SA',
  'BBDC4', 'BBDC3', 'BBDC4.SA', 'BBDC3.SA',
  'SANB11', 'SANB11.SA',
  'BPAC11', 'BPAC11.SA',
]);

const SANEAMENTO_SYMBOLS = new Set([
  'CSMG3', 'CSMG3.SA',
  'SAPR4', 'SAPR4.SA',
  'CSED3', 'CSED3.SA',
  'ALUP4', 'ALUP4.SA',
]);

const ACAO_NACIONAL_TOP = new Set([
  'PETR4', 'PETR3', 'PETR4.SA', 'PETR3.SA',
  'VALE3', 'VALE3.SA',
  'WEGE3', 'WEGE3.SA',
  'MGLU3', 'MGLU3.SA',
  'EMBR3', 'EMBR3.SA',
  'ABEV3', 'ABEV3.SA',
  'B3SA3', 'B3SA3.SA',
  'LREN3', 'LREN3.SA',
  'RDOR3', 'RDOR3.SA',
  'SBFG3', 'SBFG3.SA',
  'MDIA3', 'MDIA3.SA',
]);

const ACAO_INTERNACIONAL_TOP = new Set([
  'AMZN', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOG', 'META', 'AMZN.US', 'AAPL.US', 'MSFT.US',
  'NVDA.US', 'TSLA.US', 'GOOG.US', 'META.US',
  'NFLX', 'AMD', 'INTC', 'CSCO', 'ORCL', 'IBM', 'ORCL.US', 'IBM.US', 'NFLX.US',
]);

const TICKER_NAMES: Record<string, string> = {
  // Criptomoedas
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin',
  SOL: 'Solana',
  XRP: 'Ripple',
  ADA: 'Cardano',
  TRX: 'Tron',
  AAVE: 'Aave',
  XLM: 'Stellar',
  DOT: 'Polkadot',
  DOGE: 'Dogecoin',
  AVAX: 'Avalanche',
  MATIC: 'Polygon',
  LINK: 'Chainlink',
  UNI: 'Uniswap',
  ATOM: 'Cosmos',
  LTC: 'Litecoin',
  NEAR: 'NEAR Protocol',
  ALGO: 'Algorand',

  // FIIs
  MXRF11: 'Maxi Renda',
  KNCR11: 'KCH Real Estate',
  BTRA11: 'Brazil Real Estate',
  SDIL11: 'SDI Logística',
  BTAI11: 'BTG Pactual Imobiliário',
  CVBI11: 'CVI Imóveis',
  HSML11: 'HSI Mall',
  HCTR11: 'HCTR11',
  HGLG11: 'HGLG11',
  VINO11: 'Vino Partners',
  VISC11: 'VISC11',
  BTLG11: 'BTLG11',
  XPML11: 'XP Malls',
  RBRF11: 'RBR Properties',
  HGRU11: 'Hygge',
  BCFF11: 'Biciclo',
  DEVA11: 'Devant',
  FLRP11: 'Floripa',
  GARE11: 'Gaia Energia',
  IRFM11: 'Iridium',
  KNIP11: 'Kona',
  LVBI11: 'Villa',
  MCHY11: 'MCHY11',
  MARI11: 'Mari',
  OUJP11: 'OUJP11',
  PATC11: 'Pátria',
  PORD11: 'Pord',
  PRTS11: 'Priot',
  RECT11: 'Rect',
  RZTR11: 'RZTR11',
  SCPF11: 'SCPF11',
  SDCO11: 'SDCO11',
  SHPH11: 'Shopping',
  SULA11: 'Sul',
  TEMP11: 'Temp',
  TRBL11: 'Tribal',
  TRFO11: 'TRFO11',
  VGIR11: 'Vinci',
  XPLG11: 'XP Log',
  XPSA11: 'XPSA11',

  // Bancos
  ITUB4: 'Itaú Unibanco',
  ITUB3: 'Itaú Unibanco',
  ITSA3: 'Itaúsa',
  ITSA4: 'Itaúsa',
  BBAS3: 'Banco do Brasil',
  BBDC4: 'Bradesco',
  SANB11: 'Santander',
  BPAC11: 'Banco BTG',

  // Saneamento
  CSMG3: 'Copasa',
  SAPR4: 'Sanepar',
  CSED3: 'Cesp',
  ALUP4: 'Alupar',

  // Ações Nacionais
  PETR4: 'Petrobras',
  PETR3: 'Petrobras',
  VALE3: 'Vale',
  WEGE3: 'WEG',
  MGLU3: 'Magazine Luiza',
  EMBR3: 'Embraer',
  ABEV3: 'Ambev',
  B3SA3: 'B3',
  LREN3: 'Lojas Renner',
  RDOR3: 'RD',
  SBFG3: 'Grupo SBF',
  MDIA3: 'M.Dias Branco',

  // Ações Internacionais
  AMZN: 'Amazon',
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'NVIDIA',
  TSLA: 'Tesla',
  GOOG: 'Alphabet',
  META: 'Meta Platforms',
  NFLX: 'Netflix',
  AMD: 'AMD',
  INTC: 'Intel',
  CSCO: 'Cisco',
  ORCL: 'Oracle',
  IBM: 'IBM',

  // Macro
  'USD/BRL': 'Dólar/Real',
  SELIC: 'Taxa Selic',
  CDI: 'Taxa CDI',
  IPCA: 'IPCA',
};

export type AssetType = 
  | 'Criptomoedas'
  | 'Fundos Imobiliários'
  | 'Ações Nacionais'
  | 'Ações Internacionais'
  | 'Renda Fixa'
  | 'Outros';

export type ResolvedAsset = {
  symbol: string;
  normalizedSymbol: string;
  name: string;
  type: AssetType;
  source: 'resolve' | 'catalog';
  exchange?: string;
  currency?: string;
};

export function resolveAssetType(ticker: string): AssetType {
  const t = ticker.toUpperCase().replace('.SA', '').replace('.US', '');
  
  if (CRYPTO_SYMBOLS.has(t)) return 'Criptomoedas';
  if (FII_SYMBOLS.has(t)) return 'Fundos Imobiliários';
  if (BANCO_SYMBOLS.has(t)) return 'Ações Nacionais';
  if (SANEAMENTO_SYMBOLS.has(t)) return 'Ações Nacionais';
  if (ACAO_NACIONAL_TOP.has(t)) return 'Ações Nacionais';
  if (ACAO_INTERNACIONAL_TOP.has(t)) return 'Ações Internacionais';
  
  // Check if it's a B3 stock (ends with 3 or 4 or 11)
  if (/^[A-Z]{4}(3|4|11)$/.test(t)) return 'Ações Nacionais';
  
  return 'Outros';
}

export function normalizeSymbol(ticker: string): string {
  return ticker.toUpperCase().trim()
    .replace(/\.SA$/i, '')
    .replace(/\.US$/i, '')
    .replace(/^R\$/i, '')
    .trim();
}

export function getExchange(ticker: string, type: AssetType): string {
  const t = normalizeSymbol(ticker);
  
  if (type === 'Criptomoedas') return 'Binance';
  if (type === 'Ações Internacionais') return 'NYSE/NASDAQ';
  if (type === 'Fundos Imobiliários') return 'B3';
  
  // Default to B3 for Brazilian stocks
  if (/^[A-Z]{4}(3|4|11)$/.test(t)) return 'B3';
  
  return 'B3';
}

export function getCurrency(type: AssetType): string {
  if (type === 'Criptomoedas' || type === 'Ações Internacionais') return 'USD';
  return 'BRL';
}

export function resolveAsset(ticker: string): ResolvedAsset | null {
  if (!ticker || ticker.trim().length === 0) return null;
  
  const normalized = normalizeSymbol(ticker);
  if (normalized.length < 2) return null;
  
  const type = resolveAssetType(normalized);
  const name = TICKER_NAMES[normalized] || normalized;
  const exchange = getExchange(normalized, type);
  const currency = getCurrency(type);
  
  return {
    symbol: normalized,
    normalizedSymbol: normalized,
    name,
    type,
    source: 'resolve',
    exchange,
    currency,
  };
}

export function isCryptoTicker(ticker: string): boolean {
  const t = normalizeSymbol(ticker);
  return CRYPTO_SYMBOLS.has(t);
}

export function isFiiTicker(ticker: string): boolean {
  const t = normalizeSymbol(ticker);
  return FII_SYMBOLS.has(t);
}

export function isB3Ticker(ticker: string): boolean {
  const t = normalizeSymbol(ticker);
  return /^[A-Z]{4}(3|4|11)$/.test(t) || FII_SYMBOLS.has(t);
}

export function isInternationalTicker(ticker: string): boolean {
  const t = normalizeSymbol(ticker);
  return ACAO_INTERNACIONAL_TOP.has(t) || t.endsWith('.US');
}