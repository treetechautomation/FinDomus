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

// ==========================================
// Normalized types (CORRETORAS.3.5)
// ==========================================

export type ImportDecisionStatus = 'NEW' | 'UPDATE' | 'DUPLICATE' | 'CONFLICT' | 'IGNORE';

export interface ImportDecision {
  status: ImportDecisionStatus;
  reason: string;
  matchedId?: string;
}

export interface ImportDecisionSummary {
  total: number;
  newCount: number;
  updateCount: number;
  duplicateCount: number;
  conflictCount: number;
  ignoredCount: number;
}

export interface ImportComparisonResult {
  positions: NormalizedBrokerPosition[];
  income: NormalizedBrokerIncome[];
  transactions: NormalizedBrokerTransaction[];
  decisionSummary: ImportDecisionSummary;
}

export interface NormalizedBrokerMetadata {
  source: 'XP' | 'BTG' | 'CLEAR' | 'RICO' | 'INTER' | 'UNKNOWN';
  broker: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  documentType: 'CUSTODY' | 'INCOME' | 'BROKERAGE_NOTE' | 'LEDGER' | 'UNKNOWN';
  schemaKey: string | null;
  confidence: number;
  fileName: string;
  year: number;
  generatedAt: string;
}

export interface NormalizedBrokerPosition {
  source: string;
  broker: string;
  documentType: string;
  ticker: string;
  assetType: string;
  name: string;
  institution: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  currency: string;
  acquisitionDate?: string;
  year: number;
  dedupeKey: string;
  raw: any;
  decision?: ImportDecision;
}

export interface NormalizedBrokerIncome {
  source: string;
  broker: string;
  ticker: string;
  incomeType: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  year: number;
  dedupeKey: string;
  raw: any;
  decision?: ImportDecision;
}

export interface NormalizedBrokerTransaction {
  source: string;
  broker: string;
  ticker: string;
  operation: string;
  quantity: number;
  price: number;
  grossAmount: number;
  netAmount?: number;
  fees: number;
  taxes: number;
  date: string;
  currency: string;
  dedupeKey: string;
  raw: any;
  decision?: ImportDecision;
}

export interface NormalizedBrokerImportMetrics {
  positionsCount: number;
  incomeCount: number;
  transactionsCount: number;
  totalMarketValue: number;
  totalIncome: number;
  totalTransactionsAmount: number;
  buyCount: number;
  sellCount: number;
  warningsCount: number;
  errorsCount: number;
  processingTimeMs: number;
}

export interface NormalizedBrokerImport {
  metadata: NormalizedBrokerMetadata;
  positions: NormalizedBrokerPosition[];
  income: NormalizedBrokerIncome[];
  transactions: NormalizedBrokerTransaction[];
  warnings: string[];
  errors: string[];
  metrics: NormalizedBrokerImportMetrics;
  decisionSummary?: ImportDecisionSummary;
}
