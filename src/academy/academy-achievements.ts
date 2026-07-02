import type { Achievement, AchievementTier } from './academy-types';

export const AcademyAchievements: Achievement[] = [
  // ── 🌱 Iniciante ──
  {
    id: 'first_step',
    icon: '🌟',
    title: 'Primeiro Passo',
    description: 'Você iniciou sua jornada rumo à liberdade financeira.',
    category: 'beginner',
    tier: 'bronze',
    trigger: { type: 'lesson_completed', lessonId: 1 },
  },
  {
    id: 'first_account',
    icon: '🏦',
    title: 'Primeira Conta',
    description: 'Sua primeira conta bancária foi cadastrada.',
    category: 'beginner',
    tier: 'bronze',
    trigger: { type: 'event', eventType: 'account:updated', source: 'addAccount' },
  },
  {
    id: 'first_import',
    icon: '📥',
    title: 'Primeira Importação',
    description: 'Seu primeiro extrato foi importado com sucesso.',
    category: 'beginner',
    tier: 'silver',
    trigger: { type: 'event', eventType: 'transaction:created', source: 'addTransactionsBatch' },
  },
  // ── 🏗️ Organizador ──
  {
    id: 'first_transaction',
    icon: '💰',
    title: 'Primeiro Lançamento',
    description: 'Você criou seu primeiro lançamento manual.',
    category: 'organizer',
    tier: 'bronze',
    trigger: { type: 'event', eventType: 'transaction:created', source: 'addTransaction' },
  },
  {
    id: 'first_closure',
    icon: '🔒',
    title: 'Primeiro Fechamento',
    description: 'Você fechou seu primeiro mês financeiro.',
    category: 'organizer',
    tier: 'silver',
    trigger: { type: 'event', eventType: 'month:closed' },
  },
  {
    id: 'first_company',
    icon: '🏢',
    title: 'Primeira Empresa',
    description: 'Sua primeira empresa foi cadastrada no sistema.',
    category: 'organizer',
    tier: 'bronze',
    trigger: { type: 'event', eventType: 'data:changed', source: 'addCompany' },
  },
  {
    id: 'first_liability',
    icon: '📊',
    title: 'Primeiro Passivo',
    description: 'Você cadastrou seu primeiro passivo financeiro.',
    category: 'organizer',
    tier: 'bronze',
    trigger: { type: 'event', eventType: 'liability:created' },
  },
  // ── 🎯 Planejador ──
  {
    id: 'first_budget',
    icon: '🎯',
    title: 'Primeiro Orçamento',
    description: 'Seu primeiro orçamento foi salvo com sucesso.',
    category: 'planner',
    tier: 'silver',
    trigger: { type: 'event', eventType: 'planning:updated' },
  },
  // ── 📈 Investidor ──
  {
    id: 'first_investment',
    icon: '📈',
    title: 'Primeiro Investimento',
    description: 'Seu primeiro investimento foi registrado na carteira.',
    category: 'investor',
    tier: 'silver',
    trigger: { type: 'event', eventType: 'investment:created' },
  },
  {
    id: 'first_networth',
    icon: '💎',
    title: 'Patrimônio Positivo',
    description: 'Seu patrimônio líquido está no azul.',
    category: 'investor',
    tier: 'gold',
    trigger: { type: 'metric', metric: 'netWorth', threshold: 1 },
  },
  {
    id: 'first_reserve',
    icon: '🏦',
    title: 'Reserva Iniciada',
    description: 'Sua reserva de emergência cobre pelo menos 1 mês.',
    category: 'investor',
    tier: 'gold',
    trigger: { type: 'metric', metric: 'coveredMonths', threshold: 1 },
  },
  // ── 👑 Especialista ──
  {
    id: 'first_ai_chat',
    icon: '🤖',
    title: 'Primeira Conversa com IA',
    description: 'Você conversou com seu Copiloto Financeiro.',
    category: 'specialist',
    tier: 'bronze',
    trigger: { type: 'event', eventType: 'ai:chat' },
  },
  {
    id: 'first_recurrence',
    icon: '🔄',
    title: 'Recorrência Detectada',
    description: 'A IA detectou sua primeira despesa recorrente.',
    category: 'specialist',
    tier: 'silver',
    trigger: { type: 'event', eventType: 'recurring:updated' },
  },
  {
    id: 'organizer',
    icon: '⭐',
    title: 'Organizador Financeiro',
    description: 'Todas as 12 aulas da Academia foram concluídas.',
    category: 'specialist',
    tier: 'gold',
    trigger: { type: 'metric', metric: 'completedLessons', threshold: 12 },
  },
  {
    id: 'master',
    icon: '👑',
    title: 'Mestre da Liberdade Financeira',
    description: 'Todas as conquistas foram desbloqueadas.',
    category: 'specialist',
    tier: 'diamond',
    trigger: { type: 'metric', metric: 'allAchievements', threshold: 14 },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return AcademyAchievements.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: string): Achievement[] {
  return AcademyAchievements.filter((a) => a.category === category);
}

export function getTierLabel(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze': return '🥉 Bronze';
    case 'silver': return '🥈 Prata';
    case 'gold': return '🥇 Ouro';
    case 'diamond': return '💎 Diamante';
  }
}
