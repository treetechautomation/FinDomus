import { parseMonthKey, addMonths } from '@/core/finance/financial-period-engine';
import { type Liability } from '@/services/firestore/liabilities';

export function getRemainingInstallments(item: Liability) {
  return (
    Number((item as any).remainingInstallments ?? 0) ||
    Math.max(
      Number(item.totalInstallments || 0) -
        Number(item.currentInstallment || 0),
      0
    )
  );
}

export function getProjectionStartMonth(baseMonthKey: string) {
  const startMonthKey = addMonths(baseMonthKey, 1);
  return parseMonthKey(startMonthKey);
}

export function buildMonthlyProjection(liabilities: Liability[], baseMonthKey: string) {
  const map: Record<string, number> = {};
  const now = getProjectionStartMonth(baseMonthKey);

  liabilities.forEach((item) => {
    const remaining = getRemainingInstallments(item);

    for (let i = 0; i < remaining; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);

      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      map[key] = (map[key] || 0) + Number(item.installmentValue || 0);
    }
  });

  return map;
}

export function buildProjectionTimeline(liabilities: Liability[], baseMonthKey: string) {
  const map: Record<
    string,
    Array<{ name: string; value: number; institution: string }>
  > = {};
  const now = getProjectionStartMonth(baseMonthKey);

  liabilities.forEach((item) => {
    const remaining = getRemainingInstallments(item);

    for (let i = 0; i < remaining; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);

      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!map[key]) map[key] = [];

      map[key].push({
        name: item.name,
        value: Number(item.installmentValue || 0),
        institution: item.institution,
      });
    }
  });

  return map;
}
