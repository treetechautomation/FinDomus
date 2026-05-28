import { getMonthlyClosure } from './monthly-closures';

export async function assertMonthOpen(
  owner: 'PF' | 'PJ',
  competenceMonthKey?: string | null
) {
  if (!competenceMonthKey) return;

  const closure = await getMonthlyClosure(
    owner,
    competenceMonthKey
  );

  if (closure?.status === 'CLOSED') {
    throw new Error(
      `Competência ${competenceMonthKey} está fechada.`
    );
  }
}
