import { LayoutSchema } from './layout-types';

export const BtgLedgerLayout: LayoutSchema = {
  id: 'BTG_LEDGER_XLSX',
  broker: 'BTG',
  documentType: 'LEDGER',
  format: 'XLSX',
  version: 'v1',
  confidence: 1.0,
  sheetSignatures: ['Extrato'],
  textSignatures: ['Extrato de conta corrente', 'Cliente:'],
  sheetName: 'Extrato',
  startRowOffset: 11, // Lançamentos começam após os metadados (linha 12 / index 11)
  columns: {
    date: { aliases: ['data e hora', 'data'], index: 1, required: true },
    operation: { aliases: ['transação', 'transacao', 'categoria'], index: 3, required: true },
    description: { aliases: ['descrição', 'descricao', 'histórico', 'historico'], index: 5, required: true },
    amount: { aliases: ['valor', 'saldo'], index: 9, required: true }
  }
};
