export function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  return new Date(year, month - 1, 1);
}

export function addMonths(monthKey: string, amount: number) {
  const d = parseMonthKey(monthKey);

  d.setMonth(d.getMonth() + amount);

  return getCurrentMonthKey(d);
}

export function formatMonthLabel(
  monthKey: string,
  locale = 'pt-BR'
) {
  return parseMonthKey(monthKey).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

export function getTransactionMonthKey(transaction: any) {
  return (
    transaction.competenceMonthKey ||
    transaction.monthKey ||
    null
  );
}

export function isTransactionInMonth(
  transaction: any,
  monthKey: string
) {
  return getTransactionMonthKey(transaction) === monthKey;
}

export function getLastMonths(
  count: number,
  baseMonth = getCurrentMonthKey()
) {
  const months: string[] = [];

  for (let i = count - 1; i >= 0; i--) {
    months.push(addMonths(baseMonth, -i));
  }

  return months;
}

export function getMonthRange(
  startMonth: string,
  endMonth: string
) {
  const months: string[] = [];

  let current = startMonth;

  while (current <= endMonth) {
    months.push(current);
    current = addMonths(current, 1);
  }

  return months;
}
