type AccountLike = {
  owner?: 'PF' | 'PJ';
  balance?: number;
};

type TaxObligationLike = {
  id?: string;
  companyId?: string;
  name?: string;
  dueDate?: string;
  value?: number;
  status?: 'pending' | 'paid';
};

export type CashflowProjectionItem = {
  date: string;
  label: string;
  type: 'current' | 'outflow' | 'inflow';
  amount: number;
  projectedBalance: number;
};

function toISODate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCashflowProjection(
  accounts: AccountLike[],
  taxObligations: TaxObligationLike[],
  liabilities: any[] = [],
  options?: { days?: number; owner?: 'PF' | 'PJ' | 'ALL' }
) {
  const days = options?.days ?? 30;
  const owner = options?.owner ?? 'PJ';

  const today = new Date();
  const todayISO = toISODate(today);
  const limitISO = toISODate(addDays(today, days));

  const currentBalance = accounts
    .filter((account) => owner === 'ALL' || account.owner === owner)
    .reduce((sum, account) => sum + Number(account.balance || 0), 0);

  const futureTaxes = taxObligations
    .filter((item) => item.status === 'pending')
    .filter((item) => Boolean(item.dueDate))
    .filter((item) => {
      const dueDate = String(item.dueDate).slice(0, 10);
      return dueDate >= todayISO && dueDate <= limitISO;
    })
    .map((item) => ({
      date: String(item.dueDate).slice(0, 10),
      label: item.name || 'Obrigação fiscal',
      type: 'outflow' as const,
      amount: Math.abs(Number(item.value || 0)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ===== PASSIVOS =====
const futureLiabilities = liabilities.flatMap((item) => {
  const remaining = Math.max(0, (item.totalInstallments || 0) - (item.currentInstallment || 0));

  const events = [];

  for (let i = 1; i <= remaining; i++) {
    const date = addDays(today, i * 30);

    const iso = toISODate(date);

    if (iso > limitISO) continue;

    events.push({
      date: iso,
      label: item.name || 'Parcela',
      type: 'outflow',
      amount: Math.abs(Number(item.installmentValue || 0)),
    });
  }

  return events;
});

const events = [...futureTaxes, ...futureLiabilities]
  .sort((a, b) => a.date.localeCompare(b.date));

let projectedBalance = currentBalance;

  const items: CashflowProjectionItem[] = [
    {
      date: todayISO,
      label: 'Saldo atual',
      type: 'current',
      amount: currentBalance,
      projectedBalance: currentBalance,
    },
  ];

  for (const event of events) {
    projectedBalance -= event.amount;

    items.push({
      ...event,
      type: event.type as 'inflow' | 'outflow' | 'current',
      projectedBalance,
    });
  }

  const lowestBalance = items.reduce(
    (lowest, item) => Math.min(lowest, item.projectedBalance),
    currentBalance
  );

  const totalOutflow = events.reduce((sum, item) => sum + item.amount, 0);

  return {
    days,
    currentBalance,
    projectedBalance,
    lowestBalance,
    totalOutflow,
    hasRisk: lowestBalance < 0,
    items,
  };
}
