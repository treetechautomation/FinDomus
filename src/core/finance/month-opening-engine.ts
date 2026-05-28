import { addMonths } from '@/core/finance/financial-period-engine';

export function buildMonthOpening({
  owner,
  monthKey,
  previousClosure,
}: any) {
  const previousMonth = addMonths(monthKey, -1);

  const openingBalance =
    previousClosure?.cashflow?.closingBalance || 0;

  const previousOperationalBalance =
    previousClosure?.snapshot?.kpis?.operationalBalance ??
    previousClosure?.balance ??
    0;

  return {
    owner,
    monthKey,

    previousMonth,

    openingBalance,

    previousOperationalBalance,

    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'month-opening-engine',
    },
  };
}
