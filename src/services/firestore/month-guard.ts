import { getMonthlyClosure } from './monthly-closures';

export async function assertMonthOpen(
  userId: string,
  owner: 'PF' | 'PJ',
  competenceMonthKey?: string | null
) {
  if (!competenceMonthKey || !userId) return;

  const closure = await getMonthlyClosure(
    userId,
    owner,
    competenceMonthKey
  );

  if (closure?.status === 'CLOSED') {
    throw new Error(
      `Competência ${competenceMonthKey} está fechada.`
    );
  }
}
