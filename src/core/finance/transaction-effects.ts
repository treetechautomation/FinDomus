export interface FinancialEffectPayload {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  isRefund?: boolean;
}

export function getExpenseEffect(tx: FinancialEffectPayload): number {
  if (tx.type === 'transfer') return 0;
  if (tx.type === 'income') return 0; // Not handling income refund yet
  if (tx.type === 'expense') {
    return tx.isRefund ? -Math.abs(tx.amount) : Math.abs(tx.amount);
  }
  return 0;
}

export function getIncomeEffect(tx: FinancialEffectPayload): number {
  if (tx.type === 'transfer') return 0;
  if (tx.type === 'expense') return 0;
  if (tx.type === 'income') {
    return Math.abs(tx.amount);
  }
  return 0;
}

export function getNetEffect(tx: FinancialEffectPayload): number {
  return getIncomeEffect(tx) - getExpenseEffect(tx);
}
