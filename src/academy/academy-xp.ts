import type { Achievement } from './academy-types';
import { AcademyLevels } from './academy-levels';

export const XP_REWARDS: Record<string, number> = {
  create_account: 100,
  import_ofx: 150,
  create_company: 120,
  create_liability: 120,
  save_budget: 180,
  first_investment: 200,
  first_ai_chat: 150,
  complete_lesson: 100,
  detect_recurrence: 100,
  first_closure: 130,
  first_transaction: 80,
  first_report: 80,
};

export const XP_PER_LEVEL: Record<number, number> = {
  1: 0,
  2: 250,
  3: 600,
  4: 1000,
  5: 1500,
};

export function getAchievementXP(achievementId: string): number {
  const map: Record<string, number> = {
    first_step: 50,
    first_account: XP_REWARDS.create_account,
    first_import: XP_REWARDS.import_ofx,
    first_transaction: XP_REWARDS.first_transaction,
    first_closure: XP_REWARDS.first_closure,
    first_company: XP_REWARDS.create_company,
    first_liability: XP_REWARDS.create_liability,
    first_budget: XP_REWARDS.save_budget,
    first_investment: XP_REWARDS.first_investment,
    first_networth: 80,
    first_reserve: 100,
    first_ai_chat: XP_REWARDS.first_ai_chat,
    first_recurrence: XP_REWARDS.detect_recurrence,
    organizer: 300,
    master: 500,
  };
  return map[achievementId] || 0;
}

export function getLessonXP(): number {
  return XP_REWARDS.complete_lesson;
}

export function calculateTotalXP(
  completedLessons: number[],
  achievements: string[]
): number {
  let xp = completedLessons.length * getLessonXP();
  for (const id of achievements) {
    xp += getAchievementXP(id);
  }
  return xp;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let l = 5; l >= 1; l--) {
    if (xp >= XP_PER_LEVEL[l]) {
      level = l;
      break;
    }
  }
  return level;
}

export function getXPLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = currentLevel < 5 ? currentLevel + 1 : 5;
  const currentFloor = XP_PER_LEVEL[currentLevel] || 0;
  const nextFloor = XP_PER_LEVEL[nextLevel] || currentFloor + 1;
  if (nextFloor === currentFloor) return 100;
  return Math.min(100, Math.round(((xp - currentFloor) / (nextFloor - currentFloor)) * 100));
}

export function getNextLevelXP(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  if (currentLevel >= 5) return 0;
  return XP_PER_LEVEL[currentLevel + 1];
}

export function getRankName(completedLessons: number): string {
  if (completedLessons >= 12) return '👑 Mestre da Liberdade';
  if (completedLessons >= 9) return '📈 Investidor';
  if (completedLessons >= 7) return '🎯 Planejador';
  if (completedLessons >= 4) return '🏗️ Organizador';
  if (completedLessons >= 1) return '🌱 Explorador';
  return '🎓 Novato';
}

export function getLevelUpMessage(level: number): string {
  const def = AcademyLevels[level as keyof typeof AcademyLevels];
  if (!def) return '';
  switch (level) {
    case 2: return `${def.icon} LEVEL UP! Você agora é um ${def.name}. Suas contas estão organizadas — o próximo passo é dominar suas transações.`;
    case 3: return `${def.icon} LEVEL UP! Você agora é um ${def.name}. Seu orçamento está no controle e o Freedom Index já mostra seu progresso.`;
    case 4: return `${def.icon} LEVEL UP! Você agora é um ${def.name}. Seus investimentos começam a trabalhar por você. A renda passiva é o caminho.`;
    case 5: return `${def.icon} LEVEL UP! Você agora é um ${def.name} da Liberdade Financeira. Você domina o sistema. Seu dinheiro trabalha por você.`;
    default: return '';
  }
}
