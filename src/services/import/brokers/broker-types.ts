export interface BrokerDetectedDocument {
  source: 'XP' | 'BTG' | 'CLEAR' | 'RICO' | 'INTER' | 'UNKNOWN';
  documentType: 'CUSTODY' | 'INCOME' | 'BROKERAGE_NOTE' | 'LEDGER' | 'UNKNOWN';
  format: 'PDF' | 'XLSX' | 'CSV';
  schemaKey: string | null;
  confidence: number;
  reason: string;
}

export interface BrokerPosition {
  id?: string;
  source: string; // e.g. "XP"
  broker: string; // e.g. "XP"
  documentType: string; // e.g. "CUSTODY"
  ticker: string;
  name: string;
  assetType: string; // "ACOES" | "FII" | "ETF" | "TESOURO" | "RENDA_FIXA" | "UNKNOWN"
  institution: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  year: number;
  dedupeKey: string;
}

export interface BrokerIncome {
  id?: string;
  source: string;
  broker: string;
  ticker: string;
  type: string; // "Dividendo" | "Juros Sobre Capital Próprio" | "Rendimento" | ...
  amount: number;
  date?: string;
  year: number;
  dedupeKey: string;
}

export interface BrokerTransaction {
  id?: string;
  source: string;
  broker: string;
  ticker: string;
  operation: string; // "C" | "V" | "Compra" | "Venda"
  quantity: number;
  price: number;
  amount: number;
  date: string;
  fees?: number;
  dedupeKey: string;
}

export interface BrokerImportMetrics {
  rawTextLength?: number;
  positionsCount: number;
  incomeCount: number;
  transactionsCount: number;
  executionTimeMs: number;
}

export interface BrokerImportResult {
  detected: BrokerDetectedDocument;
  positions: BrokerPosition[];
  dividends: BrokerIncome[];
  transactions: BrokerTransaction[];
  errors: string[];
  warnings?: string[];
  metrics: BrokerImportMetrics;
}
