import { AcademyLessons, getLessonById } from './academy-lessons';
import { academyStorage } from './academy-storage';
import { getUnlockedFeatures } from './academy-feature-gates';
import { getLevelForLesson, AcademyLevels } from './academy-levels';
import { getNextMission, checkAchievements } from './academy-events';
import type { AcademyLevel, AcademyProgress, FeatureGate, JourneyEntry, KnowledgeEntry } from './academy-types';

export { AcademyLevels, getLevelForLesson, getLessonById, AcademyLessons };
export { academyStorage };
export { getUnlockedFeatures };
export { getNextMission };
export type { AcademyLevel, AcademyProgress, FeatureGate, JourneyEntry, KnowledgeEntry };

export function createDefaultProgress(userId: string): AcademyProgress {
  return {
    userId,
    currentLesson: 1,
    currentStep: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    pausedAt: null,
    achievements: [],
    completedLessons: [],
    knowledge: [],
    history: [{
      type: 'lesson_completed',
      icon: '🌟',
      title: 'Jornada iniciada',
      timestamp: new Date().toISOString(),
    }],
  };
}

export async function getOrCreateProgress(userId: string): Promise<AcademyProgress> {
  const existing = await academyStorage.load(userId);
  if (existing) return existing;

  const fresh = createDefaultProgress(userId);
  await academyStorage.save(userId, fresh);
  return fresh;
}

export function getLevel(progress: AcademyProgress): AcademyLevel {
  const lastCompleted = progress.completedLessons.length > 0
    ? Math.max(...progress.completedLessons)
    : 0;
  return getLevelForLesson(lastCompleted || 1);
}

export function getTotalProgress(completedLessons: number[]): number {
  return Math.round((completedLessons.length / AcademyLessons.length) * 100);
}

export async function completeLesson(
  userId: string,
  lessonId: number
): Promise<AcademyProgress | null> {
  const progress = await academyStorage.load(userId);
  if (!progress) return null;

  if (progress.completedLessons.includes(lessonId)) return progress;

  const completedLessons = [...progress.completedLessons, lessonId];
  const entry: JourneyEntry = {
    type: 'lesson_completed',
    icon: getLessonById(lessonId)?.icon || '📚',
    title: getLessonById(lessonId)?.title || `Aula ${lessonId}`,
    timestamp: new Date().toISOString(),
  };

  const isAcademyComplete = completedLessons.length >= AcademyLessons.length;

  await academyStorage.save(userId, {
    completedLessons,
    currentLesson: isAcademyComplete ? 1 : lessonId + 1,
    currentStep: 0,
    completedAt: isAcademyComplete ? new Date().toISOString() : null,
    history: [...progress.history, entry],
  });

  return academyStorage.load(userId);
}

export async function updateKnowledge(
  userId: string,
  conceptId: string,
  status: 'learning' | 'learned' | 'mastered'
): Promise<void> {
  const progress = await academyStorage.load(userId);
  if (!progress) return;

  const existing = progress.knowledge.find((k) => k.conceptId === conceptId);
  const updated: KnowledgeEntry = existing
    ? {
        ...existing,
        status,
        learnedAt: status === 'learned' && !existing.learnedAt ? new Date().toISOString() : existing.learnedAt,
        masteredAt: status === 'mastered' ? new Date().toISOString() : existing.masteredAt,
      }
    : {
        conceptId,
        status,
        learnedAt: status === 'learned' ? new Date().toISOString() : null,
        masteredAt: status === 'mastered' ? new Date().toISOString() : null,
      };

  const knowledge = existing
    ? progress.knowledge.map((k) => (k.conceptId === conceptId ? updated : k))
    : [...progress.knowledge, updated];

  await academyStorage.save(userId, { knowledge });
}
