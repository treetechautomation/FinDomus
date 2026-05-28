export type WealthCategory = {
  id: string;
  name: string;
  percentage: number;
  color: string;
  categories?: string[];
};

export const defaultWealthCategories: WealthCategory[] = [
  {
    id: 'essenciais',
    name: 'Essenciais',
    percentage: 30,
    color: '#38bdf8',
    categories: [
      'Moradia (aluguel, condomínio)',
      'Aluguel',
      'Condomínio',
      'Energia',
      'Água',
      'Gás',
      'Internet',
      'Telefone',
      'Alimentação',
      'Mercado',
      'Supermercado',
      'Transporte',
      'Combustível',
      'Farmácia',
      'Impostos',
      'Dívidas / Empréstimos',
    ],
  },
  {
    id: 'qualidade',
    name: 'Qualidade de vida',
    percentage: 10,
    color: '#34d399',
    categories: [
      'Saúde',
      'Plano de saúde',
      'Academia',
      'Bem-estar',
      'Seguros',
      'Terapia',
      'Medicamentos',
      'Pet',
    ],
  },
  {
    id: 'patrimonio',
    name: 'Construção de patrimônio',
    percentage: 20,
    color: '#facc15',
    categories: [
      'Investimentos (aporte)',
      'Reserva de emergência',
      'Aporte',
      'Previdência',
      'Compra de ativos',
      'Consórcio',
    ],
  },
  {
    id: 'estilo',
    name: 'Estilo de vida',
    percentage: 10,
    color: '#e879f9',
    categories: [
      'Lazer',
      'Compras',
      'Restaurante',
      'Viagem',
      'Assinaturas (Netflix, Spotify etc.)',
      'Presentes',
      'Vestuário',
      'Beleza',
      'Dízimo',
      'Doações',
    ],
  },
  {
    id: 'independencia',
    name: 'Independência financeira',
    percentage: 25,
    color: '#60a5fa',
    categories: [
      'Investimentos (rendimentos)',
      'Dividendos',
      'Juros',
      'Renda passiva',
      'Aluguéis recebidos',
    ],
  },
  {
    id: 'intelectual',
    name: 'Capital intelectual',
    percentage: 5,
    color: '#fb923c',
    categories: [
      'Educação',
      'Cursos',
      'Livros',
      'Mentoria',
      'Eventos',
      'Certificações',
      'Material escolar',
    ],
  },
];

export function getDistributionTotal(categories: WealthCategory[]) {
  return categories.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
}

export function getWealthInsight(categories: WealthCategory[]) {
  const total = getDistributionTotal(categories);
  const patrimonio = categories.find((c) => c.id.includes('patrimonio'))?.percentage || 0;
  const independencia = categories.find((c) => c.id.includes('independencia'))?.percentage || 0;
  const essenciais = categories.find((c) => c.id.includes('essenciais'))?.percentage || 0;

  if (total !== 100) return 'A distribuição precisa fechar exatamente 100% para salvar a estratégia.';
  if (patrimonio + independencia < 30) return 'Baixa prioridade para construção de patrimônio. Considere aumentar a alocação de crescimento.';
  if (essenciais > 60) return 'Essenciais muito altos podem limitar sua capacidade de investir e formar patrimônio.';
  return 'Estratégia equilibrada entre proteção, qualidade de vida e crescimento patrimonial.';
}


export function getWealthRecommendation(rows: any[]) {
  const alerts: string[] = [];

  rows.forEach((item) => {
    if (item.status === 'Estourou') {
      alerts.push(`🚨 ${item.name} estourou o limite em ${Math.abs(item.remaining).toFixed(0)}`);
    }

    if (item.name.toLowerCase().includes('invest') && item.spent < item.planned) {
      alerts.push(`📈 Você investiu menos que o planejado em ${item.name}`);
    }
  });

  if (!alerts.length) {
    return '✅ Tudo dentro do planejado. Continue assim.';
  }

  return alerts.join('\n');
}
