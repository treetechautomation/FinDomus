import type { PersonalTransaction, Budget, Investment, Liability, AssetAllocation, MonthlyFlow } from './types';

export const personalTransactions: PersonalTransaction[] = [
  { id: '1', date: '2024-07-28', description: 'Supermercado', amount: -450.70, type: 'expense', category: 'Alimentação' },
  { id: '2', date: '2024-07-27', description: 'Restaurante', amount: -120.00, type: 'expense', category: 'Lazer' },
  { id: '3', date: '2024-07-26', description: 'Gasolina', amount: -180.00, type: 'expense', category: 'Transporte' },
  { id: '4', date: '2024-07-25', description: 'Salário', amount: 8000, type: 'income', category: 'Salário' },
  { id: '5', date: '2024-07-24', description: 'Cinema', amount: -75.00, type: 'expense', category: 'Lazer' },
  { id: '6', date: '2024-07-23', description: 'Freelance', amount: 1200, type: 'income', category: 'Renda Extra' },
];

export const personalBudget: Budget[] = [
    { category: 'Alimentação', planned: 1600, spent: 1350.70 },
    { category: 'Transporte', planned: 500, spent: 480.00 },
    { category: 'Moradia', planned: 2500, spent: 2500.00 },
    { category: 'Lazer', planned: 800, spent: 680.50 },
    { category: 'Saúde', planned: 400, spent: 150.00 },
];

export const investments: Investment[] = [
  { id: '1', type: 'Reserva de Emergência', objective: 'Segurança', currentValue: 50000, contributions: 50000, liquidity: 'D+0', institution: 'Banco Principal', goal: 50000 },
  { id: '2', type: 'CDB', objective: 'Aposentadoria', currentValue: 150000, contributions: 120000, liquidity: 'D+730', institution: 'Corretora XP', goal: 1000000 },
  { id: '3', type: 'Ações', objective: 'Crescimento', currentValue: 250000, contributions: 180000, liquidity: 'D+2', institution: 'Corretora XP' },
  { id: '4', type: 'Fundos', objective: 'Diversificação', currentValue: 80000, contributions: 75000, liquidity: 'D+30', institution: 'Corretora Rico' },
];

export const liabilities: Liability[] = [
  { id: '1', name: 'Financiamento Imobiliário', type: 'Financiamento', installmentValue: 2800, currentInstallment: 60, totalInstallments: 360, remainingBalance: 550000, institution: 'Banco Principal' },
  { id: '2', name: 'Financiamento Veículo', type: 'Financiamento', installmentValue: 1200, currentInstallment: 12, totalInstallments: 48, remainingBalance: 43200, institution: 'Banco da Família' },
  { id: '3', name: 'Fatura Cartão', type: 'Cartão', installmentValue: 3500, currentInstallment: 1, totalInstallments: 1, remainingBalance: 3500, institution: 'Nubank' },
];

export const assetAllocation: AssetAllocation[] = [
  { name: 'Renda Fixa', value: 450000, fill: 'var(--color-Renda-Fixa)' },
  { name: 'Renda Variável', value: 700000, fill: 'var(--color-Renda-Variável)' },
  { name: 'Imóveis', value: 800000, fill: 'var(--color-Imóveis)' },
  { name: 'Contas', value: 50000, fill: 'var(--color-Contas)' },
];

export const monthlyFlow: MonthlyFlow[] = [
  { month: "Fev", income: 15000, expenses: 8000 },
  { month: "Mar", income: 16500, expenses: 9500 },
  { month: "Abr", income: 14000, expenses: 8500 },
  { month: "Mai", income: 18000, expenses: 10000 },
  { month: "Jun", income: 17500, expenses: 9000 },
  { month: "Jul", income: 20000, expenses: 11500 },
];


export const companies = [
  { id: 'empresa-1', name: 'Minha Empresa LTDA' },
  { id: 'empresa-2', name: 'Consultoria ABC' }
];

export const companyTransactions = [
  { id: '1', companyId: 'empresa-1', description: 'Venda Serviço', amount: 8000, type: 'income', date: '2024-07-01' },
  { id: '2', companyId: 'empresa-1', description: 'Aluguel Escritório', amount: -2500, type: 'expense', date: '2024-07-05' },
  { id: '3', companyId: 'empresa-2', description: 'Consultoria', amount: 15000, type: 'income', date: '2024-07-10' },
  { id: '4', companyId: 'empresa-2', description: 'Software SaaS', amount: -1500, type: 'expense', date: '2024-07-08' },
];

export const payables = [
  { id: 'p1', companyId: 'empresa-1', description: 'Aluguel', value: 2500, dueDate: '2024-08-05' }
];

export const receivables = [
  { id: 'r1', companyId: 'empresa-1', description: 'Cliente A', value: 8000, dueDate: '2024-08-20' }
];
