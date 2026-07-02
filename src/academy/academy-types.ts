export type AcademyLevel = 1 | 2 | 3 | 4 | 5;

export type KnowledgeStatus =
  | 'not_started'
  | 'learning'
  | 'learned'
  | 'mastered';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type AchievementCategory =
  | 'beginner'
  | 'organizer'
  | 'planner'
  | 'investor'
  | 'specialist';

export type FeatureGate =
  | 'PATRIMONIO'
  | 'FLOW'
  | 'FORECAST'
  | 'FREEDOM'
  | 'AI'
  | 'INVESTMENTS'
  | 'TIMELINE'
  | 'ACTIONS'
  | 'REPORTS';

export interface LessonStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string;
  order: number;
  question?: keyof typeof LessonQuestions;
}

export const LessonQuestions = {
  what: 'O que é?',
  why: 'Por que existe?',
  when: 'Quando utilizar?',
  how: 'Como utilizar?',
  interpret: 'Como interpretar?',
  improve: 'Como melhorar?',
} as const;

export interface AcademyLesson {
  id: number;
  level: AcademyLevel;
  title: string;
  subtitle: string;
  icon: string;
  mission: string | null;
  missionEvent: string | null;
  achievementId: string | null;
  steps: LessonStep[];
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  trigger: AchievementTrigger;
}

export type AchievementTrigger =
  | { type: 'lesson_completed'; lessonId: number }
  | { type: 'event'; eventType: string; source?: string }
  | { type: 'metric'; metric: string; threshold: number };

export interface KnowledgeEntry {
  conceptId: string;
  status: KnowledgeStatus;
  learnedAt: string | null;
  masteredAt: string | null;
}

export interface AcademyProgress {
  userId: string;
  currentLesson: number;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
  pausedAt: string | null;
  achievements: string[];
  completedLessons: number[];
  knowledge: KnowledgeEntry[];
  history: JourneyEntry[];
}

export interface JourneyEntry {
  type: 'lesson_completed' | 'achievement_unlocked' | 'mission_completed' | 'feature_unlocked' | 'level_up';
  icon: string;
  title: string;
  timestamp: string;
}

export interface AcademyContext {
  progress: AcademyProgress | null;
  currentLesson: AcademyLesson | null;
  currentStep: LessonStep | null;
  currentStepIdx: number;
  isActive: boolean;
  targetRect: DOMRect | null;
  level: AcademyLevel;
  unlockedFeatures: FeatureGate[];
  nextMission: { lessonId: number; mission: string; lessonTitle: string } | null;
  startAcademy: () => void;
  nextStep: () => void;
  prevStep: () => void;
  pauseAcademy: () => void;
  resumeAcademy: () => void;
  resetAcademy: () => void;
  isReady: boolean;
}
