import type { FeatureGate, AcademyProgress } from './academy-types';

type GateConfig = {
  gate: FeatureGate;
  requiresAchievement: string | null;
  requiresLesson: number | null;
  label: string;
};

const FeatureGateConfig: GateConfig[] = [
  {
    gate: 'PATRIMONIO',
    requiresAchievement: 'first_account',
    requiresLesson: null,
    label: 'Patrimônio Líquido',
  },
  {
    gate: 'FLOW',
    requiresAchievement: 'first_import',
    requiresLesson: null,
    label: 'Fluxo de Caixa Mensal',
  },
  {
    gate: 'FORECAST',
    requiresAchievement: 'first_transaction',
    requiresLesson: null,
    label: 'Projeção de 6 meses',
  },
  {
    gate: 'FREEDOM',
    requiresAchievement: 'first_budget',
    requiresLesson: null,
    label: 'Freedom Index',
  },
  {
    gate: 'INVESTMENTS',
    requiresAchievement: 'first_investment',
    requiresLesson: null,
    label: 'Carteira de Investimentos',
  },
  {
    gate: 'TIMELINE',
    requiresAchievement: 'first_budget',
    requiresLesson: null,
    label: 'Timeline da Liberdade',
  },
  {
    gate: 'ACTIONS',
    requiresAchievement: 'first_transaction',
    requiresLesson: null,
    label: 'Plano de Ação',
  },
  {
    gate: 'AI',
    requiresAchievement: null,
    requiresLesson: 11,
    label: 'Copiloto IA',
  },
  {
    gate: 'REPORTS',
    requiresAchievement: null,
    requiresLesson: 9,
    label: 'Relatórios e DRE',
  },
];

export function getUnlockedFeatures(progress: AcademyProgress | null): FeatureGate[] {
  if (!progress) return [];

  return FeatureGateConfig
    .filter((config) => {
      if (config.requiresAchievement && !progress.achievements.includes(config.requiresAchievement)) {
        return false;
      }
      if (config.requiresLesson && !progress.completedLessons.includes(config.requiresLesson)) {
        return false;
      }
      return true;
    })
    .map((config) => config.gate);
}

export function isFeatureUnlocked(gate: FeatureGate, unlocked: FeatureGate[]): boolean {
  return unlocked.includes(gate);
}
