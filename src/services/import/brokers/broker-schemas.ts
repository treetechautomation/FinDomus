export interface ExcelColumnMapping {
  ticker?: number;
  name?: number;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  marketValue?: number;
  operation?: number;
  date?: number;
  amount?: number;
  description?: number;
}

export interface ExcelSchemaConfig {
  source: 'XP' | 'BTG' | 'CLEAR' | 'RICO' | 'INTER' | 'UNKNOWN';
  documentType: 'CUSTODY' | 'INCOME' | 'BROKERAGE_NOTE' | 'LEDGER' | 'UNKNOWN';
  format: 'XLSX' | 'CSV';
  sheetName: string;
  startRow: number;
  columns: ExcelColumnMapping;
}

export const BROKER_SCHEMAS: Record<string, ExcelSchemaConfig> = {
  XP_CUSTODY_XLSX: {
    source: 'XP',
    documentType: 'CUSTODY',
    format: 'XLSX',
    sheetName: 'Sua carteira',
    startRow: 0, // Ações, Tesouro Direto, Fundos são varridos verticalmente de forma dinâmica
    columns: {
      ticker: 0,
      name: 0,
      quantity: 6,
      averagePrice: 4,
      currentPrice: 5,
      marketValue: 1
    }
  },
  XP_LEDGER_XLSX: {
    source: 'XP',
    documentType: 'LEDGER',
    format: 'XLSX',
    sheetName: 'Movimentação',
    startRow: 1, // Lançamentos começam na linha 2 (index 1)
    columns: {
      ticker: 3, // "Produto" ex: "SUZB3 - SUZANO S.A."
      name: 3,
      quantity: 5,
      averagePrice: 6, // "Preço unitário"
      amount: 7, // "Valor da Operação"
      operation: 2, // "Movimentação" ex: "Juros Sobre Capital Próprio", "Dividendo", etc.
      date: 1 // "Data"
    }
  },
  BTG_LEDGER_XLSX: {
    source: 'BTG',
    documentType: 'LEDGER',
    format: 'XLSX',
    sheetName: 'Extrato',
    startRow: 11, // Lançamentos começam após os metadados (linha 12 / index 11)
    columns: {
      date: 1, // "Data e hora"
      operation: 3, // "Transação" ex: "Pix recebido", "Pix enviado"
      description: 5, // "Descrição"
      amount: 9 // "Valor"
    }
  }
};
