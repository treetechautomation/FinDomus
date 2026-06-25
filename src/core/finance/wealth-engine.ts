import type { WealthProfile } from '@/services/firestore/planning';
import type { PFDRE } from './dre-engine';

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

export type PFWealthAnalysis = {
  pilar: string;
  metaPercent: number;
  realizadoPercent: number;
  diferencaPercent: number;
  status: 'good' | 'warning' | 'danger';
};

export type PFWealthReport = {
  analysis: PFWealthAnalysis[];
  score: number;
  scoreLabel: string;
  insights: string[];
};

export function buildPFWealthAnalysis(dre: PFDRE, profile: WealthProfile | null): PFWealthReport {
  const analysis: PFWealthAnalysis[] = [];
  let score = 100;
  const insights: string[] = [];

  const getMeta = (id: string, defaultMeta: number) => {
    const found = profile?.categories?.find((c) => c.id === id);
    return found ? found.percentage : defaultMeta;
  };

  const categoriesToCompare = [
    { pilar: "Essenciais", key: "essenciais", id: "essenciais", defaultMeta: 30, type: "expense" },
    { pilar: "Qualidade de Vida", key: "qualidadeVida", id: "qualidade", defaultMeta: 10, type: "expense" },
    { pilar: "Estilo de Vida", key: "estiloVida", id: "estilo", defaultMeta: 10, type: "expense" },
    { pilar: "Educação", key: "educacao", id: "intelectual", defaultMeta: 5, type: "expense" },
    { pilar: "Saúde", key: "saude", id: "saude", defaultMeta: 5, type: "expense" },
    { pilar: "Construção Patrimonial", key: "construcaoPatrimonial", id: "patrimonio", defaultMeta: 20, type: "investment" }
  ];

  for (const item of categoriesToCompare) {
    const metaPercent = getMeta(item.id, item.defaultMeta);
    const value = dre[item.key as keyof PFDRE] || 0;
    const realizadoPercent = dre.receitaTotal > 0 ? (value / dre.receitaTotal) * 100 : 0;
    const diferencaPercent = realizadoPercent - metaPercent;

    let status: 'good' | 'warning' | 'danger' = 'good';

    if (item.type === "expense") {
      if (realizadoPercent > metaPercent) {
        status = realizadoPercent <= metaPercent + 5 ? "warning" : "danger";
      }
    } else { // investment (Construção Patrimonial)
      if (realizadoPercent < metaPercent) {
        status = realizadoPercent >= metaPercent - 5 ? "warning" : "danger";
      }
    }

    // Penalizações do Score
    if (status === "warning") score -= 5;
    if (status === "danger") score -= 15;

    analysis.push({
      pilar: item.pilar,
      metaPercent,
      realizadoPercent: Number(realizadoPercent.toFixed(2)),
      diferencaPercent: Number(diferencaPercent.toFixed(2)),
      status
    });
  }

  // Penalização adicional por saldo de caixa negativo
  if (dre.saldoRestante < 0) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let scoreLabel = "Excelente";
  if (score < 50) scoreLabel = "Crítico";
  else if (score < 70) scoreLabel = "Atenção";
  else if (score < 90) scoreLabel = "Muito Bom";

  // Geração de insights
  analysis.forEach((item) => {
    if (item.status === "danger") {
      if (item.metaPercent > 0) {
        if (item.diferencaPercent > 0) {
          insights.push(`🚨 Você está ${item.diferencaPercent.toFixed(1)}% acima da meta planejada em ${item.pilar}.`);
        } else {
          insights.push(`📉 Seus investimentos em ${item.pilar} estão ${Math.abs(item.diferencaPercent).toFixed(1)}% abaixo da meta ideal.`);
        }
      }
    }
  });

  if (dre.saldoRestante < 0) {
    insights.push("⚠️ Seu orçamento está no vermelho neste mês. Tente reduzir despesas discricionárias.");
  }
  if (dre.taxaAcumulacao >= 30) {
    insights.push("🎉 Parabéns! Sua taxa de acumulação está excelente neste período.");
  }

  return { analysis, score, scoreLabel, insights };
}
