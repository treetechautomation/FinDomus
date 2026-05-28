import { assetAllocation, liabilities, personalTransactions } from '@/lib/data';

export function calculateTotalAssets() {
  return assetAllocation.reduce((total, asset) => total + asset.value, 0);
}

export function calculateTotalLiabilities() {
  return liabilities.reduce((total, liability) => total + liability.remainingBalance, 0);
}

export function calculateMonthlyBalance() {
  const income = personalTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = personalTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

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
