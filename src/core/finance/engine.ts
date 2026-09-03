import { assetAllocation, liabilities, personalTransactions } from '@/lib/data';
import { getExpenseEffect, getIncomeEffect, type FinancialEffectPayload } from './transaction-effects';

export function calculateTotalAssets() {
  return assetAllocation.reduce((total, asset) => total + asset.value, 0);
}

export function calculateTotalLiabilities() {
  return liabilities.reduce((total, liability) => total + liability.remainingBalance, 0);
}

export function calculateMonthlyBalance() {
  const income = personalTransactions.reduce((sum, transaction) => sum + getIncomeEffect(transaction as FinancialEffectPayload), 0);

  const expenses = personalTransactions.reduce((sum, transaction) => sum + getExpenseEffect(transaction as FinancialEffectPayload), 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}

export function calculateNetWorth() {
  return calculateTotalAssets() - calculateTotalLiabilities();
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
