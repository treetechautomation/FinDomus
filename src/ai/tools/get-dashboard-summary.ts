import { getDashboardAdmin } from '../../services/firestore/dashboard.admin';

/**
 * Ferramenta para obter o resumo consolidado do dashboard financeiro.
 * Foco em leitura segura (Read-only) e multi-tenant.
 */
export async function getDashboardSummary(userId: string) {
  if (!userId) {
    throw new Error('userId é obrigatório para acessar o dashboard.');
  }

  try {
    const data = await getDashboardAdmin(userId);

    // Formatação estruturada simples para a IA
    return {
      patrimonio: {
        total: data.total,
        pessoal: data.totalPF,
        business: data.totalPJ,
      },
      mensal: {
        receitas: data.monthly.income,
        despesas: data.monthly.expenses,
        resultado: data.monthly.balance,
      },
      alocacao: data.allocation.map(a => ({
        tipo: a.name,
        valor: a.value
      })),
      alertas: {
        caixaBaixo: data.total < 0,
        prejuizoMensal: data.monthly.balance < 0,
      }
    };
  } catch (error: any) {
    console.error('Erro ao buscar resumo do dashboard para IA:', error.message);
    throw new Error('Não foi possível obter os dados do dashboard.');
  }
}
