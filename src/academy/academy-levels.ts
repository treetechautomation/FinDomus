import type { AcademyLevel } from './academy-types';

export interface LevelDefinition {
  level: AcademyLevel;
  name: string;
  icon: string;
  description: string;
  lessons: number[];
  requiredAchievements: string[];
  aiTone: 'simple' | 'detailed' | 'expert';
}

export const AcademyLevels: Record<AcademyLevel, LevelDefinition> = {
  1: {
    level: 1,
    name: 'Explorador Financeiro',
    icon: '🌱',
    description: 'Descobre o FinDomus e aprende os conceitos básicos de liberdade financeira.',
    lessons: [1, 2, 3],
    requiredAchievements: [],
    aiTone: 'simple',
  },
  2: {
    level: 2,
    name: 'Organizador',
    icon: '🏗️',
    description: 'Organiza contas, importa extratos e gerencia suas transações.',
    lessons: [4, 5, 6],
    requiredAchievements: ['first_account', 'first_import'],
    aiTone: 'simple',
  },
  3: {
    level: 3,
    name: 'Planejador',
    icon: '🎯',
    description: 'Domina orçamento, metas e descobre o Freedom Index.',
    lessons: [7],
    requiredAchievements: ['first_transaction', 'first_closure'],
    aiTone: 'detailed',
  },
  4: {
    level: 4,
    name: 'Investidor',
    icon: '📈',
    description: 'Aprende sobre patrimônio, renda passiva e investimentos.',
    lessons: [8],
    requiredAchievements: ['first_budget'],
    aiTone: 'detailed',
  },
  5: {
    level: 5,
    name: 'Mestre da Liberdade Financeira',
    icon: '👑',
    description: 'Usa IA, interpreta indicadores e domina todo o sistema.',
    lessons: [9, 10, 11, 12],
    requiredAchievements: ['first_investment'],
    aiTone: 'expert',
  },
};

export function getLevelForLesson(lessonId: number): AcademyLevel {
  for (const [level, def] of Object.entries(AcademyLevels)) {
    if (def.lessons.includes(lessonId)) return Number(level) as AcademyLevel;
  }
  return 1;
}

export function getLevelProgress(level: AcademyLevel, completedLessons: number[]): number {
  const def = AcademyLevels[level];
  if (!def) return 0;
  const completed = def.lessons.filter((l) => completedLessons.includes(l)).length;
  return Math.round((completed / def.lessons.length) * 100);
}
