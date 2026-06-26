import { LayoutSchema } from './layout-types';

export const XpLedgerLayout: LayoutSchema = {
  id: 'XP_LEDGER_XLSX',
  broker: 'XP',
  documentType: 'LEDGER',
  format: 'XLSX',
  version: 'v1',
  confidence: 1.0,
  sheetSignatures: ['Movimentação'],
  sheetName: 'Movimentação',
  startRowOffset: 1, // Lançamentos começam na linha 2 (index 1)
  columns: {
    ticker: { aliases: ['produto', 'ativo'], index: 3, required: true },
    name: { aliases: ['produto', 'ativo'], index: 3, required: true },
    quantity: { aliases: ['quantidade', 'qtd'], index: 5 },
    averagePrice: { aliases: ['preço unitário', 'preco unitario'], index: 6 },
    amount: { aliases: ['valor da operação', 'valor da operacao', 'valor'], index: 7, required: true },
    operation: { aliases: ['movimentação', 'tipo de movimentação', 'historico', 'histórico'], index: 2, required: true },
    date: { aliases: ['data', 'data da operação'], index: 1, required: true }
  }
};
