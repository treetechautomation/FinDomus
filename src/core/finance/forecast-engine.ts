import {
  addMonths,
  getCurrentMonthKey,
  getMonthRange,
  isTransactionInMonth,
} from '@/core/finance/financial-period-engine';

export function buildForecast({
  transactions = [],
  liabilities = [],
  recurringExpenses = [],
  taxObligations = [],
  months = 6,
  baseMonth = getCurrentMonthKey(),
}: any) {
  const monthKeys = getMonthRange(
    baseMonth,
    addMonths(baseMonth, months - 1)
  );

  const historicalMonthKeys = [
    addMonths(baseMonth, -3),
    addMonths(baseMonth, -2),
    addMonths(baseMonth, -1),
  ];

  const historicalIncomes = historicalMonthKeys.map((histMonth) => {
    return transactions
      .filter((t: any) => t.type === 'income' && isTransactionInMonth(t, histMonth))
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  });

  const historicalExpenses = historicalMonthKeys.map((histMonth) => {
    return transactions
      .filter((t: any) => t.type === 'expense' && !t.isInstallment && !t.installmentKey && isTransactionInMonth(t, histMonth))
      .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount || 0)), 0);
  });

  const averageIncome = historicalIncomes.reduce((a, b) => a + b, 0) / historicalIncomes.length;
  const averageVariableExpenses = historicalExpenses.reduce((a, b) => a + b, 0) / historicalExpenses.length;

  return monthKeys.map((monthKey) => {
    const isFuture = monthKey > baseMonth;

    const income = isFuture
      ? averageIncome
      : transactions
          .filter(
            (t: any) =>
              t.type === 'income' &&
              isTransactionInMonth(t, monthKey)
          )
          .reduce(
            (sum: number, t: any) =>
              sum + Number(t.amount || 0),
            0
          );

    const expenses = isFuture
      ? averageVariableExpenses
      : transactions
          .filter(
            (t: any) =>
              t.type === 'expense' &&
              isTransactionInMonth(t, monthKey)
          )
          .reduce(
            (sum: number, t: any) =>
              sum + Math.abs(Number(t.amount || 0)),
            0
          );

    const recurring = recurringExpenses
      .filter((r: any) => {
        if (!r.isActive) return false;

        const start =
          r.startMonthKey ||
          r.competenceMonthKey ||
          baseMonth;

        return start <= monthKey;
      })
      .reduce(
        (sum: number, r: any) =>
          sum + Number(r.amount || 0),
        0
      );

    const liabilitiesMonth = liabilities
      .filter((l: any) => {
        const start =
          l.competenceMonthKey ||
          baseMonth;

        const remaining = Number(
          l.remainingInstallments || 0
        );

        if (remaining <= 0) return false;

        const monthsCovered = getMonthRange(
          start,
          addMonths(start, remaining - 1)
        );

        return monthsCovered.includes(monthKey);
      })
      .reduce(
        (sum: number, l: any) =>
          sum + Number(l.installmentValue || 0),
        0
      );

    const taxes = taxObligations
      .filter(
        (o: any) =>
          (o.competenceMonthKey || o.monthKey) === monthKey
      )
      .reduce(
        (sum: number, o: any) =>
          sum + Number(o.amount || 0),
        0
      );

    const projectedOutflow =
      expenses +
      recurring +
      liabilitiesMonth +
      taxes;

    return {
      monthKey,
      income,
      expenses,
      recurring,
      liabilities: liabilitiesMonth,
      taxes,
      projectedOutflow,
      projectedBalance:
        income - projectedOutflow,
    };
  });
}
