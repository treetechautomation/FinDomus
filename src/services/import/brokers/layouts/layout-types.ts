export interface ColumnConfig {
  aliases: string[];
  index?: number;
  required?: boolean;
}

export interface SectionMarker {
  anchor: string;
  assetType: 'ACOES' | 'TESOURO' | 'FII' | 'RENDA_FIXA' | 'ETF' | 'UNKNOWN';
  tickerResolver?: 'split_space' | 'first_word' | 'direct';
  columns?: {
    ticker?: ColumnConfig;
    name?: ColumnConfig;
    quantity?: ColumnConfig;
    averagePrice?: ColumnConfig;
    currentPrice?: ColumnConfig;
    marketValue?: ColumnConfig;
  };
  calculate?: {
    averagePrice?: 'applied_div_quantity';
    currentPrice?: 'market_div_quantity';
  };
}

export interface LayoutSchema {
  id: string; // unique schema key (e.g. "XP_CUSTODY_XLSX")
  broker: 'XP' | 'BTG' | 'CLEAR' | 'RICO' | 'INTER' | 'UNKNOWN';
  documentType: 'CUSTODY' | 'INCOME' | 'BROKERAGE_NOTE' | 'LEDGER' | 'UNKNOWN';
  format: 'XLSX' | 'CSV' | 'PDF';
  version: string; // e.g. "v1", "2023", etc.
  confidence: number;
  
  // Signatures for automatic detection
  sheetSignatures?: string[]; // Sheets that must exist in XLSX
  textSignatures?: string[];  // Text patterns that must match in file content/PDF
  
  // Sheet configurations
  sheetName?: string;
  headerRowAnchor?: string;   // cells matching header
  startRowOffset?: number;    // start offset from header row or fixed start row index
  stopRowAnchor?: string;     // cell value that stops parsing
  
  // Global column mappings (if no sections, or shared)
  columns: {
    ticker?: ColumnConfig;
    name?: ColumnConfig;
    quantity?: ColumnConfig;
    averagePrice?: ColumnConfig;
    currentPrice?: ColumnConfig;
    marketValue?: ColumnConfig;
    operation?: ColumnConfig;
    date?: ColumnConfig;
    amount?: ColumnConfig;
    description?: ColumnConfig;
    fees?: ColumnConfig;
    taxes?: ColumnConfig;
  };
  
  // Section definitions (for vertical multi-section sheets)
  sections?: SectionMarker[];
  
  // Operation translation maps
  operationMap?: Record<string, string>;
}
