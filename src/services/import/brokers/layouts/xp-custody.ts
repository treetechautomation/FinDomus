import { LayoutSchema } from './layout-types';

export const XpCustodyLayout: LayoutSchema = {
  id: 'XP_CUSTODY_XLSX',
  broker: 'XP',
  documentType: 'CUSTODY',
  format: 'XLSX',
  version: 'v1',
  confidence: 1.0,
  sheetSignatures: ['Sua carteira'],
  sheetName: 'Sua carteira',
  stopRowAnchor: 'Dividendos',
  columns: {
    ticker: { aliases: ['produto', 'ativo', 'ticker'], index: 0, required: true },
    name: { aliases: ['produto', 'ativo', 'ticker'], index: 0, required: true },
    quantity: { aliases: ['quantidade', 'qtd'], index: 6, required: true },
    averagePrice: { aliases: ['preço médio', 'preco medio'], index: 4 },
    currentPrice: { aliases: ['preço atual', 'preco atual'], index: 5 },
    marketValue: { aliases: ['valor de mercado', 'valor atualizado', 'posição'], index: 1 }
  },
  sections: [
    {
      anchor: 'Ações',
      assetType: 'ACOES',
      tickerResolver: 'split_space'
    },
    {
      anchor: 'Tesouro Direto',
      assetType: 'TESOURO',
      tickerResolver: 'direct',
      columns: {
        quantity: { aliases: ['quantidade'], index: 4 },
        averagePrice: { aliases: ['valor aplicado'], index: 3 }
      },
      calculate: {
        averagePrice: 'applied_div_quantity'
      }
    },
    {
      anchor: 'Fundos de Investimentos',
      assetType: 'FII',
      tickerResolver: 'direct',
      columns: {
        averagePrice: { aliases: ['preço médio'], index: 5 }
      }
    },
    {
      anchor: 'Renda Fixa',
      assetType: 'RENDA_FIXA',
      tickerResolver: 'direct',
      columns: {
        averagePrice: { aliases: ['preço médio'], index: 5 }
      }
    }
  ]
};
